import './MessageBubble.css';

interface MessageBubbleProps {
    text: string;
    isMine: boolean;
    avatar?: string;
}

export default function MessageBubble({ text, isMine, avatar }: MessageBubbleProps) {
    if (isMine) {
        return (
            <div className="message-row mine">
                <div className="bubble mine">{text}</div>
            </div>
        );
    }

    return (
        <div className="message-row other">
            {avatar && <img src={avatar} alt="Avatar" className="bubble-avatar" />}
            <div className="bubble other">{text}</div>
        </div>
    );
}