import { useMemo, useState } from "react";
import ChatDetail from "./ChatDetail";
import CreateGroupModal from "../components/chat/CreateGroupModal";
import ChatListHeading from "../components/chat/ChatListHeading";
import ChatSearchBar from "../components/chat/ChatSearchBar";
import OnlineFriendsSection from "../components/chat/OnlineFriendsSection";
import ConversationFilters from "../components/chat/ConversationFilters";
import ConversationList from "../components/chat/ConversationList";
import BottomNavigation from "../components/chat/BottomNavigation";

import { mockConversations, mockCurrentUser, mockFriends } from "../data/mockChat";
import type { ChatFilter } from "../types/chat";

import "./ChatsPage.css";

function normalizeText(text: string): string {
    return text
        .toLocaleLowerCase("vi")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d");
}

function ChatsPage() {
    const [selectedConversation, setSelectedConversation] = useState<{
        id: string;
        name: string;
    } | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<ChatFilter>("all");
    const [notice, setNotice] = useState("");
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

    const unreadCount = mockConversations.filter(
        (chat) => chat.unreadCount > 0
    ).length;

    const pinnedCount = mockConversations.filter(
        (chat) => chat.pinned
    ).length;

    const visibleConversations = useMemo(() => {
        const keyword = normalizeText(searchQuery.trim());

        return mockConversations.filter((chat) => {
            const matchesSearch = normalizeText(
                `${chat.name} ${chat.preview}`
            ).includes(keyword);

            const matchesTab =
                filter === "all" ||
                (filter === "unread" && chat.unreadCount > 0) ||
                (filter === "pinned" && chat.pinned) ||
                (filter === "work" && chat.isWorkGroup === true);

            return matchesSearch && matchesTab;
        });
    }, [searchQuery, filter]);

    function openConversation(conversationId: string) {
        const chat = mockConversations.find(
            (item) => item.id === conversationId
        );

        if (!chat) return;

        setSelectedConversation({
            id: chat.id,
            name: chat.name,
        });
    }

    function openFriend(friendId: string) {
        const friend = mockFriends.find(
            (item) => item.id === friendId
        );

        if (!friend) return;

        const chat = mockConversations.find(
            (item) => item.name === friend.name
        );

        if (chat) {
            setSelectedConversation({
                id: chat.id,
                name: chat.name,
            });
        } else {
            setNotice(
                "Cuộc trò chuyện với người này chưa có dữ liệu."
            );
        }
    }

    return (
        <div className="chats-page">
            <main className="chats-page__content">
                <div className="chats-layout">
                    <section className="chats-sidebar">
                        <ChatListHeading
                            username={mockCurrentUser.username}
                            onCreateGroup={() => setIsCreateGroupOpen(true)}
                        />

                        <ChatSearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                        />

                        <OnlineFriendsSection
                            friends={mockFriends}
                            onFriendClick={openFriend}
                            onCreateStoryClick={() =>
                                setNotice(
                                    "Tính năng bản tin đang được phát triển."
                                )
                            }
                        />

                        <ConversationFilters
                            activeFilter={filter}
                            totalCount={mockConversations.length}
                            unreadCount={unreadCount}
                            pinnedCount={pinnedCount}
                            onChange={setFilter}
                        />

                        <ConversationList
                            conversations={visibleConversations}
                            onSelect={openConversation}
                        />
                    </section>

                    <section className="chats-main">
                        {selectedConversation ? (
                            <ChatDetail
                                conversationId={selectedConversation.id}
                                name={selectedConversation.name}
                            />
                        ) : (
                            <div className="chats-empty">
                                <div className="chats-empty__content">
                                    <h2>Chào mừng đến với EchoChat</h2>
                                    <p>
                                        Chọn một cuộc trò chuyện để bắt đầu
                                        nhắn tin.
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <BottomNavigation
                onUnavailable={(page) =>
                    setNotice(`Trang ${page} đang được phát triển.`)
                }
            />

            {notice && (
                <div className="chats-page__notice" role="status">
                    <span>{notice}</span>

                    <button
                        type="button"
                        aria-label="Đóng thông báo"
                        onClick={() => setNotice("")}
                    >
                        ×
                    </button>
                </div>
            )}
            {isCreateGroupOpen && (
                <CreateGroupModal
                    friends={mockFriends}
                    onClose={() => setIsCreateGroupOpen(false)}
                    onCreate={(groupName, memberIds) => {
                        console.log("Tên nhóm:", groupName);
                        console.log("Danh sách thành viên:", memberIds);

                        setIsCreateGroupOpen(false);
                        setNotice(`Đã tạo nhóm "${groupName}" (bản thử nghiệm).`);
                    }}
                />
            )}
        </div>
    );
}

export default ChatsPage;
