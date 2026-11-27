import { Search, X } from "lucide-react";
import "./MessageSearchBar.css";

type MessageSearchBarProps = {
    value: string;
    count?: number;
    onChange: (value: string) => void;
    onClose: () => void;
};

export default function MessageSearchBar({ value, count, onChange, onClose }: MessageSearchBarProps) {
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
                        if (event.key === "Escape") onClose();
                    }}
                />
            </div>
            {count !== undefined && (
                <span className="message-search-bar__count" role="status">{count} kết quả</span>
            )}
            <button type="button" className="message-search-bar__close" aria-label="Đóng tìm kiếm" title="Đóng tìm kiếm" onClick={onClose}>
                <X size={20} />
            </button>
        </div>
    );
}
