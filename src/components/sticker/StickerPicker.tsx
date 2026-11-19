import { useEffect } from "react";
import { X } from "lucide-react";
import { STICKERS, type StickerId } from "../../data/stickers";
import "./StickerPicker.css";

type StickerPickerProps = {
    onSelect: (stickerId: StickerId) => void;
    onClose: () => void;
    disabled?: boolean;
};

export default function StickerPicker({
    onSelect,
    onClose,
    disabled = false
}: StickerPickerProps) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div className="sticker-picker" role="dialog" aria-label="Chọn sticker">
            <div className="sticker-picker__header">
                <span>Sticker</span>
                <button
                    type="button"
                    className="sticker-picker__close"
                    onClick={onClose}
                    aria-label="Đóng bảng sticker"
                >
                    <X size={18} />
                </button>
            </div>
            <div className="sticker-picker__grid">
                {STICKERS.map((sticker) => (
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
        </div>
    );
}
