import { webSocketService } from "./WebSocketService";
import type { ChatResponse } from "./WebSocketService";
import type { Message } from "../types/message";

type HistoryEvent = "GET_PEOPLE_CHAT_MES" | "GET_ROOM_CHAT_MES";

interface PendingRequest {
    key: string;
    event: HistoryEvent;
    name: string;
    page: number;
    resolve: (messages: Message[]) => void;
    reject: (error: Error) => void;
}

class MessageService {
    private requestQueue: PendingRequest[] = [];
    private isProcessing = false;

    private pendingRequests = new Map<string, Promise<Message[]>>();

    getPeopleChatMessages(
        name: string,
        page: number = 1
    ): Promise<Message[]> {
        return this.getChatMessages("GET_PEOPLE_CHAT_MES", name, page);
    }

    getRoomChatMessages(name: string, page: number = 1): Promise<Message[]> {
        return this.getChatMessages("GET_ROOM_CHAT_MES", name, page);
    }

    private getChatMessages(event: HistoryEvent, name: string, page: number): Promise<Message[]> {
        const key = JSON.stringify([event, name, page]);

        const existingRequest = this.pendingRequests.get(key);

        if (existingRequest) {
            return existingRequest;
        }

        const request = new Promise<Message[]>((resolve, reject) => {
            this.requestQueue.push({
                key,
                event,
                name,
                page,
                resolve,
                reject,
            });
        });

        this.pendingRequests.set(key, request);

        void this.processQueue();

        return request;
    }

    private processQueue(): void {
        if (this.isProcessing || this.requestQueue.length === 0) {
            return;
        }

        this.isProcessing = true;

        const request = this.requestQueue.shift()!;

        const unsubscribers: Array<() => void> = [];
        let timeout: ReturnType<typeof setTimeout>;
        let finished = false;

        const finish = (
            messages?: Message[],
            error?: Error
        ) => {
            if (finished) return;
            finished = true;

            unsubscribers.forEach(unsubscribe => unsubscribe());
            clearTimeout(timeout);

            this.pendingRequests.delete(request.key);
            this.isProcessing = false;

            if (error) {
                request.reject(error);
            } else {
                request.resolve(messages ?? []);
            }

            queueMicrotask(() => this.processQueue());
        };

        unsubscribers.push(webSocketService.subscribe(
            request.event,
            (response: ChatResponse) => {
                if (response.status !== "success") {
                    finish(
                        undefined,
                        new Error(response.mes || "Không thể lấy tin nhắn")
                    );
                    return;
                }

                let data = response.data;
                if (request.event === "GET_ROOM_CHAT_MES") {
                    if (!data || typeof data !== "object" || !("name" in data) || !("chatMess" in data)) {
                        finish(undefined, new Error("Dữ liệu phòng không hợp lệ"));
                        return;
                    }
                    if (data.name !== request.name) return;
                    data = data.chatMess;
                }

                if (Array.isArray(data)) finish(data as Message[]);
                else finish(undefined, new Error("Dữ liệu tin nhắn không hợp lệ"));
            }
        ));

        unsubscribers.push(webSocketService.subscribe("AUTH", response => {
            if (response.status === "error") {
                finish(undefined, new Error(response.mes || "Phiên đăng nhập không hợp lệ"));
            }
        }));

        unsubscribers.push(webSocketService.subscribeConnection(status => {
            if (status === "closed") finish(undefined, new Error("Mất kết nối WebSocket"));
        }));

        timeout = setTimeout(() => {
            finish(undefined, new Error("Hết thời gian chờ server"));
        }, 15000);

        try {
            webSocketService.send(request.event, {
                name: request.name,
                page: request.page,
            });
        } catch (error) {
            finish(
                undefined,
                error instanceof Error
                    ? error
                    : new Error("Không thể lấy lịch sử tin nhắn")
            );
        }
    }

    sendMessage(type: "people" | "room", to: string, mes: string, username: string): Message {
        webSocketService.send("SEND_CHAT", { type, to, mes });

        return {
            id: Date.now(),
            name: username,
            to,
            mes,
            createAt: new Date().toISOString(),
            type: type === "room" ? 1 : 0,
        };
    }
}

export const messageService = new MessageService();