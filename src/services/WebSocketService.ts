const WS_URL = "wss://chat.longapp.io.vn/chat/chat";

export type ChatEvent =
    | "AUTH"
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
    event: ChatEvent;
    data?: unknown;
    mes?: string;
};

type MessageHandler = (response: ChatResponse) => void;

class WebSocketService {
    private socket: WebSocket | null = null;

    private listeners = new Map<ChatEvent, Set<MessageHandler>>();

    connect(): void {
        if (
            this.socket?.readyState === WebSocket.CONNECTING ||
            this.socket?.readyState === WebSocket.OPEN
        ) {
            console.log("WebSocket đang kết nối hoặc đã kết nối");
            return;
        }

        const socket = new WebSocket(WS_URL);
        this.socket = socket;

        socket.onopen = () => {
            console.log("WebSocket đã kết nối thành công");
        };

        socket.onmessage = (event: MessageEvent) => {
            try {
                const response: ChatResponse = JSON.parse(event.data);

                if (
                    !response ||
                    typeof response.event !== "string"
                ) {
                    console.warn("Phản hồi không có event:", response);
                    return;
                }

                console.log("WebSocket nhận dữ liệu:", response);

                const handlers = this.listeners.get(response.event);

                if (handlers) {
                    handlers.forEach((handler) => {
                        try {
                            handler(response);
                        } catch (error) {
                            console.error("Lỗi xử lý sự kiện:", error);
                        }
                    });
                }
            } catch (error) {
                console.error("Không thể xử lý dữ liệu WebSocket:", error);
            }
        };

        socket.onerror = () => {
            console.error("WebSocket xảy ra lỗi");
        };

        socket.onclose = (event: CloseEvent) => {
            console.log(
                "WebSocket đã đóng:",
                event.code,
                event.reason
            );

            if (this.socket === socket) {
                this.socket = null;
            }
        };
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

    subscribe(
        event: ChatEvent,
        handler: MessageHandler
    ): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }

        this.listeners.get(event)!.add(handler);

        return () => {
            const handlers = this.listeners.get(event);

            handlers?.delete(handler);

            if (handlers?.size === 0) {
                this.listeners.delete(event);
            }
        };
    }

    disconnect(): void {
        if (!this.socket) return;

        const socket = this.socket;
        this.socket = null;

        socket.close(1000, "Client disconnect");
    }

    getStatus(): number {
        return this.socket?.readyState ?? WebSocket.CLOSED;
    }
}

export const webSocketService = new WebSocketService();
