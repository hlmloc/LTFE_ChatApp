import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
    STICKERS,
    STICKER_PACKS,
    type StickerId,
    type StickerPackId
} from "../../data/stickers";
import { EMOJI_GROUPS } from "../../data/emojis";
import "./StickerPicker.css";

type StickerPickerProps = {
    onSelect: (stickerId: StickerId) => void;
    onEmojiSelect: (emoji: string) => void;
    onClose: () => void;
    disabled?: boolean;
};

export default function StickerPicker({
    onSelect,
    onEmojiSelect,
    onClose,
    disabled = false
}: StickerPickerProps) {
    const [activePack, setActivePack] = useState<StickerPackId | "emoji">("cat");
    const [emojiGroup, setEmojiGroup] = useState(EMOJI_GROUPS[0].id);
    const activeEmojiGroup = EMOJI_GROUPS.find(group => group.id === emojiGroup) ?? EMOJI_GROUPS[0];

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const visibleStickers = STICKERS.filter(
        (sticker) => sticker.pack === activePack
    );

    return (
        <div className="sticker-picker" role="dialog" aria-label="Chọn emoji hoặc sticker">
            <div className="sticker-picker__header">
                <span>Emoji và sticker</span>
                <button
                    type="button"
                    className="sticker-picker__close"
                    onClick={onClose}
                    aria-label="Đóng bảng chọn"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="sticker-picker__packs" role="tablist" aria-label="Emoji và bộ sticker">
                <button
                    type="button"
                    role="tab"
                    className={`sticker-picker__pack${activePack === "emoji" ? " sticker-picker__pack--active" : ""}`}
                    aria-selected={activePack === "emoji"}
                    onClick={() => setActivePack("emoji")}
                >
                    Emoji
                </button>
                {STICKER_PACKS.map((pack) => (
                    <button
                        key={pack.id}
                        type="button"
                        role="tab"
                        className={`sticker-picker__pack${activePack === pack.id ? " sticker-picker__pack--active" : ""}`}
                        aria-selected={activePack === pack.id}
                        onClick={() => setActivePack(pack.id)}
                    >
                        {pack.label}
                    </button>
                ))}
            </div>

            {activePack === "emoji" ? (
                <div role="tabpanel" aria-label="Emoji">
                    <div className="emoji-picker__groups" role="group" aria-label="Danh mục emoji">
                        {EMOJI_GROUPS.map(group => (
                            <button
                                key={group.id}
                                type="button"
                                aria-label={group.label}
                                aria-pressed={emojiGroup === group.id}
                                title={group.label}
                                onClick={() => setEmojiGroup(group.id)}
                            >
                                {group.icon}
                            </button>
                        ))}
                    </div>
                    <div className="emoji-picker__label">{activeEmojiGroup.label}</div>
                    <div className="emoji-picker__grid" key={emojiGroup}>
                        {activeEmojiGroup.items.map(emoji => (
                            <button
                                key={emoji}
                                type="button"
                                className="emoji-picker__item"
                                disabled={disabled}
                                aria-label={`Chèn ${emoji}`}
                                onMouseDown={event => event.preventDefault()}
                                onClick={() => onEmojiSelect(emoji)}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="sticker-picker__grid" role="tabpanel" aria-label={`Bộ sticker ${activePack}`}>
                    {visibleStickers.map((sticker) => (
                        <button
                            key={sticker.id}
                            type="button"
                            className="sticker-picker__item"
                            onClick={() => onSelect(sticker.id)}
                            aria-label={sticker.label}
                            title={sticker.label}
                            disabled={disabled}
                        >
                            <img src={sticker.src} alt="" draggable={false} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
