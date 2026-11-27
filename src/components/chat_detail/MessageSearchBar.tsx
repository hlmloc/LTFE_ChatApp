import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import "./MessageSearchBar.css";

type MessageSearchBarProps = {
    value: string;
    count?: number;
    position: number;
    onChange: (value: string) => void;
    onNavigate: (direction: -1 | 1) => void;
    onClose: () => void;
};

export default function MessageSearchBar({ value, count, position, onChange, onNavigate, onClose }: MessageSearchBarProps) {
    return (
        <div className="message-search-bar" role="search" aria-label="Tìm kiếm tin nhắn">
            <div className="message-search-bar__field">
                <Search size={18} aria-hidden="true" />
                <input
                    autoFocus
                    type="search"
                    value={value}
                    placeholder="Tìm trong cuộc trò chuyện..."
                    aria-label="Từ khóa tìm kiếm"
                    onChange={event => onChange(event.target.value)}
                    onKeyDown={event => {
                        if (event.nativeEvent.isComposing) return;
                        if (event.key === "Escape") onClose();
                        if (event.key === "Enter" && count) {
                            event.preventDefault();
                            onNavigate(event.shiftKey ? -1 : 1);
                        }
                    }}
                />
            </div>
            {count !== undefined && (
                <span className="message-search-bar__count" role="status">
                    {count ? `${position}/${count}` : "0 kết quả"}
                </span>
            )}
            <button type="button" className="message-search-bar__close" aria-label="Kết quả trước" title="Kết quả trước" disabled={!count || count < 2} onClick={() => onNavigate(-1)}>
                <ChevronUp size={20} />
            </button>
            <button type="button" className="message-search-bar__close" aria-label="Kết quả sau" title="Kết quả sau" disabled={!count || count < 2} onClick={() => onNavigate(1)}>
                <ChevronDown size={20} />
            </button>
            <button type="button" className="message-search-bar__close" aria-label="Đóng tìm kiếm" title="Đóng tìm kiếm" onClick={onClose}>
                <X size={20} />
            </button>
        </div>
    );
}
