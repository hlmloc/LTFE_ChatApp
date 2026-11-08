import "./ChatSearchBar.css";

type ChatSearchBarProps = {
    value: string;
    onChange: (value: string) => void;
};

function ChatSearchBar({ value, onChange }: ChatSearchBarProps) {
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
                    type="search"
                    className="chat-search__input"
                    placeholder="Tìm kiếm"
                    aria-label="Tìm kiếm cuộc trò chuyện"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            </div>
        </div>
    );
}

export default ChatSearchBar;