import './MessageList.css';
import MessageBubble from './MessageBubble';

export default function MessageList() {
    const mockMessages = [
        { id: 1, text: "xin chào", isMine: true },
        { id: 2, text: "xin chao", isMine: false, avatar: "src/assets/avatar1.jpg" },
    ];

    return (
        <div className="message-list-container">
            {mockMessages.map((msg) => (
                <MessageBubble
                    key={msg.id}
                    text={msg.text}
                    isMine={msg.isMine}
                    avatar={msg.avatar}
                />
            ))}
        </div>
    );
}