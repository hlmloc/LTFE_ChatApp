import type { Message } from "../types/message";

const PREFIX = "LTFE_CHAT_V1:";

export type ReplyTarget = {
    author: string;
    text: string;
    messageId?: string;
};
export type ImageAttachment = {
    kind: "image";
    url: string;
    name: string;
    mimeType: string;
    size: number;
};

type Packet =
    | {
    kind: "message";
    messageId: string;
    format: "text";
    text: string;
    replyTo?: ReplyTarget;
}
    | {
    kind: "attachment";
    messageId: string;
    attachment: ImageAttachment;
    replyTo?: ReplyTarget;
}
    | { kind: "edit"; eventId: string; targetId: string; text: string }
    | { kind: "recall"; eventId: string; targetId: string };

export type DisplayMessage = Message & {
    messageId?: string;
    edited?: boolean;
    recalled?: boolean;
    replyTo?: ReplyTarget;
    attachment?: ImageAttachment;
};

export function getEditTargetId(message: DisplayMessage): string | undefined {
    if (message.messageId) return message.messageId;
    if (Number.isSafeInteger(message.id) && message.id > 0) {
        return `legacy:${message.id}`;
    }
}

export function encodeMessage(packet: Packet): string {
    return PREFIX + JSON.stringify(packet).replace(
        /[\uD800-\uDFFF]/g,
        char => "\\u" + char.charCodeAt(0).toString(16).padStart(4, "0")
    );
}


export function decodeMessage(mes: string): Packet | null {
    if (!mes.startsWith(PREFIX)) return null;

    try {
        const packet = JSON.parse(mes.slice(PREFIX.length));

        // Tin nhắn gỡ
        if (
            packet?.kind === "recall" &&
            typeof packet.eventId === "string" && packet.eventId &&
            typeof packet.targetId === "string" && packet.targetId
        ) {
            return packet;
        }

        // Tin nhắn hình ảnh
        if (packet?.kind === "attachment") {
            const attachment = packet.attachment;

            if (
                typeof packet.messageId === "string" &&
                packet.messageId &&
                attachment?.kind === "image" &&
                typeof attachment.url === "string" &&
                attachment.url.startsWith("https://") &&
                typeof attachment.name === "string" &&
                typeof attachment.mimeType === "string" &&
                attachment.mimeType.startsWith("image/") &&
                typeof attachment.size === "number" &&
                Number.isFinite(attachment.size) &&
                attachment.size >= 0
            ) {
                const reply = packet.replyTo;
                const replyTo =
                    typeof reply?.author === "string" &&
                    typeof reply.text === "string"
                        ? {
                            author: reply.author,
                            text: reply.text,
                            messageId:
                                typeof reply.messageId === "string"
                                    ? reply.messageId
                                    : undefined,
                        }
                        : undefined;

                return {
                    ...packet,
                    attachment,
                    replyTo,
                };
            }

            return null;
        }

        // Tin nhắn chữ và chỉnh sửa
        if (typeof packet?.text !== "string") return null;

        if (
            packet.kind === "message" &&
            packet.format === "text" &&
            typeof packet.messageId === "string" &&
            packet.messageId
        ) {
            const reply = packet.replyTo;
            const replyTo =
                typeof reply?.author === "string" &&
                typeof reply.text === "string"
                    ? {
                        author: reply.author,
                        text: reply.text,
                        messageId:
                            typeof reply.messageId === "string"
                                ? reply.messageId
                                : undefined,
                    }
                    : undefined;

            return { ...packet, replyTo };
        }

        if (
            packet.kind === "edit" &&
            typeof packet.eventId === "string" &&
            packet.eventId &&
            typeof packet.targetId === "string" &&
            packet.targetId &&
            packet.text.trim()
        ) {
            return packet;
        }
    } catch {
        // Tin cũ có thể là văn bản bất kỳ.
    }

    return null;
}

export function resolveMessages(records: Message[]): DisplayMessage[] {
    const messages: DisplayMessage[] = [];
    const edits = new Map<string, string>();
    const recalls = new Set<string>();
    const recalledText = "Tin nhắn đã được gỡ";
    const processed = new Set<string>();

    for (const record of records) {
        const packet = decodeMessage(record.mes);

        if (!packet) {
            messages.push(record);
            continue;
        }

        const id =
            packet.kind === "edit" || packet.kind === "recall"
                ? packet.eventId
                : packet.messageId;
        const key = JSON.stringify([record.name, packet.kind, id]);

        if (processed.has(key)) continue;
        processed.add(key);

        if (packet.kind === "edit") {
            edits.set(JSON.stringify([record.name, packet.targetId]), packet.text);
        } else if (packet.kind === "recall") {
            recalls.add(JSON.stringify([record.name, packet.targetId]));
        } else if (packet.kind === "attachment") {
            messages.push({
                ...record,
                messageId: packet.messageId,
                attachment: packet.attachment,
                replyTo: packet.replyTo,
            });
        } else {
            messages.push({
                ...record,
                messageId: packet.messageId,
                mes: packet.text,
                replyTo: packet.replyTo,
            });
        }
    }

    return messages.map(message => {
        const targetId = getEditTargetId(message);
        if (!targetId) return message;

        const key = JSON.stringify([message.name, targetId]);
        if (message.messageId && recalls.has(key)) {
            return { ...message, mes: recalledText, recalled: true, replyTo: undefined, attachment: undefined, };
        }

        const reply = message.replyTo;
        const replyTo = reply?.messageId && recalls.has(JSON.stringify([reply.author, reply.messageId]))
            ? { ...reply, text: recalledText }
            : reply;
        const editedText = edits.get(key);

        return editedText === undefined && replyTo === reply
            ? message
            : { ...message, mes: editedText ?? message.mes, edited: editedText !== undefined, replyTo };
    });
}
