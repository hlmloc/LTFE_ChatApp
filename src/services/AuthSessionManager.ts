import { store } from "../store/Store";
import {
    clearAuth,
    connectionChanged,
    loginSuccess,
    restoreFinished,
    restoreStarted
} from "../store/authSlice";
import { authService, SessionExpiredError, type AuthSession } from "./AuthService";
import { webSocketService } from "./WebSocketService";

const STORAGE_KEY = "echochat_session";
const RETRY_DELAYS = [2000, 4000, 8000, 16000, 30000, 30000];

class AuthSessionManager {
    private started = false;
    private restoring = false;
    private loggingOut = false;
    private reconnectTimer: number | null = null;
    private reconnectAttempts = 0;
    private sessionVersion = 0;

    private readSession(): AuthSession | null {
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            if (!raw) return null;

            const data: unknown = JSON.parse(raw);

            if (
                !data ||
                typeof data !== "object" ||
                !("username" in data) ||
                !("reLoginCode" in data) ||
                typeof data.username !== "string" ||
                typeof data.reLoginCode !== "string" ||
                !data.username ||
                !data.reLoginCode
            ) {
                this.removeSession();
                return null;
            }

            return { username: data.username, reLoginCode: data.reLoginCode };
        } catch {
            this.removeSession();
            return null;
        }
    }

    hasSavedSession(): boolean {
        return this.readSession() !== null;
    }

    private saveSession(session: AuthSession): void {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        } catch {
            console.warn("Không thể lưu phiên trong trình duyệt");
        }
    }

    private removeSession(): void {
        try {
            sessionStorage.removeItem(STORAGE_KEY);
        } catch {
            console.warn("Không thể xóa phiên trong trình duyệt");
        }
    }

    private clearReconnectTimer(): void {
        if (this.reconnectTimer !== null) {
            window.clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    acceptLogin(session: AuthSession): void {
        if (this.loggingOut) return;
        this.clearReconnectTimer();
        this.reconnectAttempts = 0;
        this.saveSession(session);
        store.dispatch(loginSuccess(session));
    }

    start(): void {
        if (this.started) return;
        this.started = true;

        webSocketService.subscribeConnection((status) => {
            if (this.loggingOut) return;

            if (status === "open") {
                store.dispatch(connectionChanged("connected"));
                return;
            }

            store.dispatch(connectionChanged("disconnected"));

            if (!this.restoring && this.readSession()) {
                this.scheduleReconnect();
            }
        });

        window.addEventListener("online", () => {
            if (this.loggingOut || !this.readSession()) return;
            this.reconnectAttempts = 0;
            this.clearReconnectTimer();

            if (webSocketService.getStatus() === WebSocket.OPEN) {
                webSocketService.disconnect();
                this.clearReconnectTimer();
            }

            if (!this.restoring) {
                void this.restore();
            }
        });

        document.addEventListener("visibilitychange", () => {
            if (
                document.visibilityState !== "visible" ||
                this.restoring ||
                this.loggingOut ||
                !this.readSession() ||
                store.getState().auth.isAuthenticated
            ) {
                return;
            }

            this.retryNow();
        });

        if (this.readSession()) {
            void this.restore();
        } else {
            store.dispatch(clearAuth());
        }
    }

    private scheduleReconnect(): void {
        if (
            this.reconnectTimer !== null ||
            this.restoring ||
            this.loggingOut ||
            !this.readSession() ||
            !navigator.onLine ||
            this.reconnectAttempts >= RETRY_DELAYS.length
        ) {
            return;
        }

        const delay = RETRY_DELAYS[this.reconnectAttempts];
        this.reconnectAttempts += 1;

        this.reconnectTimer = window.setTimeout(() => {
            this.reconnectTimer = null;
            void this.restore();
        }, delay);
    }

    retryNow(): void {
        if (this.loggingOut || this.restoring || !this.readSession()) return;

        this.clearReconnectTimer();
        this.reconnectAttempts = 0;

        if (webSocketService.getStatus() === WebSocket.OPEN) {
            webSocketService.disconnect();
            this.clearReconnectTimer();
        }

        void this.restore();
    }

    private async restore(): Promise<void> {
        if (this.restoring || this.loggingOut) return;

        const session = this.readSession();

        if (!session) {
            store.dispatch(clearAuth());
            return;
        }

        this.restoring = true;
        const currentVersion = this.sessionVersion;
        store.dispatch(restoreStarted());

        try {
            const result = await authService.reLogin(
                session.username,
                session.reLoginCode
            );

            if (this.loggingOut || currentVersion !== this.sessionVersion) return;
            this.acceptLogin(result);
        } catch (error) {
            if (this.loggingOut || currentVersion !== this.sessionVersion) return;

            if (error instanceof SessionExpiredError) {
                this.removeSession();
                this.clearReconnectTimer();
                store.dispatch(clearAuth());
                webSocketService.disconnect();
                return;
            }

            console.warn(
                "Không thể khôi phục phiên:",
                error instanceof Error ? error.message : "Lỗi không xác định"
            );

            webSocketService.disconnect();
            store.dispatch(connectionChanged("disconnected"));
        } finally {
            this.restoring = false;
            store.dispatch(restoreFinished());

            if (
                !this.loggingOut &&
                this.readSession() &&
                !store.getState().auth.isAuthenticated
            ) {
                this.scheduleReconnect();
            }
        }
    }

    async logout(): Promise<boolean> {
        if (this.loggingOut) return false;

        this.loggingOut = true;
        this.sessionVersion += 1;
        this.clearReconnectTimer();
        let serverSuccess = false;

        try {
            if (webSocketService.getStatus() === WebSocket.OPEN) {
                await authService.logout();
                serverSuccess = true;
            }
        } catch {
            serverSuccess = false;
        } finally {
            this.removeSession();
            store.dispatch(clearAuth());
            webSocketService.disconnect();
            this.reconnectAttempts = 0;
            this.loggingOut = false;
        }

        return serverSuccess;
    }
}

export const authSessionManager = new AuthSessionManager();
