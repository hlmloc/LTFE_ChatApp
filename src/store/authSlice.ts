
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
    username: string | null;
    reLoginCode: string | null;
    isAuthenticated: boolean;
};

const initialState: AuthState = {
    username: null,
    reLoginCode: null,
    isAuthenticated: false
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess: (
            state,
            action: PayloadAction<{
                username: string;
                reLoginCode: string;
            }>
        ) => {
            state.username = action.payload.username;
            state.reLoginCode = action.payload.reLoginCode;
            state.isAuthenticated = true;
        },
        clearAuth: (state) => {
            state.username = null;
            state.reLoginCode = null;
            state.isAuthenticated = false;
        }
    }
});

export const { loginSuccess, clearAuth } = authSlice.actions;
export default authSlice.reducer;
