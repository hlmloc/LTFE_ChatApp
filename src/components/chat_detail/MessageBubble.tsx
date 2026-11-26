import { parseStickerMessage } from "../../data/stickers";
import type { ImageAttachment } from "../../data/messageProtocol";
import MarkdownMessage from "./MarkdownMessage";
import "./MessageBubble.css";

interface MessageBubbleProps {
    text: string;
    isMine: boolean;
    avatar?: string;
    attachment?: ImageAttachment;
    recalled?: boolean;
}

export default function MessageBubble({
                                          text,
                                          isMine,
                                          avatar,
                                          attachment,
                                          recalled,
                                      }: MessageBubbleProps) {
    const sticker = parseStickerMessage(text);

    return (
        <div className={`message-row ${isMine ? "mine" : "other"}`}>
            {!isMine && avatar && (
                <img
                    src={avatar}
                    alt="Avatar"
                    className="bubble-avatar"
                />
            )}

            {recalled ? (
                <div className={`bubble ${isMine ? "mine" : "other"}`}>
                    <MarkdownMessage text={text} />
                </div>
            ) : attachment?.kind === "image" ? (
                <a
                    className="message-image-link"
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Nhấn để xem ảnh đầy đủ"
                >
                    <img
                        className="message-image"
                        src={attachment.url}
                        alt={attachment.name}
                        loading="lazy"
                    />
                </a>
            ) : sticker ? (
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
