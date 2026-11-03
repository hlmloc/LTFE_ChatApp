import "./ChatSearchBar.css";

type ChatSearchBarProps = {
    value: string;
    onChange: (value: string) => void;
    onAttachmentClick: () => void;
    onImageClick: () => void;
};

function ChatSearchBar({
                           value,
                           onChange,
                           onAttachmentClick,
                           onImageClick,
                       }: ChatSearchBarProps) {
    return (
        <div className="chat-search">
            <div className="chat-search__container">

                <span
                    className="material-symbols-outlined chat-search__icon"
                    aria-hidden="true"
                >
                    search
                </span>

                <input
                    type="text"
                    className="chat-search__input"
                    placeholder="Tìm kiếm tin nhắn, bạn bè, tệp..."
                    aria-label="Tìm kiếm cuộc trò chuyện"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />

                <div className="chat-search__actions">
                    <button
                        type="button"
                        className="chat-search__button"
                        title="Lọc tập tin đính kèm"
                        aria-label="Lọc tập tin đính kèm"
                        onClick={onAttachmentClick}
                    >
                        <span
                            className="material-symbols-outlined"
                            aria-hidden="true"
                        >
                            attach_file
                        </span>
                    </button>

                    <button
                        type="button"
                        className="chat-search__button"
                        title="Lọc hình ảnh"
                        aria-label="Lọc hình ảnh"
                        onClick={onImageClick}
                    >
                        <span
                            className="material-symbols-outlined"
                            aria-hidden="true"
                        >
                            image
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChatSearchBar;