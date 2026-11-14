
import { webSocketService } from "./WebSocketService";
import type { ChatResponse } from "./WebSocketService";
import type { Message } from "../types/message";

interface PendingRequest {
    key: string;
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
        const key = `${name}-${page}`;

        const existingRequest = this.pendingRequests.get(key);

        if (existingRequest) {
            return existingRequest;
        }

        const request = new Promise<Message[]>((resolve, reject) => {
            this.requestQueue.push({
                key,
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

    private async processQueue(): Promise<void> {
        if (this.isProcessing || this.requestQueue.length === 0) {
            return;
        }

        this.isProcessing = true;

        const request = this.requestQueue.shift()!;

        let unsubscribe = () => {};
        let timeout: ReturnType<typeof setTimeout>;
        let finished = false;

        const finish = (
            messages?: Message[],
            error?: Error
        ) => {
            if (finished) return;
            finished = true;

            unsubscribe();
            clearTimeout(timeout);

            this.pendingRequests.delete(request.key);
            this.isProcessing = false;

            if (error) {
                request.reject(error);
            } else {
                request.resolve(messages ?? []);
            }

            void this.processQueue();
        };

        unsubscribe = webSocketService.subscribe(
            "GET_PEOPLE_CHAT_MES",
            (response: ChatResponse) => {
                if (response.status === "success") {
                    if (Array.isArray(response.data)) {
                        finish(response.data as Message[]);
                    } else {
                        finish(
                            undefined,
                            new Error("Dữ liệu tin nhắn không hợp lệ")
                        );
                    }
                } else {
                    finish(
                        undefined,
                        new Error(response.mes || "Không thể lấy tin nhắn")
                    );
                }
            }
        );

        timeout = setTimeout(() => {
            finish(undefined, new Error("Hết thời gian chờ server"));
        }, 15000);

        try {
            await webSocketService.waitUntilConnected();

            webSocketService.send("GET_PEOPLE_CHAT_MES", {
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
}

export const messageService = new MessageService();
