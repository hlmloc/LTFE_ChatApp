import { parseStickerMessage } from "../../data/stickers";
import MarkdownMessage from "./MarkdownMessage";
import "./MessageBubble.css";

interface MessageBubbleProps {
    text: string;
    isMine: boolean;
    avatar?: string;
}

export default function MessageBubble({ text, isMine, avatar }: MessageBubbleProps) {
    const sticker = parseStickerMessage(text);

    return (
        <div className={`message-row ${isMine ? "mine" : "other"}`}>
            {!isMine && avatar && (
                <img src={avatar} alt="Avatar" className="bubble-avatar" />
            )}
            {sticker ? (
                <img
                    className="message-sticker"
                    src={sticker.src}
                    alt={`Sticker: ${sticker.label}`}
                    title={sticker.label}
                    draggable={false}
                />
            ) : (
                <div className={`bubble ${isMine ? "mine" : "other"}`}>
                    <MarkdownMessage text={text} />
                </div>
            )}
        </div>
    );
}
