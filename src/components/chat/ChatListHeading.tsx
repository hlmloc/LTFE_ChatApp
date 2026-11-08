import "./ChatListHeading.css";
import { Plus } from "lucide-react";

type ChatListHeadingProps = {
    username: string;
    onCreateGroup: () => void;
};

function ChatListHeading({ username , onCreateGroup, }: ChatListHeadingProps) {
    return (
        <header className="chat-list-heading">
            <h1 className="chat-list-heading__title" title={username}>
                {username}
            </h1>

            <button
                type="button"
                className="chat-list-heading__create"
                onClick={onCreateGroup}
                title="Tạo nhóm mới"
                aria-label="Tạo nhóm mới"
            >
                <Plus size={22} />
            </button>

        </header>
    );
}

export default ChatListHeading;
