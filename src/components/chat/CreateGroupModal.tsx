import { useMemo, useState } from "react";
import { Search, X, Check } from "lucide-react";
import type { OnlineFriendData } from "./OnlineFriendsSection";

import "./CreateGroupModal.css";

type CreateGroupModalProps = {
    friends: OnlineFriendData[];
    onClose: () => void;
    onCreate: (groupName: string, memberIds: string[]) => void;
};

function CreateGroupModal({
                              friends,
                              onClose,
                              onCreate,
                          }: CreateGroupModalProps) {
    const [groupName, setGroupName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const selectedFriends = friends.filter((friend) =>
        selectedIds.includes(friend.id)
    );

    const filteredFriends = useMemo(() => {
        const keyword = searchQuery.trim().toLocaleLowerCase("vi");

        return friends.filter((friend) =>
            friend.name.toLocaleLowerCase("vi").includes(keyword)
        );
    }, [friends, searchQuery]);

    function toggleMember(friendId: string) {
        setSelectedIds((current) =>
            current.includes(friendId)
                ? current.filter((id) => id !== friendId)
                : [...current, friendId]
        );
    }

    function handleCreate() {
        const trimmedName = groupName.trim();

        if (!trimmedName || selectedIds.length === 0) return;

        onCreate(trimmedName, selectedIds);
    }

    return (
        <div className="create-group-overlay" onClick={onClose}>
            <section
                className="create-group-modal"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="create-group-modal__header">
                    <h2>Tạo nhóm mới</h2>

                    <button
                        type="button"
                        className="create-group-modal__close"
                        onClick={onClose}
                        aria-label="Đóng"
                    >
                        <X size={24} />
                    </button>
                </header>

                <div className="create-group-modal__body">
                    <div className="create-group-modal__field">
                        <label htmlFor="group-name">
                            Tên nhóm
                        </label>

                        <input
                            id="group-name"
                            type="text"
                            placeholder="Ví dụ: Nhóm dự án Frontend"
                            value={groupName}
                            maxLength={40}
                            onChange={(event) =>
                                setGroupName(event.target.value)
                            }
                        />
                    </div>

                    <div className="create-group-modal__members">
                        <label>Thành viên</label>

                        {selectedFriends.length > 0 && (
                            <div className="create-group-modal__chips">
                                {selectedFriends.map((friend) => (
                                    <span
                                        className="create-group-chip"
                                        key={friend.id}
                                    >
                                        {friend.name}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleMember(friend.id)
                                            }
                                            aria-label={`Bỏ ${friend.name}`}
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="create-group-search">
                            <Search size={18} />

                            <input
                                type="text"
                                placeholder="Tìm kiếm người dùng..."
                                value={searchQuery}
                                onChange={(event) =>
                                    setSearchQuery(event.target.value)
                                }
                            />
                        </div>

                        <div className="create-group-member-list">
                            {filteredFriends.map((friend) => {
                                const isSelected = selectedIds.includes(
                                    friend.id
                                );

                                return (
                                    <button
                                        type="button"
                                        className="create-group-member"
                                        key={friend.id}
                                        onClick={() =>
                                            toggleMember(friend.id)
                                        }
                                    >
                                        <span
                                            className={`create-group-member__avatar create-group-member__avatar--${friend.tone}`}
                                        >
                                            {friend.initials}
                                        </span>

                                        <span className="create-group-member__info">
                                            <strong>{friend.name}</strong>
                                            <small>
                                                {friend.isOnline
                                                    ? "Đang hoạt động"
                                                    : "Ngoại tuyến"}
                                            </small>
                                        </span>

                                        <span
                                            className={`create-group-member__check ${
                                                isSelected ? "is-selected" : ""
                                            }`}
                                        >
                                            {isSelected && <Check size={16} />}
                                        </span>
                                    </button>
                                );
                            })}

                            {filteredFriends.length === 0 && (
                                <p className="create-group-empty">
                                    Không tìm thấy người dùng.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <footer className="create-group-modal__footer">
                    <button
                        type="button"
                        className="create-group-submit"
                        disabled={
                            !groupName.trim() || selectedIds.length === 0
                        }
                        onClick={handleCreate}
                    >
                        Tạo nhóm ({selectedIds.length})
                    </button>
                </footer>
            </section>
        </div>
    );
}

export default CreateGroupModal;