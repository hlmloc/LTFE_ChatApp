import { webSocketService } from "./WebSocketService";

type UserCheckEvent = "CHECK_USER_EXIST" | "CHECK_USER_ONLINE";

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
    private pendingChecks = new Map<UserCheckEvent, { user: string; request: Promise<boolean> }>();

    getUserList(): Promise<ChatListItem[]> {
        if (this.pending) return this.pending;
        return this.enqueueRequest();
    }

    refreshUserList(): Promise<ChatListItem[]> {
        return this.enqueueRequest();
    }

    checkUserExists(username: string): Promise<boolean> {
        return this.checkUser("CHECK_USER_EXIST", username);
    }

    checkUserOnline(username: string): Promise<boolean> {
        return this.checkUser("CHECK_USER_ONLINE", username);
    }

    private checkUser(event: UserCheckEvent, username: string): Promise<boolean> {
        const user = username.trim();
        if (!user) return Promise.reject(new Error("Vui lòng nhập tên người dùng"));

        // Phản hồi chỉ có boolean, nên mỗi event xử lý lần lượt từng username.
        const previous = this.pendingChecks.get(event);
        if (previous?.user === user) return previous.request;

        const request = (async () => {
            await previous?.request.catch(() => undefined);
            const data = await this.request(event, "Không kiểm tra được tài khoản", { user });

            if (!data || typeof data !== "object" || !("status" in data) || typeof data.status !== "boolean") {
                throw new Error(`Dữ liệu ${event} không đúng định dạng`);
            }

            return data.status;
        })();

        this.pendingChecks.set(event, { user, request });
        const clear = () => {
            if (this.pendingChecks.get(event)?.request === request) this.pendingChecks.delete(event);
        };
        void request.then(clear, clear);
        return request;
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
        const data = await this.request("GET_USER_LIST", "Không lấy được danh sách chat");
        if (!Array.isArray(data) || !data.every(isChatListItem)) {
            throw new Error("Dữ liệu GET_USER_LIST không đúng định dạng");
        }
        return data;
    }

    private request(event: "GET_USER_LIST" | UserCheckEvent, errorMessage: string, payload?: { user: string }): Promise<unknown> {
        if (webSocketService.getStatus() !== WebSocket.OPEN) {
            return Promise.reject(new Error("WebSocket chưa kết nối"));
        }

        return new Promise<unknown>((resolve, reject) => {
            let finished = false;
            const unsubscribers: Array<() => void> = [];

            const timeout = window.setTimeout(() => {
                finish(new Error(`Hết thời gian chờ ${event}`));
            }, 10000);

            function finish(error?: Error, data?: unknown) {
                if (finished) return;

                finished = true;
                window.clearTimeout(timeout);
                unsubscribers.forEach(unsubscribe => unsubscribe());

                if (error) reject(error);
                else resolve(data);
            }

            unsubscribers.push(webSocketService.subscribe(event, response => {
                if (response.status !== "success") {
                    finish(new Error(response.mes || errorMessage));
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
                webSocketService.send(event, payload);
            } catch (error) {
                finish(error instanceof Error ? error : new Error(`Không thể gửi ${event}`));
            }
        });
    }
}

export const conversationService = new ConversationService();
