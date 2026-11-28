import { ArrowDown, MoreHorizontal } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getEditTargetId, resolveMessages, type DisplayMessage } from "../../data/messageProtocol";
import { parseStickerMessage } from "../../data/stickers";
import type { RootState } from "../../store/Store";
import { addMessage } from "../../store/slice/messageSlice";
import { messageService } from "../../services/MessageService";
import { watchVisibleMessages } from "./watchVisibleMessages";
import MessageBubble from "./MessageBubble";
import MessageSearchBar from "./MessageSearchBar";
import { matchesMessage } from "../../data/messageSearch";
import "./MessageList.css";

type MessageListProps = {
    searchOpen: boolean;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onCloseSearch: () => void;
    peerName?: string;
    onEdit: (message: DisplayMessage) => void;
    onReply: (message: DisplayMessage) => void;
    onRecall: (message: DisplayMessage) => void;
};

function isNearBottom(list: HTMLDivElement) {
    return list.scrollHeight - list.scrollTop - list.clientHeight <= 80;
}

function closeMessageActions(button: HTMLButtonElement) {
    const details = button.closest("details");
    if (!details) return;

    details.open = false;
    details.querySelector("summary")?.focus();
}

export default function MessageList({searchOpen, searchQuery, onSearchChange, onCloseSearch, peerName,
                                        onEdit,
                                        onReply,
                                        onRecall,
                                    }: MessageListProps) {
    const dispatch = useDispatch();
    const chatName = useSelector((state: RootState) => state.messages.currentChatName);
    const messages = useSelector((state: RootState) => state.messages.messages);
    const loading = useSelector((state: RootState) => state.messages.loading);
    const error = useSelector((state: RootState) => state.messages.error);
    const currentUsername = useSelector((state: RootState) => state.auth.username);

    const visibleMessages = useMemo(() => resolveMessages(messages), [messages]);
    const seenMessage = peerName && peerName === chatName
        ? visibleMessages.filter(message =>
            message.name === currentUsername && message.to === peerName && message.seenByRecipient
        ).slice(-1)[0]
        : undefined;

    const readerInitials = peerName?.trim().slice(0, 2).toUpperCase();
    const query = searchOpen ? searchQuery.trim() : "";
    const items = useMemo(() => visibleMessages.map((message, index) => ({
        message,
        key: message.messageId
            ? `${message.name}:${message.messageId}`
            : `legacy:${message.id}:${index}`,
    })), [visibleMessages]);
    const results = useMemo(() => query ? items.filter(({ message }) => matchesMessage(message, query)) : [], [items, query]);
    const resultKeys = useMemo(() => new Set(results.map(({ key }) => key)), [results]);
    const [selectedKey, setSelectedKey] = useState<string>();
    const selectedIndex = results.findIndex(({ key }) => key === selectedKey);
    const activeIndex = selectedIndex >= 0 ? selectedIndex : results.length - 1;
    const activeKey = results[activeIndex]?.key;
    const listRef = useRef<HTMLDivElement>(null);
    const activeRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const followLatest = useRef(true);
    const [showLatest, setShowLatest] = useState(false);

    const syncScroll = useCallback(() => {
        const list = listRef.current;
        if (!list) return;

        if (loading || error) {
            followLatest.current = true;
            setShowLatest(false);
            return;
        }

        if (searchOpen) {
            followLatest.current = false;
            return;
        }

        if (followLatest.current) list.scrollTop = list.scrollHeight;
        followLatest.current = isNearBottom(list);
        setShowLatest(!followLatest.current);
    }, [loading, error, searchOpen]);

    useLayoutEffect(() => {
        syncScroll();
    }, [items, syncScroll]);

    useLayoutEffect(() => {
        const list = listRef.current;
        const content = contentRef.current;
        if (!list || !content) return;

        const observer = new ResizeObserver(syncScroll);
        observer.observe(list);
        observer.observe(content);
        return () => observer.disconnect();
    }, [syncScroll]);

    function handleScroll() {
        const list = listRef.current;
        if (!list || loading || error || searchOpen) return;
        followLatest.current = isNearBottom(list);
        setShowLatest(!followLatest.current);
    }

    function scrollToLatest() {
        const list = listRef.current;
        if (!list) return;
        followLatest.current = true;
        list.scrollTop = list.scrollHeight;
        setShowLatest(false);
    }

    useEffect(() => {
        if (!activeKey || loading || error) return;
        const list = listRef.current;
        const target = activeRef.current;
        if (!list || !target) return;

        const listRect = list.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        list.scrollTop += targetRect.top - listRect.top - (list.clientHeight - targetRect.height) / 2;
    }, [activeKey, query, loading, error]);

    useEffect(() => {
        const list = listRef.current;
        if (!list || loading || error || !currentUsername || !peerName || peerName !== chatName) return;

        let lastRead = -1;
        visibleMessages.forEach((message, index) => {
            if (message.name === peerName && message.to === currentUsername && message.seenByRecipient) {
                lastRead = index;
            }
        });

        return watchVisibleMessages(list, lastRead, index => {
            const targetId = getEditTargetId(visibleMessages[index]);
            if (targetId) dispatch(addMessage(messageService.sendSeen(peerName, currentUsername, targetId)));
        });
    }, [visibleMessages, currentUsername, peerName, chatName, loading, error, dispatch]);

    function navigate(direction: -1 | 1) {
        if (!results.length) return;
        const nextIndex = (activeIndex + direction + results.length) % results.length;
        setSelectedKey(results[nextIndex].key);
    }

    function changeSearch(value: string) {
        setSelectedKey(undefined);
        onSearchChange(value);
    }

    function closeSearch() {
        setSelectedKey(undefined);
        onCloseSearch();
    }

    return (
        <>
            {searchOpen && (
                <MessageSearchBar
                    value={searchQuery}
                    count={query && !loading && !error ? results.length : undefined}
                    position={activeIndex + 1}
                    onChange={changeSearch}
                    onNavigate={navigate}
                    onClose={closeSearch}
                />
            )}
            <div className="message-list-wrapper">
                <div className="message-list-container" ref={listRef} onScroll={handleScroll}>
                    <div className="message-list-content" ref={contentRef}>
                        {loading ? <p>Đang tải tin nhắn...</p> : error ? <p>{error}</p> : items.length === 0 ? (
                            <p>Chưa có tin nhắn nào.</p>
                        ) : items.map(({ message, key }, index) => {
                            const isMine = message.name === currentUsername;
                            const canManageMessage = isMine && Boolean(message.messageId);
                            const canEdit = isMine &&
                                !message.attachment &&
                                !message.recalled &&
                                Boolean(getEditTargetId(message)) &&
                                !parseStickerMessage(message.mes);
                            const side = isMine ? "mine" : "other";
                            const matched = resultKeys.has(key);
                            const active = key === activeKey;

                            return (
                                <div
                                    key={key}
                                    data-read-index={peerName && message.name === peerName && message.to === currentUsername && getEditTargetId(message) ? index : undefined}
                                    ref={active ? activeRef : undefined}
                                    className={`message-item ${side}${matched ? " message-item--matched" : ""}${active ? " message-item--active-match" : ""}`}
                                >
                                    {message.replyTo && (
                                        <div className="message-reply">
                                            {message.replyTo.author} · {message.replyTo.text}
                                        </div>
                                    )}

                                    <div className="message-item__line">
                                        <MessageBubble
                                            text={message.mes}
                                            isMine={isMine}
                                            attachment={message.attachment}
                                            recalled={message.recalled}
                                        />

                                        {!message.recalled && (
                                            <details
                                                className="message-actions"
                                                name="message-actions"
                                                onBlur={event => {
                                                    const details = event.currentTarget;

                                                    if (!details.contains(event.relatedTarget)) {
                                                        details.open = false;
                                                    }
                                                }}
                                                onKeyDown={event => {
                                                    const details = event.currentTarget;
                                                    if (event.key !== "Escape" || !details.open) return;

                                                    details.open = false;
                                                    details.querySelector("summary")?.focus();
                                                }}
                                            >
                                                <summary aria-label="Thao tác với tin nhắn">
                                                    <MoreHorizontal size={18} aria-hidden="true" />
                                                </summary>

                                                <div className="message-actions__panel">
                                                    <button
                                                        type="button"
                                                        onClick={event => {
                                                            closeMessageActions(event.currentTarget);
                                                            onReply(message);
                                                        }}
                                                    >
                                                        Trả lời
                                                    </button>

                                                    {canEdit && (
                                                        <button
                                                            type="button"
                                                            onClick={event => {
                                                                closeMessageActions(event.currentTarget);
                                                                onEdit(message);
                                                            }}
                                                        >
                                                            Chỉnh sửa
                                                        </button>
                                                    )}

                                                    {canManageMessage && (
                                                        <button
                                                            type="button"
                                                            onClick={event => {
                                                                closeMessageActions(event.currentTarget);
                                                                onRecall(message);
                                                            }}
                                                        >
                                                            Gỡ tin nhắn
                                                        </button>
                                                    )}
                                                </div>
                                            </details>
                                        )}
                                    </div>

                                    {message.edited && (
                                        <small className="message-item__edited">
                                            Đã chỉnh sửa
                                        </small>
                                    )}
                                    {message === seenMessage && readerInitials && (
                                        <span
                                            className="message-item__seen"
                                            role="img"
                                            aria-label={`${peerName} đã xem`}
                                            title={`${peerName} đã xem`}>
                                            {readerInitials}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                {showLatest && !searchOpen && !loading && !error && (
                    <button
                        type="button"
                        className="message-scroll-latest"
                        aria-label="Đến tin nhắn mới nhất"
                        title="Đến tin nhắn mới nhất"
                        onClick={scrollToLatest}
                    >
                        <ArrowDown size={20} aria-hidden="true" />
                    </button>
                )}
            </div>
        </>
    );
}
