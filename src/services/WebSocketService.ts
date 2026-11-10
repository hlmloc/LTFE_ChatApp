
const WS_URL = "wss://chat.longapp.io.vn/chat/chat";

class WebSocketService {
    private socket: WebSocket | null = null;

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
            console.log("WebSocket nhận dữ liệu:", event.data);
        };

        socket.onerror = () => {
            console.error("WebSocket xảy ra lỗi");
        };

        socket.onclose = (event: CloseEvent) => {
            console.log("WebSocket đã đóng:", event.code, event.reason);

            if (this.socket === socket) {
                this.socket = null;
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
