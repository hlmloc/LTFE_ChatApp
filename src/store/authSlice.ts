import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type ConnectionStatus = "connected" | "disconnected";

type AuthState = {
    username: string | null;
    reLoginCode: string | null;
    isAuthenticated: boolean;
    isRestoring: boolean;
    connectionStatus: ConnectionStatus;
};

const initialState: AuthState = {
    username: null,
    reLoginCode: null,
    isAuthenticated: false,
    isRestoring: true,
    connectionStatus: "disconnected"
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess: (
            state,
            action: PayloadAction<{ username: string; reLoginCode: string }>
        ) => {
            state.username = action.payload.username;
            state.reLoginCode = action.payload.reLoginCode;
            state.isAuthenticated = true;
            state.isRestoring = false;
            state.connectionStatus = "connected";
        },
        restoreStarted: (state) => {
            state.isRestoring = true;
            state.isAuthenticated = false;
        },
        connectionChanged: (state, action: PayloadAction<ConnectionStatus>) => {
            state.connectionStatus = action.payload;
            if (action.payload === "disconnected") {
                state.isAuthenticated = false;
            }
        },
        restoreFinished: (state) => {
            state.isRestoring = false;
        },
        clearAuth: (state) => {
            state.username = null;
            state.reLoginCode = null;
            state.isAuthenticated = false;
            state.isRestoring = false;
            state.connectionStatus = "disconnected";
        }
    }
});

export const {
    loginSuccess,
    restoreStarted,
    connectionChanged,
    restoreFinished,
    clearAuth
} = authSlice.actions;

export default authSlice.reducer;
