import type { DisplayMessage } from "./messageProtocol";
import { parseStickerMessage } from "./stickers";

function normalize(value: string) {
    return value.normalize("NFC").toLocaleLowerCase("vi");
}

export function matchesMessage(message: DisplayMessage, query: string): boolean {
    if (message.recalled || message.attachment || parseStickerMessage(message.mes)) return false;
    const keyword = normalize(query.trim());
    return Boolean(keyword) && normalize(message.mes).includes(keyword);
}
