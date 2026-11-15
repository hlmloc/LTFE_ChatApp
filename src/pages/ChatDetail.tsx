import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import MessageList from "../components/chat_detail/MessageList";
import ChatInput from "../components/chat_detail/ChatInput";
import ChatHeader from "../components/chat_detail/ChatHeader";

import { messageService } from "../services/MessageService";

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
};

export default function ChatDetail({
                                       conversationId,
                                       name,
                                   }: ChatDetailProps) {
    const dispatch = useDispatch<AppDispatch>();

    const username = useSelector(
        (state: RootState) => state.auth.username
    );

    const handleSendMessage = async (content: string) => {
        if (!username) {
            throw new Error("Không tìm thấy tài khoản đăng nhập");
        }

        const message = await messageService.sendPeopleMessage(
            name,
            content,
            username
        );

        dispatch(addMessage(message));
    };
    useEffect(() => {
        let isActive = true;

        dispatch(clearMessages());
        dispatch(setMessagesLoading(true));

        messageService
            .getPeopleChatMessages(name, 1)
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
    }, [name, conversationId, dispatch]);

    return (
        <div
            className="chat-detail-container"
            data-conversation-id={conversationId}
        >
            <ChatHeader name={name} />

            <MessageList />

            <ChatInput onSend={handleSendMessage} />
        </div>
    );
}
