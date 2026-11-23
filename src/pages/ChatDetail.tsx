import {useEffect, useState} from "react";
import { useSelector, useDispatch } from "react-redux";

import MessageList from "../components/chat_detail/MessageList";
import ChatInput from "../components/chat_detail/ChatInput";
import ChatHeader from "../components/chat_detail/ChatHeader";
import { conversationService } from "../services/ConversationService";
import { messageService } from "../services/MessageService";
import { roomService } from "../services/RoomService";
import {
    setMessages,
    setMessagesLoading,
    setMessagesError,
    clearMessages,
    addMessage,
} from "../store/slice/messageSlice";
import { webSocketService } from "../services/WebSocketService";
import type { RootState, AppDispatch } from "../store/Store";
import { getEditTargetId, type DisplayMessage, type ReplyTarget } from "../data/messageProtocol";
import { parseStickerMessage } from "../data/stickers";

import "./ChatDetail.css";

type ChatDetailProps = {
    conversationId: string;
    name: string;
    type: "direct" | "group";
    onBack?: () => void;
};

export default function ChatDetail({
                                       conversationId,
                                       name,
                                       type,
                                       onBack,
                                   }: ChatDetailProps) {
    const dispatch = useDispatch<AppDispatch>();

    const username = useSelector(
        (state: RootState) => state.auth.username
    );
    const [online, setOnline] = useState<boolean>();
    const [replyTo, setReplyTo] = useState<ReplyTarget>();

    const handleSendMessage = async (content: string) => {
        if (!username) {
            throw new Error("Không tìm thấy tài khoản đăng nhập");
        }

        const message =
            type === "direct"
                ? await messageService.sendPeopleMessage(
                    name,
                    content,
                    username,
                    replyTo,
                )
                : await messageService.sendRoomMessage(
                    name,
                    content,
                    username,
                    replyTo,
                );

        dispatch(addMessage(message));
        setReplyTo(current => current === replyTo ? undefined : current);
    };

    function handleEditMessage(message: DisplayMessage, text: string) {
        const content = text.trim();
        const targetId = getEditTargetId(message);

        if (!username || message.name !== username || !targetId || message.recalled || parseStickerMessage(message.mes)) {
            throw new Error("Không thể chỉnh sửa tin nhắn này");
        }
        if (!content || content === message.mes) return;

        const editRecord = messageService.sendEdit(
            name,
            type === "direct" ? "people" : "room",
            username,
            targetId,
            content,
        );

        dispatch(addMessage(editRecord));
    }

    function handleReplyMessage(message: DisplayMessage) {
        if (message.recalled) return;

        setReplyTo({
            author: message.name,
            text: parseStickerMessage(message.mes) ? "Sticker" : message.mes.slice(0, 160),
            messageId: message.messageId,
        });
    }

    function handleRecallMessage(message: DisplayMessage) {
        if (!username || message.name !== username || !message.messageId || message.recalled) return;
        if (!window.confirm("Gỡ tin nhắn này?")) return;

        try {
            const record = messageService.sendRecall(
                name,
                type === "direct" ? "people" : "room",
                username,
                message.messageId,
            );

            dispatch(addMessage(record));
        } catch (error) {
            window.alert(error instanceof Error ? error.message : "Không thể gỡ tin nhắn.");
        }
    }

    useEffect(() => {
        let isActive = true;

        const loadMessages = async () => {
            dispatch(clearMessages());
            dispatch(setMessagesLoading(true));

            try {
                if (type === "group") {
                    await roomService.joinRoom(name);
                    if (!isActive) return;
                }

                const messages =
                    type === "direct"
                        ? await messageService.getPeopleChatMessages(name, 1)
                        : await messageService.getRoomChatMessages(name, 1);

                if (!isActive) return;

                dispatch(
                    setMessages({
                        chatName: name,
                        messages: [...messages].reverse(),
                    })
                );
            } catch (error) {
                if (!isActive) return;

                dispatch(
                    setMessagesError(
                        error instanceof Error
                            ? error.message
                            : "Không thể tải lịch sử tin nhắn"
                    )
                );
            }
        };

        loadMessages();

        return () => {
            isActive = false;
        };
    }, [name, conversationId, type, dispatch]);

    useEffect(() => {
        if (!username) return;

        const unsubscribe = webSocketService.subscribe(
            "SEND_CHAT",
            (response) => {
                if (response.status !== "success") return;

                if (!response.data || typeof response.data !== "object") {
                    return;
                }

                const data = response.data as {
                    id?: number;
                    name?: string;
                    to?: string;
                    mes?: string;
                    type?: number;
                };

                if (
                    typeof data.name !== "string" ||
                    typeof data.mes !== "string"
                ) {
                    return;
                }

                if (type === "direct") {
                    if (
                        data.type !== 0 ||
                        data.to !== username ||
                        data.name !== name
                    ) {
                        return;
                    }
                }

                if (type === "group") {
                    if (
                        data.type !== 1 ||
                        data.to !== name ||
                        data.name === username
                    ) {
                        return;
                    }
                }

                dispatch(
                    addMessage({
                        id: typeof data.id === "number" ? data.id : -Date.now(),
                        name: data.name,
                        to: data.to!,
                        mes: data.mes,
                        createAt: new Date().toISOString(),
                        type: data.type as 0 | 1,
                    })
                );
            }
        );

        return () => {
            unsubscribe();
        };
    }, [username, name, type, dispatch]);
    useEffect(() => {
        if (type !== "direct") return;

        let active = true;
        conversationService.checkUserOnline(name).then(result => {
            if (active) setOnline(result);
        }).catch(() => {
        });

        return () => { active = false; };
    }, [name, type]);
    return (
        <div
            className="chat-detail-container"
            data-conversation-id={conversationId}
        >
            <ChatHeader name={name} online={online} onBack={onBack} />

            <MessageList
                onEdit={handleEditMessage}
                onReply={handleReplyMessage}
                onRecall={handleRecallMessage}
            />

            {replyTo && (
                <div className="reply-draft">
                    <span>Đang trả lời {replyTo.author} · {replyTo.text}</span>
                    <button type="button" onClick={() => setReplyTo(undefined)}>Hủy</button>
                </div>
            )}

            <ChatInput onSend={handleSendMessage} />
        </div>
    );
}
