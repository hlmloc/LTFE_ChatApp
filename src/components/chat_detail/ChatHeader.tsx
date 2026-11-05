import './ChatHeader.css';
import { ChevronLeft, Phone, Video } from 'lucide-react';

export default function ChatHeader() {
    return (
        <div className="chat-header-container">

            <div className="header-left">
                <button className="btn-header-icon">
                    <ChevronLeft size={28} />
                </button>

                <img
                    src="src/assets/avatar1.jpg"
                    alt="Avatar"
                    className="header-avatar"
                />

                <div className="header-user-info">
                    <span className="user-name">ho ten</span>
                </div>
            </div>

            <div className="header-right">
                <button className="btn-header-icon">
                    <Phone size={22} />
                </button>
                <button className="btn-header-icon">
                    <Video size={24} />
                </button>
            </div>

        </div>
    );
}