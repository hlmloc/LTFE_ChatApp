import { useEffect, useRef, useState, type FormEvent } from "react";
import { ChevronDown, Copy, LogIn, LogOut, MessageCircle, RefreshCw, SquarePen, UsersRound, X } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import BottomNavigation from "../components/chat/BottomNavigation";
import ChatSearchBar from "../components/chat/ChatSearchBar";
import ConversationFilters from "../components/chat/ConversationFilters";
import ConversationList from "../components/chat/ConversationList";
import { authSessionManager } from "../services/AuthSessionManager";
import { conversationService, type ChatListItem } from "../services/ConversationService";
import { roomService } from "../services/RoomService";
import type { RootState } from "../store/Store";
import type { ChatFilter, Conversation } from "../types/chat";
import ChatDetail from "./ChatDetail";
import "./ChatsPage.css";

const chatActions = {
    direct: { title: "Nhắn tin 1-1", label: "Tên người dùng", submit: "Mở chat", icon: MessageCircle },
    join: { title: "Tham gia phòng", label: "Tên phòng", submit: "Tham gia", icon: LogIn },
    create: { title: "Tạo nhóm", label: "Tên nhóm", submit: "Tạo nhóm", icon: UsersRound },
};

type ChatAction = keyof typeof chatActions;
type SelectedChat = Pick<Conversation, "id" | "name"> & { type: "direct" | "group" };

function normalizeText(text: string) {
    return text.toLocaleLowerCase("vi").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
}

function toConversation(item: ChatListItem): Conversation {
    const group = item.type === 1;
    return {
        id: `${item.type}:${item.name}`,
        name: item.name,
        initials: item.name.slice(0, 2).toUpperCase(),
        tone: group ? "violet" : "blue",
        type: group ? "group" : "direct",
        preview: group ? "Nhóm chat" : "Trò chuyện cá nhân",
        time: item.actionTime.slice(5, 16),
        messageKind: "text",
        unreadCount: 0,
        pinned: false,
        online: false,
    };
}

function errorText(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

export default function ChatsPage() {
    const navigate = useNavigate();
    const { username, isAuthenticated, connectionStatus } = useSelector((state: RootState) => state.auth);
    const connected = isAuthenticated && connectionStatus === "connected";
    const [reload, setReload] = useState(0);
    const [list, setList] = useState({ version: -1, items: [] as ChatListItem[], error: "" });
    const [roomChanges, setRoomChanges] = useState(new Map<string, boolean>());
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<ChatFilter>("all");
    const [selected, setSelected] = useState<SelectedChat | null>(null);
    const [notice, setNotice] = useState("");
    const [leaving, setLeaving] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [action, setAction] = useState<ChatAction>("direct");
    const [name, setName] = useState("");
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const dialog = useRef<HTMLDialogElement>(null);
    const actionInput = useRef<HTMLInputElement>(null);
    const accountMenu = useRef<HTMLDetailsElement>(null);
    const composeMenu = useRef<HTMLDetailsElement>(null);
    const composeButton = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!connected) return;
        let active = true;
        const request = reload ? conversationService.refreshUserList() : conversationService.getUserList();
        request.then(items => {
            if (active) setList({ version: reload, items, error: "" });
        }).catch(error => {
            if (active) setList(current => ({
                ...current,
                version: reload,
                error: errorText(error, "Không thể đồng bộ danh sách chat"),
            }));
        });
        return () => { active = false; };
    }, [connected, reload, username]);

    useEffect(() => {
        function closeOutside(event: PointerEvent) {
            for (const menu of [accountMenu.current, composeMenu.current]) {
                if (menu?.open && event.target instanceof Node && !menu.contains(event.target)) menu.open = false;
            }
        }
        document.addEventListener("pointerdown", closeOutside);
        return () => document.removeEventListener("pointerdown", closeOutside);
    }, []);

    const loading = connected && list.version !== reload;
    const listError = loading ? "" : list.error;
    const chats = new Map(list.items.map(item => [`${item.type}:${item.name}`, item]));
    for (const [roomName, joined] of roomChanges) {
        const id = `1:${roomName}`;
        if (!joined) chats.delete(id);
        else if (!chats.has(id)) chats.set(id, { name: roomName, type: 1, actionTime: "" });
    }
    const all = Array.from(chats.values(), toConversation);
    const directCount = all.filter(chat => chat.type === "direct").length;
    const keyword = normalizeText(search.trim());
    const visible = all.filter(chat =>
        (filter === "all" || chat.type === filter) && normalizeText(chat.name).includes(keyword)
    );
    const fields = chatActions[action];

    function openAction(next: ChatAction) {
        setAction(next);
        setName("");
        setFormError("");
        if (composeMenu.current) composeMenu.current.open = false;
        dialog.current?.showModal();
        actionInput.current?.focus();
    }

    function openConversation(id: string) {
        const chat = chats.get(id);
        if (chat) setSelected({ id, name: chat.name, type: chat.type === 1 ? "group" : "direct" });
    }

    async function submitAction(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const value = name.trim();
        if (!value || submitting || !connected) return;
        if (action === "direct" && value === username) {
            setFormError("Hãy nhập tên người dùng khác.");
            return;
        }
        setFormError("");
        setSubmitting(true);
        try {
            if (action === "direct") {
                if (!(await conversationService.checkUserExists(value))) {
                    setFormError(`Không tìm thấy tài khoản "${value}".`);
                    return;
                }
                setSelected({ id: `0:${value}`, name: value, type: "direct" });
            } else {
                let roomName = value;
                if (action === "create") roomName = (await roomService.createRoom(value)).name;
                else await roomService.joinRoom(value);

                setRoomChanges(current => new Map(current).set(roomName, true));
                setFilter("group");
                setSearch("");
                setSelected({ id: `1:${roomName}`, name: roomName, type: "group" });
                setReload(current => current + 1);
                setNotice(action === "create" ? `Đã tạo nhóm "${roomName}".` : `Đã tham gia phòng "${roomName}".`);
            }
            dialog.current?.close();
        } catch (error) {
            setFormError(errorText(error, "Không thể hoàn tất thao tác."));
        } finally {
            setSubmitting(false);
        }
    }

    async function leaveRoom() {
        const room = selected;
        if (room?.type !== "group" || leaving || !connected) return;
        if (!window.confirm(`Rời phòng "${room.name}"?`)) return;
        setLeaving(true);
        try {
            await roomService.outRoom(room.name);
            setRoomChanges(current => new Map(current).set(room.name, false));
            setSelected(current => current?.id === room.id ? null : current);
            setReload(current => current + 1);
            setNotice(`Đã rời phòng "${room.name}".`);
        } catch (error) {
            setNotice(errorText(error, "Không thể rời phòng."));
        } finally {
            setLeaving(false);
        }
    }

    async function copyRoomName(roomName: string) {
        try {
            await navigator.clipboard.writeText(roomName);
            setNotice("Đã sao chép tên phòng.");
        } catch {
            setNotice(`Sao chép tên phòng thủ công: ${roomName}`);
        }
    }

    async function logout() {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
            const confirmed = await authSessionManager.logout();
            if (!confirmed) window.alert("Đã đăng xuất trên thiết bị, nhưng server chưa xác nhận LOGOUT.");
            navigate("/", { replace: true });
        } catch (error) {
            setNotice(errorText(error, "Không thể đăng xuất."));
        } finally {
            setLoggingOut(false);
        }
    }

    return (
        <div className={`chats-page${selected ? " chats-page--detail" : ""}`}>
            <main className="chats-layout">
                <aside className="chats-sidebar" aria-label="Hộp thư">
                    <div className="inbox-toolbar" onKeyDown={event => {
                        if (event.key !== "Escape") return;
                        const menu = [accountMenu.current, composeMenu.current].find(item => item?.open);
                        if (menu) {
                            menu.open = false;
                            menu.querySelector("summary")?.focus();
                        }
                    }}>
                        <details name="inbox-menu" ref={accountMenu} className="inbox-menu">
                            <summary className="inbox-account" aria-label={`Menu tài khoản ${username || "Người dùng"}`}>
                                <span>{username || "Người dùng"}</span>
                                <ChevronDown size={16} aria-hidden="true" />
                            </summary>
                            <div className="inbox-menu__panel">
                                <span className="inbox-connection">{connected ? "Đã kết nối" : "Mất kết nối"}</span>
                                <button type="button" onClick={logout} disabled={loggingOut}>
                                    <LogOut size={17} aria-hidden="true" />
                                    {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                                </button>
                            </div>
                        </details>
                        <details name="inbox-menu" ref={composeMenu} className="inbox-menu">
                            <summary ref={composeButton} className="inbox-icon" aria-label="Cuộc trò chuyện mới" title="Cuộc trò chuyện mới">
                                <SquarePen size={23} aria-hidden="true" />
                            </summary>
                            <div className="inbox-menu__panel inbox-menu__panel--right">
                                {(Object.keys(chatActions) as ChatAction[]).map(key => {
                                    const { title, icon: Icon } = chatActions[key];
                                    return <button key={key} type="button" disabled={!connected} onClick={() => openAction(key)}>
                                        <Icon size={18} aria-hidden="true" />{title}
                                    </button>;
                                })}
                            </div>
                        </details>
                    </div>

                    <ChatSearchBar value={search} onChange={setSearch} />
                    <div className="inbox-list-heading">
                        <h1>Tin nhắn</h1>
                        <button type="button" className="inbox-icon" aria-label="Tải lại" title="Tải lại"
                                disabled={!connected || loading} onClick={() => setReload(current => current + 1)}>
                            <RefreshCw size={17} aria-hidden="true" />
                        </button>
                    </div>
                    <ConversationFilters activeFilter={filter} totalCount={all.length} directCount={directCount}
                                         groupCount={all.length - directCount} onChange={setFilter} />

                    {listError && <p className="inbox-state" role="alert">{listError}</p>}
                    {all.length > 0 ? (
                        <ConversationList conversations={visible} onSelect={openConversation} />
                    ) : !listError && (
                        <p className="inbox-state" role="status">
                            {loading ? "Đang tải hộp thư..." : "Chưa có cuộc trò chuyện nào."}
                        </p>
                    )}
                </aside>

                <section className="chats-main" aria-label="Nội dung chat">
                    {selected ? (
                        <>
                            {selected.type === "group" && (
                                <div className="inbox-room-actions">
                                    <button type="button" onClick={() => void copyRoomName(selected.name)}>
                                        <Copy size={15} aria-hidden="true" /> Sao chép tên phòng
                                    </button>
                                    <button type="button" disabled={leaving || !connected} onClick={leaveRoom}>
                                        {leaving ? "Đang rời phòng..." : "Rời phòng"}
                                    </button>
                                </div>
                            )}
                            <div className="inbox-chat-body">
                                <ChatDetail key={selected.id} conversationId={selected.id} name={selected.name}
                                            type={selected.type} onBack={() => setSelected(null)} />
                            </div>
                        </>
                    ) : <p className="inbox-placeholder">Chọn một cuộc trò chuyện để xem tin nhắn.</p>}
                </section>
            </main>

            <BottomNavigation onUnavailable={page => setNotice(`Trang ${page} đang được phát triển.`)} />
            {notice && (
                <div className="inbox-toast" role="status">
                    <span>{notice}</span>
                    <button type="button" className="inbox-icon" aria-label="Đóng thông báo" onClick={() => setNotice("")}>
                        <X size={18} aria-hidden="true" />
                    </button>
                </div>
            )}

            <dialog ref={dialog} className="inbox-dialog" aria-labelledby="inbox-dialog-title"
                    onCancel={event => { if (submitting) event.preventDefault(); }}
                    onClose={() => composeButton.current?.focus()}>
                <form onSubmit={submitAction}>
                    <div className="inbox-dialog__heading">
                        <h2 id="inbox-dialog-title">{fields.title}</h2>
                        <button type="button" className="inbox-icon" aria-label="Đóng" disabled={submitting}
                                onClick={() => dialog.current?.close()}><X size={21} aria-hidden="true" /></button>
                    </div>
                    <label htmlFor="inbox-action-name">{fields.label}</label>
                    <input ref={actionInput} id="inbox-action-name" value={name} autoComplete="off" required
                           maxLength={action === "direct" ? undefined : 40} disabled={submitting} onChange={event => {
                        setName(event.target.value);
                        setFormError("");
                    }} />
                    {action === "create" && (
                        <p className="inbox-hint">Chia sẻ tên phòng để bạn bè có thể tự tham gia.</p>
                    )}
                    {formError && <p className="inbox-form-error" role="alert">{formError}</p>}
                    <button type="submit" className="inbox-submit" disabled={submitting || !name.trim() || !connected}>
                        {submitting ? "Đang xử lý..." : fields.submit}
                    </button>
                </form>
            </dialog>
        </div>
    );
}