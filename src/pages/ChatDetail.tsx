import MessageList from '../components/chat_detail/MessageList';
import ChatInput from '../components/chat_detail/ChatInput';
import './ChatDetail.css';
export default function ChatDetail() {
    return (
        <div className="chat-detail-container">
            <MessageList />
            <ChatInput />
        </div>
    );
}