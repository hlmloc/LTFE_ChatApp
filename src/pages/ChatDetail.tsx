import MessageList from '../components/chat_detail/MessageList';
import ChatInput from '../components/chat_detail/ChatInput';
import ChatHeader from "../components/chat_detail/ChatHeader.tsx";
import './ChatDetail.css';

export default function ChatDetail() {
    return (
        <div className="chat-detail-container">
            <ChatHeader />
            <MessageList />
            <ChatInput />
        </div>
    );
}