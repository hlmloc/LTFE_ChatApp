import "./ChatListHeading.css";

type ChatListHeadingProps = {
    conversationCount: number;
    onFilterClick: () => void;
    onNewChatClick: () => void;
};

function ChatListHeading({conversationCount, onFilterClick, onNewChatClick,}: ChatListHeadingProps) {
    return (
        <div className="chat-list-heading">
            <div className="chat-list-heading__info">
                <h2 className="chat-list-heading__title">
                    Đoạn chat
                </h2>
                <span className="chat-list-heading__count">
                    {conversationCount} hội thoại
                </span>
            </div>
            <div className="chat-list-heading__actions">
                <button
                    type="button"
                    className="chat-list-heading__button chat-list-heading__button--filter"
                    aria-label="Bộ lọc chuyên sâu"
                    onClick={onFilterClick}>
                    <span
                        className="material-symbols-outlined"
                        aria-hidden="true">
                        tune
                    </span>
                </button>

                <button
                    type="button"
                    className="chat-list-heading__button chat-list-heading__button--new"
                    aria-label="Cuộc trò chuyện mới"
                    onClick={onNewChatClick}
                >
                    <span
                        className="material-symbols-outlined"
                        aria-hidden="true"
                    >
                        edit_square
                    </span>
                </button>
            </div>
        </div>
    );
}

export default ChatListHeading;