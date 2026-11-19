import happyImage from "../assets/stickers/happy.webp";
import laughImage from "../assets/stickers/laugh.webp";
import loveImage from "../assets/stickers/love.webp";
import sadImage from "../assets/stickers/sad.webp";
import angryImage from "../assets/stickers/angry.webp";
import surprisedImage from "../assets/stickers/surprised.webp";
import thumbs_upImage from "../assets/stickers/thumbs-up.webp";
import waveImage from "../assets/stickers/wave.webp";
import sleepyImage from "../assets/stickers/sleepy.webp";
import partyImage from "../assets/stickers/party.webp";
import thinkingImage from "../assets/stickers/thinking.webp";
import thanksImage from "../assets/stickers/thanks.webp";

export const STICKERS = [
    { id: "happy", label: "Vui vẻ", src: happyImage },
    { id: "laugh", label: "Cười lớn", src: laughImage },
    { id: "love", label: "Yêu thương", src: loveImage },
    { id: "sad", label: "Buồn", src: sadImage },
    { id: "angry", label: "Giận dỗi", src: angryImage },
    { id: "surprised", label: "Ngạc nhiên", src: surprisedImage },
    { id: "thumbs-up", label: "Tuyệt vời", src: thumbs_upImage },
    { id: "wave", label: "Xin chào", src: waveImage },
    { id: "sleepy", label: "Buồn ngủ", src: sleepyImage },
    { id: "party", label: "Ăn mừng", src: partyImage },
    { id: "thinking", label: "Suy nghĩ", src: thinkingImage },
    { id: "thanks", label: "Cảm ơn", src: thanksImage }
] as const;

export type Sticker = (typeof STICKERS)[number];
export type StickerId = Sticker["id"];

const stickerById = new Map<string, Sticker>(
    STICKERS.map((sticker) => [sticker.id, sticker] as const)
);

const stickerMessagePattern = /^\[sticker:([a-z-]+)\]$/;

export function getStickerById(id: string): Sticker | null {
    return stickerById.get(id) ?? null;
}

export function createStickerMessage(id: StickerId): string {
    return `[sticker:${id}]`;
}

export function parseStickerMessage(message: string): Sticker | null {
    const match = stickerMessagePattern.exec(message.trim());
    return match ? getStickerById(match[1]) : null;
}
