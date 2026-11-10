import { webSocketService, type ChatEvent, type ChatResponse } from "./WebSocketService";

export type AuthSession = {
    username: string;
    reLoginCode: string;
};

export class SessionExpiredError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "SessionExpiredError";
    }
}

export class ServerProtocolError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ServerProtocolError";
    }
}

type AuthEvent = Extract<ChatEvent, "REGISTER" | "LOGIN" | "RE_LOGIN" | "LOGOUT">;

class AuthService {
    private activeRequest: AuthEvent | null = null;

    private async request(event: AuthEvent, data?: object): Promise<ChatResponse> {
        if (this.activeRequest) {
            throw new Error("Đang xử lý một yêu cầu tài khoản khác");
        }

        this.activeRequest = event;

        try {
            await webSocketService.waitUntilConnected();

            return await new Promise<ChatResponse>((resolve, reject) => {
                let settled = false;
                const unsubscribers: Array<() => void> = [];

                const finish = (response?: ChatResponse, error?: Error) => {
                    if (settled) return;
                    settled = true;
                    window.clearTimeout(timeout);
                    unsubscribers.forEach((unsubscribe) => unsubscribe());

                    if (error) {
                        reject(error);
                    } else if (response) {
                        resolve(response);
                    }
                };

                const timeout = window.setTimeout(() => {
                    finish(undefined, new Error("Server không phản hồi"));
                }, 10000);

                unsubscribers.push(
                    webSocketService.subscribe(event, (response) => finish(response))
                );

                unsubscribers.push(
                    webSocketService.subscribe("AUTH", (response) => {
                        if (response.status === "error") {
                            finish(undefined, new Error(response.mes || "Server từ chối xác thực"));
                        }
                    })
                );

                unsubscribers.push(
                    webSocketService.subscribe("ACTION_NOT_EXIT", (response) => {
                        finish(undefined, new ServerProtocolError(
                            response.mes || "Server không nhận diện được yêu cầu"
                        ));
                    })
                );

                unsubscribers.push(
                    webSocketService.subscribeConnection((status) => {
                        if (status === "closed") {
                            finish(undefined, new Error("Mất kết nối WebSocket"));
                        }
                    })
                );

                try {
                    webSocketService.send(event, data);
                } catch (error) {
                    finish(undefined, error instanceof Error ? error : new Error("Không thể gửi dữ liệu"));
                }
            });
        } finally {
            this.activeRequest = null;
        }
    }

    private getReLoginCode(response: ChatResponse): string {
        const data = response.data;

        if (
            !data ||
            typeof data !== "object" ||
            !("RE_LOGIN_CODE" in data) ||
            typeof data.RE_LOGIN_CODE !== "string" ||
            !data.RE_LOGIN_CODE
        ) {
            throw new ServerProtocolError("Server không trả về RE_LOGIN_CODE hợp lệ");
        }

        return data.RE_LOGIN_CODE;
    }

    async register(username: string, password: string): Promise<string> {
        const response = await this.request("REGISTER", { user: username, pass: password });

        if (response.status !== "success") {
            throw new Error(response.mes || "Đăng ký thất bại");
        }

        return "Đăng ký tài khoản thành công!";
    }

    async login(username: string, password: string): Promise<AuthSession> {
        const response = await this.request("LOGIN", { user: username, pass: password });

        if (response.status !== "success") {
            throw new Error(response.mes || "Đăng nhập thất bại");
        }

        return { username, reLoginCode: this.getReLoginCode(response) };
    }

    async reLogin(username: string, code: string): Promise<AuthSession> {
        const response = await this.request("RE_LOGIN", { user: username, code });

        if (response.status !== "success") {
            const message = response.mes || "Không thể khôi phục phiên";

            if (/session expired/i.test(message)) {
                throw new SessionExpiredError(message);
            }

            throw new Error(message);
        }

        return { username, reLoginCode: this.getReLoginCode(response) };
    }

    async logout(): Promise<void> {
        const response = await this.request("LOGOUT");

        if (response.status !== "success") {
            throw new Error(response.mes || "Đăng xuất thất bại");
        }
    }
}

export const authService = new AuthService();
