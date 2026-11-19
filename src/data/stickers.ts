import happyImage from "../assets/stickers/happy.webp";
import laughImage from "../assets/stickers/laugh.webp";
import loveImage from "../assets/stickers/love.webp";
import sadImage from "../assets/stickers/sad.webp";
import angryImage from "../assets/stickers/angry.webp";
import surprisedImage from "../assets/stickers/surprised.webp";
import thumbsUpImage from "../assets/stickers/thumbs-up.webp";
import waveImage from "../assets/stickers/wave.webp";
import sleepyImage from "../assets/stickers/sleepy.webp";
import partyImage from "../assets/stickers/party.webp";
import thinkingImage from "../assets/stickers/thinking.webp";
import thanksImage from "../assets/stickers/thanks.webp";
import girlWinkImage from "../assets/stickers/girl/girl-wink.webp";
import girlLaughImage from "../assets/stickers/girl/girl-laugh.webp";
import girlLoveImage from "../assets/stickers/girl/girl-love.webp";
import girlSurprisedImage from "../assets/stickers/girl/girl-surprised.webp";
import girlSadImage from "../assets/stickers/girl/girl-sad.webp";
import girlAngryImage from "../assets/stickers/girl/girl-angry.webp";
import girlSleepyImage from "../assets/stickers/girl/girl-sleepy.webp";
import girlWaveImage from "../assets/stickers/girl/girl-wave.webp";

export const STICKER_PACKS = [
    { id: "cat", label: "Mèo" },
    { id: "girl", label: "Cô gái" }
] as const;

export type StickerPackId = (typeof STICKER_PACKS)[number]["id"];

export const STICKERS = [
    { id: "happy", label: "Vui vẻ", src: happyImage, pack: "cat" },
    { id: "laugh", label: "Cười lớn", src: laughImage, pack: "cat" },
    { id: "love", label: "Yêu thương", src: loveImage, pack: "cat" },
    { id: "sad", label: "Buồn", src: sadImage, pack: "cat" },
    { id: "angry", label: "Giận dỗi", src: angryImage, pack: "cat" },
    { id: "surprised", label: "Ngạc nhiên", src: surprisedImage, pack: "cat" },
    { id: "thumbs-up", label: "Tuyệt vời", src: thumbsUpImage, pack: "cat" },
    { id: "wave", label: "Xin chào", src: waveImage, pack: "cat" },
    { id: "sleepy", label: "Buồn ngủ", src: sleepyImage, pack: "cat" },
    { id: "party", label: "Ăn mừng", src: partyImage, pack: "cat" },
    { id: "thinking", label: "Suy nghĩ", src: thinkingImage, pack: "cat" },
    { id: "thanks", label: "Cảm ơn", src: thanksImage, pack: "cat" },
    { id: "girl-wink", label: "Nháy mắt", src: girlWinkImage, pack: "girl" },
    { id: "girl-laugh", label: "Cười vui", src: girlLaughImage, pack: "girl" },
    { id: "girl-love", label: "Thả tim", src: girlLoveImage, pack: "girl" },
    { id: "girl-surprised", label: "Bất ngờ", src: girlSurprisedImage, pack: "girl" },
    { id: "girl-sad", label: "Rưng rưng", src: girlSadImage, pack: "girl" },
    { id: "girl-angry", label: "Giận dỗi", src: girlAngryImage, pack: "girl" },
    { id: "girl-sleepy", label: "Buồn ngủ", src: girlSleepyImage, pack: "girl" },
    { id: "girl-wave", label: "Xin chào", src: girlWaveImage, pack: "girl" }
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
