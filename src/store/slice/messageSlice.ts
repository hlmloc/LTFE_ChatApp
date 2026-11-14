
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Message } from "../../types/message";

interface MessageState {
    messages: Message[];
    loading: boolean;
    error: string | null;
    currentChatName: string | null;
}

const initialState: MessageState = {
    messages: [],
    loading: false,
    error: null,
    currentChatName: null,
};

const messageSlice = createSlice({
    name: "messages",
    initialState,
    reducers: {
        setMessages: (
            state,
            action: PayloadAction<{
                chatName: string;
                messages: Message[];
            }>
        ) => {
            state.messages = action.payload.messages;
            state.currentChatName = action.payload.chatName;
            state.loading = false;
            state.error = null;
        },

        setMessagesLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },

        setMessagesError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        },

        clearMessages: (state) => {
            state.messages = [];
            state.loading = false;
            state.error = null;
            state.currentChatName = null;
        },
    },
});

export const {
    setMessages,
    setMessagesLoading,
    setMessagesError,
    clearMessages,
} = messageSlice.actions;

export default messageSlice.reducer;
