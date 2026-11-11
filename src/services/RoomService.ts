
import { webSocketService } from "./WebSocketService";

export type CreatedRoom = {
    name: string;
};

class RoomService {
    private creating = false;

    async createRoom(name: string): Promise<CreatedRoom> {
        const roomName = name.trim();

        if (!roomName) throw new Error("Vui lòng nhập tên nhóm");
        if (this.creating) throw new Error("Đang xử lý yêu cầu tạo nhóm");

        this.creating = true;

        try {
            await webSocketService.waitUntilConnected();

            return await new Promise<CreatedRoom>((resolve, reject) => {
                let finished = false;
                let timeoutId: number | undefined;
                const unsubscribers: Array<() => void> = [];

                const finish = (error?: Error, room?: CreatedRoom) => {
                    if (finished) return;
                    finished = true;

                    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
                    unsubscribers.forEach(unsubscribe => unsubscribe());

                    if (error) reject(error);
                    else if (room) resolve(room);
                    else reject(new Error("Không nhận được thông tin phòng"));
                };

                timeoutId = window.setTimeout(() => {
                    finish(new Error("Server không phản hồi yêu cầu tạo nhóm"));
                }, 10000);

                unsubscribers.push(webSocketService.subscribe("CREATE_ROOM", response => {
                    if (response.status !== "success") {
                        finish(new Error(response.mes || "Tạo nhóm thất bại"));
                        return;
                    }

                    const data = response.data;

                    if (typeof data !== "object" || data === null ||
                        !("name" in data) || typeof data.name !== "string" || !data.name.trim()) {
                        finish(new Error("Dữ liệu phòng từ server không hợp lệ"));
                        return;
                    }

                    if (data.name.trim() !== roomName) return;
                    finish(undefined, { name: data.name });
                }));

                unsubscribers.push(webSocketService.subscribe("AUTH", response => {
                    if (response.status === "error") {
                        finish(new Error(response.mes || "Phiên đăng nhập không hợp lệ"));
                    }
                }));

                unsubscribers.push(webSocketService.subscribe("ACTION_NOT_EXIT", response => {
                    finish(new Error(response.mes || "Server không nhận diện được yêu cầu"));
                }));

                unsubscribers.push(webSocketService.subscribeConnection(status => {
                    if (status === "closed") {
                        finish(new Error("Mất kết nối WebSocket"));
                    }
                }));

                try {
                    webSocketService.send("CREATE_ROOM", { name: roomName });
                } catch (error) {
                    finish(error instanceof Error ? error : new Error("Không thể gửi CREATE_ROOM"));
                }
            });
        } finally {
            this.creating = false;
        }
    }
}

export const roomService = new RoomService();
