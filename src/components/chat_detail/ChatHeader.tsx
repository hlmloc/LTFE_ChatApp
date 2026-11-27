import { ChevronLeft, Phone, Search, Video } from "lucide-react";
import avatar from "../../assets/avatar1.jpg";
import "./ChatHeader.css";

type ChatHeaderProps = {
    name?: string;
    onBack?: () => void;
    online?: boolean;
    searchOpen: boolean;
    onSearchToggle: () => void;
};

export default function ChatHeader({
                                       name,
                                       onBack,
                                       online,
                                       searchOpen,
                                       onSearchToggle,
                                   }: ChatHeaderProps) {
    return (
        <div className="chat-header-container">
            <div className="header-left">
                <button
                    type="button"
                    className="btn-header-icon"
                    onClick={onBack}
                    aria-label="Quay lại danh sách"
                >
                    <ChevronLeft size={28} />
                </button>

                <img
                    src={avatar}
                    alt="Avatar"
                    className="header-avatar"
                />

                <div className="header-user-info">
                    <span className="user-name">
                        {name ?? "Cuộc trò chuyện"}
                    </span>
                    {online !== undefined && (
                        <span className="user-status">{online ? "Đang trực tuyến" : "Ngoại tuyến"}</span>
                    )}
                </div>
            </div>

            <div className="header-right">
                <button
                    type="button"
                    className={`btn-header-icon${searchOpen ? " btn-header-icon--active" : ""}`}
                    aria-label="Tìm kiếm tin nhắn"
                    title="Tìm kiếm tin nhắn"
                    aria-expanded={searchOpen}
                    onClick={onSearchToggle}
                >
                    <Search size={22} />
                </button>
                <button type="button" className="btn-header-icon">
                    <Phone size={22} />
                </button>

                <button type="button" className="btn-header-icon">
                    <Video size={24} />
                </button>
            </div>
        </div>
    );
}
