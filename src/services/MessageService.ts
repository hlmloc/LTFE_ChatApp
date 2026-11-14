
import { webSocketService } from "./WebSocketService";
import type { ChatResponse } from "./WebSocketService";
import type { Message } from "../types/message";

class MessageService {
    async getPeopleChatMessages(
        name: string,
        page: number = 1
    ): Promise<void> {
        try {
            await webSocketService.waitUntilConnected();

            webSocketService.send("GET_PEOPLE_CHAT_MES", {
                name,
                page,
            });
        } catch (error) {
            console.error("Lỗi lấy lịch sử tin nhắn:", error);
            throw error;
        }
    }

    onPeopleChatHistory(
        callback: (messages: Message[]) => void,
        onError?: (message: string) => void
    ): () => void {
        return webSocketService.subscribe(
            "GET_PEOPLE_CHAT_MES",
            (response: ChatResponse) => {
                if (response.status === "success") {
                    if (Array.isArray(response.data)) {
                        callback(response.data as Message[]);
                    } else {
                        onError?.("Dữ liệu lịch sử tin nhắn không hợp lệ");
                    }
                } else {
                    onError?.(
                        response.mes || "Không thể lấy lịch sử tin nhắn"
                    );
                }
            }
        );
    }
}

export const messageService = new MessageService();
