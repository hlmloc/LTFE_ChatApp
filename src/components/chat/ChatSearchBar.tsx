import type { Ref } from "react";
import type { MediaFilter } from "../../types/chat";

import "./ChatSearchBar.css";

type ChatSearchBarProps = {
    value: string;
    onChange: (value: string) => void;
    onAttachmentClick: () => void;
    onImageClick: () => void;
    inputRef?: Ref<HTMLInputElement>;
    activeMedia?: MediaFilter;
};

function ChatSearchBar({
                           value,
                           onChange,
                           onAttachmentClick,
                           onImageClick,
                           inputRef,
                           activeMedia,
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
                    ref={inputRef}
                    type="search"
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
                        title="Lọc tệp đính kèm"
                        aria-label="Lọc tệp đính kèm"
                        aria-pressed={activeMedia === "file"}
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
                        aria-pressed={activeMedia === "image"}
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