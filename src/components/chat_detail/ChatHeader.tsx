import { ChevronLeft, Phone, Video } from "lucide-react";
import avatar from "../../assets/avatar1.jpg";
import "./ChatHeader.css";

type ChatHeaderProps = {
    name?: string;
    onBack?: () => void;
};

export default function ChatHeader({
                                       name,
                                       onBack,
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
                </div>
            </div>

            <div className="header-right">
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