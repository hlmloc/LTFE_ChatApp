
import { useSelector } from "react-redux";
import type { RootState } from "../../store/Store";

import MessageBubble from "./MessageBubble";
import "./MessageList.css";

export default function MessageList() {
    const messages = useSelector(
        (state: RootState) => state.messages.messages
    );

    const loading = useSelector(
        (state: RootState) => state.messages.loading
    );

    const error = useSelector(
        (state: RootState) => state.messages.error
    );

    const currentUsername = useSelector(
        (state: RootState) => state.auth.username
    );

    if (loading) {
        return (
            <div className="message-list-container">
                <p>Đang tải tin nhắn...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="message-list-container">
                <p>{error}</p>
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="message-list-container">
                <p>Chưa có tin nhắn nào.</p>
            </div>
        );
    }

    return (
        <div className="message-list-container">
            {messages.map((msg) => (
                <MessageBubble
                    key={msg.id}
                    text={msg.mes}
                    isMine={msg.name === currentUsername}
                />
            ))}
        </div>
    );
}
