
import { BadgeCheck, Check, CheckCheck, FileText, Image, MapPin, Megaphone, Mic, Palette, Pin } from "lucide-react";
import type { Conversation } from "../../types/chat";
import "./ConversationItem.css";

export type { Conversation } from "../../types/chat";

type ConversationItemProps = {
    conversation: Conversation;
    onSelect: (conversationId: string) => void;
};

export default function ConversationItem({ conversation, onSelect }: ConversationItemProps) {
    const messageIcon = () => {
        switch (conversation.messageKind) {
            case "file": return <FileText size={17} />;
            case "image": return <Image size={17} />;
            case "voice": return <Mic size={17} />;
            case "location": return <MapPin size={17} />;
            default: return null;
        }
    };

    return (
        <button
            type="button"
            className={`conversation-item${conversation.unreadCount > 0 ? " conversation-item--unread" : ""}`}
            onClick={() => onSelect(conversation.id)}
            aria-label={`Mở cuộc trò chuyện ${conversation.name}`}
        >
            <div className={`conversation-item__avatar conversation-item__avatar--${conversation.tone}`}>
                {conversation.avatarUrl ? (
                    <img src={conversation.avatarUrl} alt="" className="conversation-item__avatar-image" />
                ) : conversation.type === "group" ? (
                    <Palette size={24} />
                ) : conversation.type === "system" ? (
                    <Megaphone size={24} />
                ) : conversation.initials}

                {conversation.online && conversation.type === "direct" && (
                    <span className="conversation-item__online" aria-label="Đang trực tuyến" />
                )}
            </div>

            <div className="conversation-item__content">
                <div className="conversation-item__top">
                    <div className="conversation-item__name">
                        <span className="conversation-item__truncate">{conversation.name}</span>
                        {conversation.verified && <BadgeCheck size={16} className="conversation-item__verified" />}
                    </div>
                    <span className="conversation-item__time">{conversation.time}</span>
                </div>

                <div className="conversation-item__bottom">
                    <div className="conversation-item__preview">
                        {conversation.mentioned && <span className="conversation-item__mention">@Bạn</span>}
                        <span className="conversation-item__message-icon">{messageIcon()}</span>
                        <span className="conversation-item__truncate">{conversation.preview}</span>
                    </div>

                    {conversation.unreadCount > 0 ? (
                        <span className="conversation-item__unread">{conversation.unreadCount}</span>
                    ) : conversation.lastMessageSeen === true ? (
                        <CheckCheck size={17} className="conversation-item__read" />
                    ) : conversation.lastMessageSeen === false ? (
                        <Check size={17} className="conversation-item__read" />
                    ) : null}
                </div>
            </div>

            {conversation.pinned && <Pin size={16} className="conversation-item__pin" />}
        </button>
    );
}
