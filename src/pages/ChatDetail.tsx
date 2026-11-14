import { useEffect } from "react";
import { useDispatch } from "react-redux";

import MessageList from "../components/chat_detail/MessageList";
import ChatInput from "../components/chat_detail/ChatInput";
import ChatHeader from "../components/chat_detail/ChatHeader";

import { messageService } from "../services/MessageService";

import {
    setMessages,
    setMessagesLoading,
    setMessagesError,
    clearMessages,
} from "../store/slice/messageSlice";

import type { AppDispatch } from "../store/Store";

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
                        messages,
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

            <ChatInput />
        </div>
    );
}
