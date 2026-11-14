import { webSocketService } from "./WebSocketService";

export type ChatListItem = {
    name: string;
    type: 0 | 1;
    actionTime: string;
};

function isChatListItem(value: unknown): value is ChatListItem {
    if (typeof value !== "object" || value === null) return false;
    const item = value as Record<string, unknown>;

    return typeof item.name === "string" && item.name.trim().length > 0
        && (item.type === 0 || item.type === 1)
        && typeof item.actionTime === "string";
}

class ConversationService {
    private pending: Promise<ChatListItem[]> | null = null;

    getUserList(): Promise<ChatListItem[]> {
        if (this.pending) return this.pending;
        return this.enqueueRequest();
    }

    refreshUserList(): Promise<ChatListItem[]> {
        return this.enqueueRequest();
    }

    private enqueueRequest(): Promise<ChatListItem[]> {
        const previous = this.pending;

        const request = (async () => {
            if (previous) {
                try {
                    await previous;
                } catch {
                    // Vẫn tải lại nếu yêu cầu trước bị lỗi
                }
            }

            return this.loadUserList();
        })();

        this.pending = request;

        const clear = () => {
            if (this.pending === request) this.pending = null;
        };

        void request.then(clear, clear);
        return request;
    }

    private async loadUserList(): Promise<ChatListItem[]> {
        await webSocketService.waitUntilConnected();

        return new Promise<ChatListItem[]>((resolve, reject) => {
            let finished = false;
            const unsubscribers: Array<() => void> = [];

            const timeout = window.setTimeout(() => {
                finish(new Error("Hết thời gian chờ danh sách chat"));
            }, 10000);

            function finish(error?: Error, chats: ChatListItem[] = []) {
                if (finished) return;

                finished = true;
                window.clearTimeout(timeout);
                unsubscribers.forEach(unsubscribe => unsubscribe());

                if (error) reject(error);
                else resolve(chats);
            }

            unsubscribers.push(webSocketService.subscribe("GET_USER_LIST", response => {
                if (response.status !== "success") {
                    finish(new Error(response.mes || "Không lấy được danh sách chat"));
                    return;
                }

                if (!Array.isArray(response.data) || !response.data.every(isChatListItem)) {
                    finish(new Error("Dữ liệu GET_USER_LIST không đúng định dạng"));
                    return;
                }

                finish(undefined, response.data);
            }));

            unsubscribers.push(webSocketService.subscribe("AUTH", response => {
                if (response.status === "error") {
                    finish(new Error(response.mes || "Phiên đăng nhập không hợp lệ"));
                }
            }));

            unsubscribers.push(webSocketService.subscribeConnection(status => {
                if (status === "closed") finish(new Error("Mất kết nối WebSocket"));
            }));

            try {
                webSocketService.send("GET_USER_LIST");
            } catch (error) {
                finish(error instanceof Error ? error : new Error("Không thể gửi GET_USER_LIST"));
            }
        });
    }
}

export const conversationService = new ConversationService();