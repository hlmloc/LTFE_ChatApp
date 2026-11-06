import {
    BadgeCheck,
    Check,
    CheckCheck,
    FileText,
    Image,
    MapPin,
    Megaphone,
    Mic,
    Palette,
    Pin,
} from "lucide-react";

import "./ConversationItem.css";

// kiểu dữ liệu trò chuyện
export type Conversation = {
    id: string;
    name: string;
    initials: string;
    avatarUrl?: string;
    tone: "blue" | "pink" | "mint" | "violet";
    type: "direct" | "group" | "system";
    preview: string;
    time: string;
    messageKind: "text" | "file" | "image" | "voice" | "location";
    unreadCount: number;
    pinned: boolean;
    online: boolean;

    verified?: boolean;
    mentioned?: boolean;
    isWorkGroup?: boolean;
    lastMessageSeen?: boolean;
};

// Props
type ConversationItemProps = {
    conversation: Conversation;
    onSelect: (conversationId: string) => void;
};

function ConversationItem({
                              conversation,
                              onSelect,}: ConversationItemProps) {
    //icon cho thuộc tính
    const renderMessageIcon = () => {
        switch (conversation.messageKind) {
            case "file":
                return <FileText size={17} />;
            case "image":
                return <Image size={17} />;
            case "voice":
                return <Mic size={17} />;
            case "location":
                return <MapPin size={17} />;
            default:
                return null;
        }
    };
    return (
        <button
            type="button"
            className={
                "conversation-item " +
                (conversation.unreadCount > 0 ? "conversation-item--unread" : "")
            }
            onClick={() => onSelect(conversation.id)}
            aria-label={`Mở cuộc trò chuyện ${conversation.name}`}
        >
            {/* Avatar */}
            <div
                className={
                    "conversation-item__avatar " +
                    `conversation-item__avatar--${conversation.tone}`
                }>

                {conversation.avatarUrl ? (
                    <img
                        src={conversation.avatarUrl}
                        alt=""
                        className="conversation-item__avatar-image"/>
                ) : conversation.type === "group" ? (
                    <Palette size={24} />
                ) : conversation.type === "system" ? (
                    <Megaphone size={24} />
                ) : (
                    conversation.initials
                )}

                {conversation.online &&
                    conversation.type === "direct" && (
                        <span
                            className="conversation-item__online"
                            aria-label="Đang trực tuyến"
                        />
                    )}
            </div>

            <div className="conversation-item__content">
                <div className="conversation-item__top">
                    <div className="conversation-item__name">
                        <span className="conversation-item__truncate">
                            {conversation.name}
                        </span>

                        {conversation.verified && (
                            <BadgeCheck
                                size={16}
                                className="conversation-item__verified"
                            />
                        )}
                    </div>

                    <span className="conversation-item__time">
                        {conversation.time}
                    </span>
                </div>

                <div className="conversation-item__bottom">
                    <div className="conversation-item__preview">

                        {conversation.mentioned && (
                            <span className="conversation-item__mention">
                                @Bạn
                            </span>
                        )}

                        <span className="conversation-item__message-icon">
                            {renderMessageIcon()}
                        </span>

                        <span className="conversation-item__truncate">
                            {conversation.preview}
                        </span>
                    </div>

                    {conversation.unreadCount > 0 ? (
                        <span className="conversation-item__unread">
                            {conversation.unreadCount}
                        </span>
                    ) : conversation.lastMessageSeen ? (
                        <CheckCheck
                            size={17}
                            className="conversation-item__read"
                        />
                    ) : (
                        <Check
                            size={17}
                            className="conversation-item__read"
                        />
                    )}
                </div>
            </div>

            {conversation.pinned && (
                <Pin
                    size={16}
                    className="conversation-item__pin"
                />
            )}

        </button>
    );
}

export default ConversationItem;