import "./ChatListHeading.css";

type ChatListHeadingProps = {
    username: string;
};

function ChatListHeading({ username }: ChatListHeadingProps) {
    return (
        <header className="chat-list-heading">
            <h1 className="chat-list-heading__title" title={username}>
                {username}
            </h1>
        </header>
    );
}

export default ChatListHeading;
