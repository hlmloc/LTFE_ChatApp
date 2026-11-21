import type { Message } from "../types/message";

const PREFIX = "LTFE_CHAT_V1:";

type Packet =
    | {
    kind: "message";
    messageId: string;
    format: "text";
    text: string;
}
    | {
    kind: "edit";
    eventId: string;
    targetId: string;
    text: string;
};

export type DisplayMessage = Message & {
    messageId?: string;
    edited?: boolean;
};

export function encodeMessage(packet: Packet): string {
    return PREFIX + JSON.stringify(packet);
}

export function decodeMessage(mes: string): Packet | null {
    if (!mes.startsWith(PREFIX)) return null;

    try {
        const packet = JSON.parse(mes.slice(PREFIX.length));
        if (typeof packet?.text !== "string") return null;

        if (
            packet.kind === "message" &&
            packet.format === "text" &&
            typeof packet.messageId === "string" &&
            packet.messageId
        ) {
            return packet;
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
    const processed = new Set<string>();

    for (const record of records) {
        const packet = decodeMessage(record.mes);

        if (!packet) {
            messages.push(record);
            continue;
        }

        const id = packet.kind === "message" ? packet.messageId : packet.eventId;
        const key = JSON.stringify([record.name, packet.kind, id]);

        if (processed.has(key)) continue;
        processed.add(key);

        if (packet.kind === "edit") {
            const targetKey = JSON.stringify([record.name, packet.targetId]);
            edits.set(targetKey, packet.text);
        } else {
            messages.push({
                ...record,
                messageId: packet.messageId,
                mes: packet.text,
            });
        }
    }

    return messages.map(message => {
        if (!message.messageId) return message;

        const key = JSON.stringify([message.name, message.messageId]);
        const editedText = edits.get(key);

        return editedText === undefined
            ? message
            : { ...message, mes: editedText, edited: true };
    });
}