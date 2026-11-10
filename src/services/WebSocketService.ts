const WS_URL = "wss://chat.longapp.io.vn/chat/chat";

export type ChatEvent =
    | "REGISTER"
    | "LOGIN"
    | "RE_LOGIN"
    | "LOGOUT"
    | "GET_USER_LIST"
    | "CREATE_ROOM"
    | "JOIN_ROOM"
    | "OUT_ROOM"
    | "GET_ROOM_CHAT_MES"
    | "GET_PEOPLE_CHAT_MES"
    | "SEND_CHAT"
    | "CHECK_USER_ONLINE"
    | "CHECK_USER_EXIST";

export type ChatResponse = {
    status: string;
    event: string;
    data?: unknown;
    mes?: string;
};

type MessageHandler = (response: ChatResponse) => void;
type ConnectionStatus = "open" | "closed";
type ConnectionHandler = (status: ConnectionStatus) => void;

class WebSocketService {
    private socket: WebSocket | null = null;
    private listeners = new Map<string, Set<MessageHandler>>();
    private connectionListeners = new Set<ConnectionHandler>();

    connect(): void {
        if (
            this.socket?.readyState === WebSocket.CONNECTING ||
            this.socket?.readyState === WebSocket.OPEN
        ) {
            return;
        }

        const socket = new WebSocket(WS_URL);
        this.socket = socket;

        socket.onopen = () => {
            if (this.socket !== socket) return;
            this.notifyConnection("open");
        };

        socket.onmessage = (event: MessageEvent) => {
            if (this.socket !== socket) return;

            try {
                const parsed: unknown = JSON.parse(event.data);

                if (
                    !parsed ||
                    typeof parsed !== "object" ||
                    !("event" in parsed) ||
                    !("status" in parsed) ||
                    typeof parsed.event !== "string" ||
                    typeof parsed.status !== "string"
                ) {
                    console.warn("WebSocket nhận phản hồi không hợp lệ");
                    return;
                }

                const response = parsed as ChatResponse;
                const handlers = this.listeners.get(response.event);

                handlers?.forEach((handler) => {
                    try {
                        handler(response);
                    } catch (error) {
                        console.error("Lỗi xử lý sự kiện WebSocket:", error);
                    }
                });
            } catch {
                console.warn("WebSocket nhận dữ liệu không phải JSON");
            }
        };

        socket.onerror = () => {
            if (this.socket === socket) {
                console.warn("Kết nối WebSocket gặp lỗi");
            }
        };

        socket.onclose = (event: CloseEvent) => {
            if (this.socket !== socket) return;

            this.socket = null;
            console.info("WebSocket đã đóng:", event.code, event.reason);
            this.notifyConnection("closed");
        };
    }

    waitUntilConnected(): Promise<void> {
        this.connect();
        const socket = this.socket;

        if (!socket) {
            return Promise.reject(new Error("Không thể tạo WebSocket"));
        }

        if (socket.readyState === WebSocket.OPEN) {
            return Promise.resolve();
        }

        return new Promise<void>((resolve, reject) => {
            let settled = false;

            const finish = (error?: Error) => {
                if (settled) return;
                settled = true;
                window.clearTimeout(timeout);
                socket.removeEventListener("open", handleOpen);
                socket.removeEventListener("error", handleError);
                socket.removeEventListener("close", handleClose);

                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            };

            const handleOpen = () => finish();
            const handleError = () => finish(new Error("Không thể kết nối đến server"));
            const handleClose = () => finish(new Error("Kết nối WebSocket đã đóng"));

            const timeout = window.setTimeout(() => {
                finish(new Error("Kết nối WebSocket quá thời gian chờ"));
                if (this.socket === socket) this.disconnect();
            }, 10000);

            socket.addEventListener("open", handleOpen);
            socket.addEventListener("error", handleError);
            socket.addEventListener("close", handleClose);

            if (socket.readyState === WebSocket.OPEN) {
                finish();
            } else if (socket.readyState >= WebSocket.CLOSING) {
                handleClose();
            }
        });
    }

    send(event: ChatEvent, data?: object): void {
        if (this.socket?.readyState !== WebSocket.OPEN) {
            throw new Error("WebSocket chưa kết nối");
        }

        const request = {
            action: "onchat",
            data: {
                event,
                ...(data !== undefined ? { data } : {})
            }
        };

        this.socket.send(JSON.stringify(request));
    }

    subscribe(event: string, handler: MessageHandler): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }

        this.listeners.get(event)!.add(handler);

        return () => {
            const handlers = this.listeners.get(event);
            handlers?.delete(handler);
            if (handlers?.size === 0) this.listeners.delete(event);
        };
    }

    subscribeConnection(handler: ConnectionHandler): () => void {
        this.connectionListeners.add(handler);
        return () => {
            this.connectionListeners.delete(handler);
        };
    }

    private notifyConnection(status: ConnectionStatus): void {
        this.connectionListeners.forEach((handler) => {
            try {
                handler(status);
            } catch (error) {
                console.error("Lỗi lắng nghe kết nối:", error);
            }
        });
    }

    disconnect(): void {
        const socket = this.socket;
        if (!socket) return;

        this.socket = null;
        if (socket.readyState < WebSocket.CLOSING) {
            socket.close(1000, "Client disconnect");
        }
        this.notifyConnection("closed");
    }

    getStatus(): number {
        return this.socket?.readyState ?? WebSocket.CLOSED;
    }
}

export const webSocketService = new WebSocketService();
