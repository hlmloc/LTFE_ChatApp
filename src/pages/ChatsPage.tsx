import { useMemo, useRef, useState } from "react";
import ChatDetail from "./ChatDetail";

import Header from "../components/chat/Header";
import ChatListHeading from "../components/chat/ChatListHeading";
import ChatSearchBar from "../components/chat/ChatSearchBar";
import OnlineFriendsSection from "../components/chat/OnlineFriendsSection";
import ConversationFilters from "../components/chat/ConversationFilters";
import ConversationList from "../components/chat/ConversationList";
import BottomNavigation from "../components/chat/BottomNavigation";

import { mockConversations, mockFriends } from "../data/mockChat";
import type { ChatFilter, MediaFilter } from "../types/chat";

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

    const searchInputRef = useRef<HTMLInputElement>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<ChatFilter>("all");
    const [mediaFilter, setMediaFilter] = useState<MediaFilter>(null);
    const [showFilters, setShowFilters] = useState(true);
    const [notice, setNotice] = useState("");

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

            const matchesMedia =
                mediaFilter === null ||
                (mediaFilter === "file" && chat.messageKind === "file") ||
                (mediaFilter === "image" && chat.messageKind === "image");

            return matchesSearch && matchesTab && matchesMedia;
        });
    }, [searchQuery, filter, mediaFilter]);

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
            <Header
                onSearchClick={() => searchInputRef.current?.focus()}
                onProfileClick={() =>
                    setNotice("Trang hồ sơ đang được phát triển.")
                }
            />

            <main className="chats-page__content">
                <div className="chats-layout">
                    {/* Cột trái: Danh sách cuộc trò chuyện */}
                    <section className="chats-sidebar">
                        <ChatListHeading
                            conversationCount={mockConversations.length}
                            onFilterClick={() =>
                                setShowFilters((previous) => !previous)
                            }
                            onNewChatClick={() =>
                                setNotice(
                                    "Tính năng tạo cuộc trò chuyện mới đang được phát triển."
                                )
                            }
                        />

                        <ChatSearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            inputRef={searchInputRef}
                            activeMedia={mediaFilter}
                            onAttachmentClick={() =>
                                setMediaFilter((current) =>
                                    current === "file" ? null : "file"
                                )
                            }
                            onImageClick={() =>
                                setMediaFilter((current) =>
                                    current === "image" ? null : "image"
                                )
                            }
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

                        {showFilters && (
                            <ConversationFilters
                                activeFilter={filter}
                                totalCount={mockConversations.length}
                                unreadCount={unreadCount}
                                pinnedCount={pinnedCount}
                                onChange={setFilter}
                            />
                        )}

                        {mediaFilter !== null && (
                            <div className="chats-page__media-filter">
                                <span>
                                    Đang lọc{" "}
                                    {mediaFilter === "file"
                                        ? "tệp đính kèm"
                                        : "hình ảnh"}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => setMediaFilter(null)}
                                >
                                    Bỏ lọc
                                </button>
                            </div>
                        )}

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
        </div>
    );
}

export default ChatsPage;
