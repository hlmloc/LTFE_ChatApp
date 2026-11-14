
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import messageReducer from "./slice/messageSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        messages: messageReducer,
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
