import "./ChatHeader.css";

type ChatHeaderProps = {
    onSearchClick: () => void;
    onProfileClick: () => void;
};
function ChatHeader({onSearchClick, onProfileClick,}: ChatHeaderProps) {
    return (
        <header className="chat-header">
            <div className="chat-header__inner">
                <div className="chat-header__brand">
                    <div className="chat-header__logo">
                        C
                    </div>
                    <h1 className="chat-header__title">
                        Chats
                    </h1>
                </div>
                <div className="chat-header__actions">
                    <button
                        type="button"
                        className="chat-header__button"
                        aria-label="Tìm kiếm"
                        onClick={onSearchClick}>
            <span
                className="material-symbols-outlined"
                aria-hidden="true"
            >
              search
            </span>
                    </button>
                    <button
                        type="button"
                        className="chat-header__button"
                        aria-label="Mở hồ sơ"
                        onClick={onProfileClick}>
            <span className="chat-header__avatar">
              ME
            </span>
                    </button>

                </div>
            </div>
        </header>
    );
}

export default ChatHeader;