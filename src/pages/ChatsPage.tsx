
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import ChatDetail from "./ChatDetail";
import ChatListHeading from "../components/chat/ChatListHeading";
import ChatSearchBar from "../components/chat/ChatSearchBar";
import ConversationFilters from "../components/chat/ConversationFilters";
import ConversationList from "../components/chat/ConversationList";
import BottomNavigation from "../components/chat/BottomNavigation";
import CreateGroupModal from "../components/chat/CreateGroupModal";

import { conversationService, type ChatListItem } from "../services/ConversationService";
import { roomService } from "../services/RoomService";
import { authSessionManager } from "../services/AuthSessionManager";

import type { RootState } from "../store/Store";
import type { ChatFilter, Conversation } from "../types/chat";
import "./ChatsPage.css";

function normalizeText(text: string) {
    return text.toLocaleLowerCase("vi").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
}

function toConversation(item: ChatListItem): Conversation {
    const isGroup = item.type === 1;

    return {
        id: `${item.type}:${item.name}`,
        name: item.name,
        initials: item.name.slice(0, 2).toUpperCase(),
        tone: isGroup ? "violet" : "blue",
        type: isGroup ? "group" : "direct",
        preview: "Nhấn để xem tin nhắn",
        time: item.actionTime.slice(5, 16),
        messageKind: "text",
        unreadCount: 0,
        pinned: false,
        online: false
    };
}

export default function ChatsPage() {
    const navigate = useNavigate();
    const { username, isAuthenticated, connectionStatus } = useSelector((state: RootState) => state.auth);

    const [serverChats, setServerChats] = useState<ChatListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [reload, setReload] = useState(0);

    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<ChatFilter>("all");
    const [selectedChat, setSelectedChat] = useState<{ id: string; name: string; type: "direct" | "group" } | null>(null);

    const [notice, setNotice] = useState("");
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [createGroupError, setCreateGroupError] = useState("");

    const [joinRoomName, setJoinRoomName] = useState("");
    const [joinRoomError, setJoinRoomError] = useState("");
    const [isJoiningRoom, setIsJoiningRoom] = useState(false);
    const [isLeavingRoom, setIsLeavingRoom] = useState(false);

    useEffect(() => {
        let active = true;

        if (!isAuthenticated || connectionStatus !== "connected") {
            setServerChats([]);
            setLoading(false);
            return () => { active = false; };
        }

        setLoading(true);
        setError("");

        conversationService.getUserList()
            .then(items => {
                if (!active) return;
                setServerChats(items);
                setLoading(false);
            })
            .catch(err => {
                if (!active) return;
                setError(err instanceof Error ? err.message : "Không thể tải danh sách chat");
                setLoading(false);
            });

        return () => { active = false; };
    }, [isAuthenticated, connectionStatus, username, reload]);

    const conversations = useMemo(() => serverChats.map(toConversation), [serverChats]);

    const directCount = conversations.filter(chat => chat.type === "direct").length;
    const groupCount = conversations.filter(chat => chat.type === "group").length;

    const visibleConversations = useMemo(() => {
        const keyword = normalizeText(searchQuery.trim());

        return conversations.filter(chat => {
            const matchesSearch = normalizeText(chat.name).includes(keyword);
            const matchesFilter = filter === "all" || chat.type === filter;
            return matchesSearch && matchesFilter;
        });
    }, [conversations, searchQuery, filter]);

    function openConversation(id: string) {
        const chat = conversations.find(item => item.id === id);

        if (chat) {
            setSelectedChat({
                id: chat.id,
                name: chat.name,
                type: chat.type === "group" ? "group" : "direct"
            });
        }
    }

    function openCreateGroup() {
        if (loading) {
            setNotice("Đang tải danh sách chat, hãy thử lại sau.");
            return;
        }

        if (!isAuthenticated || connectionStatus !== "connected") {
            setNotice("Chưa kết nối hoặc chưa đăng nhập.");
            return;
        }

        setCreateGroupError("");
        setIsCreateGroupOpen(true);
    }

    function closeCreateGroup() {
        if (isCreatingRoom) return;

        setCreateGroupError("");
        setIsCreateGroupOpen(false);
    }

    async function handleCreateRoom(groupName: string) {
        if (isCreatingRoom) return;

        if (!isAuthenticated || connectionStatus !== "connected") {
            setCreateGroupError("Bạn cần đăng nhập và kết nối với server trước khi tạo nhóm.");
            return;
        }

        setIsCreatingRoom(true);
        setCreateGroupError("");

        try {
            const room = await roomService.createRoom(groupName);

            setIsCreateGroupOpen(false);
            setNotice(`Đã tạo nhóm "${room.name}" thành công.`);
            setReload(value => value + 1);
        } catch (err) {
            setCreateGroupError(err instanceof Error ? err.message : "Không thể tạo nhóm");
        } finally {
            setIsCreatingRoom(false);
        }
    }

    async function handleJoinRoom(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isJoiningRoom) return;

        const roomName = joinRoomName.trim();

        if (!roomName) {
            setJoinRoomError("Vui lòng nhập tên phòng");
            return;
        }

        if (!isAuthenticated || connectionStatus !== "connected") {
            setJoinRoomError("Bạn cần đăng nhập và kết nối với server");
            return;
        }

        setIsJoiningRoom(true);
        setJoinRoomError("");

        try {
            await roomService.joinRoom(roomName);

            setJoinRoomName("");
            setSearchQuery("");
            setFilter("group");
            setNotice(`Đã tham gia phòng "${roomName}" thành công.`);
            setReload(value => value + 1);
        } catch (error) {
            setJoinRoomError(error instanceof Error ? error.message : "Không thể tham gia phòng");
        } finally {
            setIsJoiningRoom(false);
        }
    }

    async function handleLeaveRoom() {
        const room = selectedChat;

        if (!room || room.type !== "group" || isLeavingRoom) return;
        if (!window.confirm(`Bạn có chắc muốn rời phòng "${room.name}"?`)) return;

        if (!isAuthenticated || connectionStatus !== "connected") {
            setNotice("Bạn cần đăng nhập và kết nối với server");
            return;
        }

        setIsLeavingRoom(true);

        try {
            await roomService.outRoom(room.name);

            setSelectedChat(current => current?.id === room.id ? null : current);
            setNotice(`Đã rời phòng "${room.name}" thành công.`);
            setReload(value => value + 1);
        } catch (error) {
            setNotice(error instanceof Error ? error.message : "Không thể rời phòng");
        } finally {
            setIsLeavingRoom(false);
        }
    }

    async function handleLogout() {
        if (isLoggingOut) return;

        setIsLoggingOut(true);

        try {
            const success = await authSessionManager.logout();

            if (!success) {
                window.alert("Đã đăng xuất trên thiết bị, nhưng server chưa xác nhận LOGOUT.");
            }

            navigate("/", { replace: true });
        } catch (err) {
            setNotice(err instanceof Error ? err.message : "Không thể đăng xuất");
        } finally {
            setIsLoggingOut(false);
        }
    }

    return (
        <div className="chats-page">
            <main className="chats-page__content">
                <div className="chats-layout">
                    <section className="chats-sidebar">
                        <div className="chats-page__status">
                            <span>
                                {isAuthenticated && connectionStatus === "connected"
                                    ? "Đã kết nối"
                                    : "Mất kết nối"}
                            </span>

                            <button type="button" disabled={isLoggingOut} onClick={handleLogout}>
                                {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                            </button>
                        </div>

                        <ChatListHeading
                            username={username || "Người dùng"}
                            onCreateGroup={openCreateGroup}
                        />

                        <form className="chats-page__join" onSubmit={handleJoinRoom}>
                            <label htmlFor="join-room-name">Tham gia phòng có sẵn</label>

                            <div className="chats-page__join-fields">
                                <input
                                    id="join-room-name"
                                    value={joinRoomName}
                                    onChange={event => setJoinRoomName(event.target.value)}
                                    placeholder="Nhập tên phòng"
                                    maxLength={40}
                                    disabled={isJoiningRoom}
                                />

                                <button type="submit" disabled={isJoiningRoom || !joinRoomName.trim()}>
                                    {isJoiningRoom ? "Đang tham gia..." : "Tham gia"}
                                </button>
                            </div>

                            {joinRoomError && (
                                <p role="alert" className="chats-page__join-error">
                                    {joinRoomError}
                                </p>
                            )}
                        </form>

                        <ChatSearchBar value={searchQuery} onChange={setSearchQuery} />

                        <ConversationFilters
                            activeFilter={filter}
                            totalCount={conversations.length}
                            directCount={directCount}
                            groupCount={groupCount}
                            onChange={setFilter}
                        />

                        <div className="chats-page__refresh-row">
                            <span>Danh sách từ server</span>
                            <button
                                type="button"
                                disabled={loading || !isAuthenticated}
                                onClick={() => setReload(value => value + 1)}
                            >
                                Tải lại
                            </button>
                        </div>

                        {loading ? (
                            <p className="chats-page__state" role="status">
                                Đang tải danh sách chat...
                            </p>
                        ) : error ? (
                            <div className="chats-page__state" role="alert">
                                <p>{error}</p>
                                <button type="button" onClick={() => setReload(value => value + 1)}>
                                    Thử lại
                                </button>
                            </div>
                        ) : conversations.length === 0 ? (
                            <p className="chats-page__state">
                                Chưa có cuộc trò chuyện hoặc phòng chat nào.
                            </p>
                        ) : (
                            <ConversationList
                                conversations={visibleConversations}
                                onSelect={openConversation}
                            />
                        )}
                    </section>

                    <section className="chats-main">
                        {selectedChat ? (
                            <div className="chats-page__chat-panel">
                                {selectedChat.type === "group" && (
                                    <div className="chats-page__room-actions">
                                        <span>Phòng: {selectedChat.name}</span>

                                        <button
                                            type="button"
                                            disabled={isLeavingRoom}
                                            onClick={() => void handleLeaveRoom()}
                                        >
                                            {isLeavingRoom ? "Đang rời phòng..." : "Rời phòng"}
                                        </button>
                                    </div>
                                )}

                                <div className="chats-page__chat-body">
                                    <ChatDetail
                                        conversationId={selectedChat.id}
                                        name={selectedChat.name}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="chats-empty">
                                <div className="chats-empty__content">
                                    <h2>Chào mừng đến với EchoChat</h2>
                                    <p>Chọn một cuộc trò chuyện để bắt đầu nhắn tin.</p>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <BottomNavigation
                onUnavailable={page => setNotice(`Trang ${page} đang được phát triển.`)}
            />

            {notice && (
                <div className="chats-page__notice" role="status">
                    <span>{notice}</span>
                    <button type="button" onClick={() => setNotice("")} aria-label="Đóng thông báo">
                        ×
                    </button>
                </div>
            )}

            {isCreateGroupOpen && (
                <CreateGroupModal
                    isSubmitting={isCreatingRoom}
                    error={createGroupError}
                    onClose={closeCreateGroup}
                    onCreate={groupName => {
                        void handleCreateRoom(groupName);
                    }}
                />
            )}
        </div>
    );
}
