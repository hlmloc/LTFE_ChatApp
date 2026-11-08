import { useLocation, useNavigate } from "react-router-dom";

import MessageList from "../components/chat_detail/MessageList";
import ChatInput from "../components/chat_detail/ChatInput";
import ChatHeader from "../components/chat_detail/ChatHeader";

import "./ChatDetail.css";

type ConversationRouteState = {
    conversationId?: string | null;
    conversationName?: string;
};

export default function ChatDetail() {
    const navigate = useNavigate();
    const location = useLocation();

    const routeState = location.state as ConversationRouteState | null;

    return (
        <div className="chat-detail-container">
            <ChatHeader
                name={routeState?.conversationName}
                onBack={() => navigate("/chats")}
            />

            <MessageList />
            <ChatInput />
        </div>
    );
}