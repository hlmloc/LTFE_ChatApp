import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import MessageList from "../components/chat_detail/MessageList";
import ChatInput from "../components/chat_detail/ChatInput";
import ChatHeader from "../components/chat_detail/ChatHeader";

import { messageService } from "../services/MessageService";
import { conversationService } from "../services/ConversationService";

import {
    setMessages,
    setMessagesLoading,
    setMessagesError,
    clearMessages,
    addMessage,
} from "../store/slice/messageSlice";
import type { RootState, AppDispatch } from "../store/Store";

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
    const { username, connectionStatus } = useSelector((state: RootState) => state.auth);
    const loading = useSelector((state: RootState) => state.messages.loading);
    const [online, setOnline] = useState<boolean>();

    useEffect(() => {
        if (type !== "direct") return;

        let active = true;
        conversationService.checkUserOnline(name).then(result => {
            if (active) setOnline(result);
        }).catch(() => {
        });

        return () => { active = false; };
    }, [name, type]);

    const handleSendMessage = async (content: string) => {
        if (!username) {
            throw new Error("Không tìm thấy tài khoản đăng nhập");
        }

        if (connectionStatus !== "connected" || loading) {
            throw new Error("Hãy đợi cuộc trò chuyện kết nối và tải xong.");
        }

        const message = messageService.sendMessage(type === "group" ? "room" : "people", name, content, username);

        dispatch(addMessage(message));
    };

    useEffect(() => {
        let isActive = true;

        dispatch(clearMessages());
        dispatch(setMessagesLoading(true));

        const request = type === "group"
            ? messageService.getRoomChatMessages(name, 1)
            : messageService.getPeopleChatMessages(name, 1);

        request
            .then((messages) => {
                if (!isActive) return;

                dispatch(
                    setMessages({
                        chatName: name,
                        messages: [...messages].reverse(),
                    })
                );
            })
            .catch((error) => {
                if (!isActive) return;

                dispatch(
                    setMessagesError(
                        error instanceof Error
                            ? error.message
                            : "Không thể tải lịch sử tin nhắn"
                    )
                );
            });

        return () => {
            isActive = false;
        };
    }, [name, type, conversationId, dispatch]);

    return (
        <div
            className="chat-detail-container"
            data-conversation-id={conversationId}
        >
            <ChatHeader name={name} online={online} onBack={onBack} />

            <MessageList />

            <ChatInput onSend={handleSendMessage} />
        </div>
    );
}