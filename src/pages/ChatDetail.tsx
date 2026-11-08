
import MessageList from "../components/chat_detail/MessageList";
import ChatInput from "../components/chat_detail/ChatInput";
import ChatHeader from "../components/chat_detail/ChatHeader";

import "./ChatDetail.css";

type ChatDetailProps = {
    conversationId: string;
    name: string;
};

export default function ChatDetail({
                                       conversationId,
                                       name,
                                   }: ChatDetailProps) {
    return (
        <div
            className="chat-detail-container"
            data-conversation-id={conversationId}
        >
            <ChatHeader name={name} />

            <MessageList />

            <ChatInput />
        </div>
    );
}
