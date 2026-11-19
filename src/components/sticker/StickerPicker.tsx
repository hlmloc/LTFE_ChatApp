import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
    STICKERS,
    STICKER_PACKS,
    type StickerId,
    type StickerPackId
} from "../../data/stickers";
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
    const [activePack, setActivePack] = useState<StickerPackId>("cat");

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

            <div className="sticker-picker__packs" role="tablist" aria-label="Bộ sticker">
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
        </div>
    );
}
