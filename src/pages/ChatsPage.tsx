
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

type SelectedChat = { id: string; name: string; type: "direct" | "group" };

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
    const [confirmedRoomChanges, setConfirmedRoomChanges] = useState(new Map<string, boolean>());
    const [loading, setLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [lastSynced, setLastSynced] = useState("");
    const [error, setError] = useState("");
    const [reload, setReload] = useState(0);

    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<ChatFilter>("all");
    const [selectedChat, setSelectedChat] = useState<SelectedChat | null>(null);
    const [directUsername, setDirectUsername] = useState("");
    const [directChatError, setDirectChatError] = useState("");
    const [isCheckingUser, setIsCheckingUser] = useState(false);

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
            setConfirmedRoomChanges(new Map());
            setSelectedChat(null);
            setHasLoaded(false);
            setLastSynced("");
            setError("");
            setLoading(false);
            return () => { active = false; };
        }

        setLoading(true);
        setError("");

        const request = reload === 0
            ? conversationService.getUserList()
            : conversationService.refreshUserList();

        request.then(items => {
            if (!active) return;

            setServerChats(items);
            setHasLoaded(true);
            setLastSynced(new Date().toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit"
            }));

            setLoading(false);
        }).catch(err => {
            if (!active) return;

            setError(err instanceof Error ? err.message : "Không thể tải danh sách chat");
            setLoading(false);
        });
        return () => { active = false; };
    }, [isAuthenticated, connectionStatus, username, reload]);

    const conversations = useMemo(() => {
        const chats = serverChats.filter(item => item.type === 0 || confirmedRoomChanges.get(item.name) !== false);
        const roomsOnServer = new Set(chats.filter(item => item.type === 1).map(item => item.name));
        const missingRooms: ChatListItem[] = [];

        // Phòng đã được xác nhận có thể chưa xuất hiện trong danh sách chat gần đây.
        for (const [name, joined] of confirmedRoomChanges) {
            if (joined && !roomsOnServer.has(name)) missingRooms.push({ name, type: 1, actionTime: "" });
        }

        return [...missingRooms, ...chats].map(toConversation);
    }, [serverChats, confirmedRoomChanges]);

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

    async function handleStartDirectChat(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isCheckingUser) return;

        const name = directUsername.trim();
        if (!name) return;
        if (name === username) {
            setDirectChatError("Hãy nhập tên người dùng khác.");
            return;
        }

        setDirectChatError("");
        setIsCheckingUser(true);
        try {
            if (!(await conversationService.checkUserExists(name))) {
                setDirectChatError(`Không tìm thấy tài khoản "${name}".`);
                return;
            }

            setSelectedChat({ id: `0:${name}`, name, type: "direct" });
            setDirectUsername("");
        } catch (error) {
            setDirectChatError(error instanceof Error ? error.message : "Không thể kiểm tra tài khoản");
        } finally {
            setIsCheckingUser(false);
        }
    }

    function updateRoomList(name: string, joined: boolean) {
        setConfirmedRoomChanges(current => new Map(current).set(name, joined));
        setReload(value => value + 1);

        if (joined) {
            setSearchQuery("");
            setFilter("group");
            setSelectedChat({ id: `1:${name}`, name, type: "group" });
        } else {
            setSelectedChat(current => current?.id === `1:${name}` ? null : current);
        }
    }

    async function copyRoomName(name: string) {
        try {
            await navigator.clipboard.writeText(name);
            setNotice(`Đã sao chép tên phòng "${name}".`);
        } catch {
            setNotice(`Hãy sao chép tên phòng thủ công: ${name}`);
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
            updateRoomList(room.name, true);
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
            setNotice(`Đã tham gia phòng "${roomName}" thành công.`);
            updateRoomList(roomName, true);
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

            setNotice(`Đã rời phòng "${room.name}" thành công.`);
            updateRoomList(room.name, false);
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

                        <form className="chats-page__join" onSubmit={handleStartDirectChat}>
                            <label htmlFor="direct-username">Bắt đầu chat 1-1</label>
                            <div className="chats-page__join-fields">
                                <input
                                    id="direct-username"
                                    value={directUsername}
                                    onChange={event => {
                                        setDirectUsername(event.target.value);
                                        setDirectChatError("");
                                    }}
                                    placeholder="Nhập tên người dùng"
                                    autoComplete="off"
                                    disabled={isCheckingUser}
                                />
                                <button type="submit" disabled={isCheckingUser || !directUsername.trim()}>
                                    {isCheckingUser ? "Đang kiểm tra..." : "Mở chat"}
                                </button>
                            </div>
                            {directChatError && (
                                <p className="chats-page__join-error" role="alert">{directChatError}</p>
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
                            <span>{lastSynced ? `Đã đồng bộ lúc ${lastSynced}` : "Danh sách từ server"}</span>

                            <button
                                type="button"
                                disabled={loading || !isAuthenticated || connectionStatus !== "connected"}
                                onClick={() => setReload(value => value + 1)}
                            >
                                {loading && hasLoaded ? "Đang đồng bộ..." : "Tải lại"}
                            </button>
                        </div>

                        {error && (
                            <div className="chats-page__state" role="alert">
                                <p>Không thể đồng bộ danh sách: {error}</p>
                                <button type="button" onClick={() => setReload(value => value + 1)}>
                                    Thử lại
                                </button>
                            </div>
                        )}

                        {conversations.length > 0 ? (
                            <ConversationList
                                conversations={visibleConversations}
                                onSelect={openConversation}
                            />
                        ) : loading && !hasLoaded ? (
                            <p className="chats-page__state" role="status">
                                Đang tải danh sách chat...
                            </p>
                        ) : !hasLoaded && error ? null : (
                            <p className="chats-page__state">
                                Chưa có cuộc trò chuyện hoặc phòng chat nào.
                            </p>
                        )}
                    </section>

                    <section className="chats-main">
                        {selectedChat ? (
                            <div className="chats-page__chat-panel">
                                {selectedChat.type === "group" && (
                                    <div className="chats-page__room-actions">
                                        <span>Phòng: {selectedChat.name}</span>

                                        <div className="chats-page__room-buttons">
                                            <button type="button" onClick={() => void copyRoomName(selectedChat.name)}>
                                                Sao chép tên phòng
                                            </button>
                                            <button
                                                type="button"
                                                className="chats-page__leave-room"
                                                disabled={isLeavingRoom}
                                                onClick={() => void handleLeaveRoom()}
                                            >
                                                {isLeavingRoom ? "Đang rời phòng..." : "Rời phòng"}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="chats-page__chat-body">
                                    <ChatDetail
                                        key={selectedChat.id}
                                        conversationId={selectedChat.id}
                                        name={selectedChat.name}
                                        type={selectedChat.type}
                                        onBack={() => setSelectedChat(null)}
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
