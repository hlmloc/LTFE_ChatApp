import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";

import { getEditTargetId, resolveMessages, type DisplayMessage } from "../../data/messageProtocol";
import { parseStickerMessage } from "../../data/stickers";
import type { RootState } from "../../store/Store";
import MessageBubble from "./MessageBubble";
import "./MessageList.css";

type MessageListProps = {
    onEdit: (message: DisplayMessage, text: string) => void;
    onReply: (message: DisplayMessage) => void;
    onRecall: (message: DisplayMessage) => void;
};

function closeMessageActions(button: HTMLButtonElement) {
    const details = button.closest("details");
    if (!details) return;

    details.open = false;
    details.querySelector("summary")?.focus();
}

export default function MessageList({ onEdit, onReply, onRecall }: MessageListProps) {
    const messages = useSelector((state: RootState) => state.messages.messages);
    const loading = useSelector((state: RootState) => state.messages.loading);
    const error = useSelector((state: RootState) => state.messages.error);
    const currentUsername = useSelector((state: RootState) => state.auth.username);
    const [editDraft, setEditDraft] = useState<{ key: string; text: string; error?: string }>();

    function saveEdit(message: DisplayMessage) {
        if (!editDraft || !editDraft.text.trim()) return;

        try {
            onEdit(message, editDraft.text);
            setEditDraft(undefined);
        } catch (error) {
            setEditDraft({
                ...editDraft,
                error: error instanceof Error ? error.message : "Không thể lưu chỉnh sửa",
            });
        }
    }

    if (loading) {
        return (
            <div className="message-list-container">
                <p>Đang tải tin nhắn...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="message-list-container">
                <p>{error}</p>
            </div>
        );
    }

    const visibleMessages = resolveMessages(messages);

    if (visibleMessages.length === 0) {
        return (
            <div className="message-list-container">
                <p>Chưa có tin nhắn nào.</p>
            </div>
        );
    }

    return (
        <div className="message-list-container">
            {visibleMessages.map((message, index) => {
                const isMine = message.name === currentUsername;
                const canManageMessage = isMine && Boolean(message.messageId);
                const canEdit = isMine && !message.recalled && Boolean(getEditTargetId(message))
                    && !parseStickerMessage(message.mes);
                const side = isMine ? "mine" : "other";
                const key = message.messageId
                    ? `${message.name}:${message.messageId}`
                    : `legacy:${message.id}:${index}`;
                const draft = canEdit && editDraft?.key === key ? editDraft : undefined;

                return (
                    <div key={key} className={`message-item ${side}`}>
                        {message.replyTo && (
                            <div className="message-reply">
                                {message.replyTo.author} · {message.replyTo.text}
                            </div>
                        )}

                        {draft ? (
                            <form
                                className="message-edit"
                                onSubmit={event => {
                                    event.preventDefault();
                                    saveEdit(message);
                                }}
                                onKeyDown={event => {
                                    if (event.key === "Escape" && !event.nativeEvent.isComposing) {
                                        setEditDraft(undefined);
                                    }
                                }}
                            >
                                <textarea
                                    aria-label="Chỉnh sửa tin nhắn"
                                    rows={3}
                                    autoFocus
                                    value={draft.text}
                                    onChange={event => setEditDraft({ key, text: event.target.value })}
                                />
                                {draft.error && <p role="alert">{draft.error}</p>}
                                <div className="message-edit__actions">
                                    <button type="button" onClick={() => setEditDraft(undefined)}>Hủy</button>
                                    <button
                                        type="submit"
                                        disabled={!draft.text.trim() || draft.text.trim() === message.mes}
                                    >
                                        Lưu
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="message-item__line">
                                <MessageBubble text={message.mes} isMine={isMine} />

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
                                                        setEditDraft({ key, text: message.mes });
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
                        )}

                        {message.edited && (
                            <small className="message-item__edited">
                                Đã chỉnh sửa
                            </small>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
