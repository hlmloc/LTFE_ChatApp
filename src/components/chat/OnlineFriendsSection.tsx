import "./OnlineFriendsSection.css";

export type OnlineFriendData = {
    id: string;
    name: string;
    initials: string;
    avatarUrl?: string;
    isOnline: boolean;
    tone?: "blue" | "pink" | "mint" | "violet";
};

type OnlineFriendsSectionProps = {
    friends: OnlineFriendData[];
    onFriendClick: (friendId: string) => void;
    onCreateStoryClick: () => void;
};

function OnlineFriendsSection({friends, onFriendClick, onCreateStoryClick,}: OnlineFriendsSectionProps) {
    const onlineCount = friends.filter(
        (friend) => friend.isOnline
    ).length;

    return (
        <section className="online-friends">
            <div className="online-friends__heading">
                <h2 className="online-friends__title">
                    Đang trực tuyến
                </h2>

                <span className="online-friends__count">
                    <span className="online-friends__count-dot" />
                    {onlineCount} người bạn
                </span>
            </div>

            <div className="online-friends__list">
                <button
                    type="button"
                    className="online-friends__item"
                    onClick={onCreateStoryClick}
                >
                    <span className="online-friends__story">
                        <span className="online-friends__story-inner">
                            <span
                                className="material-symbols-outlined"
                                aria-hidden="true"
                            >
                                add
                            </span>
                        </span>

                        <span className="online-friends__story-badge">
                            +
                        </span>
                    </span>

                    <span className="online-friends__name">
                        Bản tin mới
                    </span>
                </button>

                {friends.map((friend) => (
                    <button
                        type="button"
                        key={friend.id}
                        className="online-friends__item"
                        onClick={() => onFriendClick(friend.id)}
                        aria-label={`Trò chuyện với ${friend.name}`}
                    >
                        <span
                            className={
                                "online-friends__avatar " +
                                `online-friends__avatar--${friend.tone ?? "blue"}`
                            }
                        >
                            {friend.avatarUrl ? (
                                <img
                                    src={friend.avatarUrl}
                                    alt=""
                                    className="online-friends__image"
                                />
                            ) : (
                                <span className="online-friends__initials">
                                    {friend.initials}
                                </span>
                            )}

                            <span
                                className={
                                    "online-friends__status " +
                                    (friend.isOnline
                                        ? "online-friends__status--online"
                                        : "online-friends__status--offline")
                                }
                            />
                        </span>

                        <span className="online-friends__name">
                            {friend.name}
                        </span>
                    </button>
                ))}
            </div>
        </section>
    );
}

export default OnlineFriendsSection;