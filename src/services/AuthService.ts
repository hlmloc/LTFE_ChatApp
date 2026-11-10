
import {
    webSocketService,
    type ChatResponse
} from "./WebSocketService";

class AuthService {
    async register(
        username: string,
        password: string
    ): Promise<string> {
        await webSocketService.waitUntilConnected();

        return new Promise<string>((resolve, reject) => {
            let unsubscribe = () => {};

            const timeout = window.setTimeout(() => {
                unsubscribe();
                reject(new Error("Server không phản hồi. Vui lòng thử lại."));
            }, 10000);

            const cleanup = () => {
                window.clearTimeout(timeout);
                unsubscribe();
            };

            const handleResponse = (response: ChatResponse) => {
                cleanup();

                if (response.status === "success") {
                    resolve("Đăng ký tài khoản thành công!");
                } else {
                    reject(
                        new Error(response.mes || "Đăng ký thất bại")
                    );
                }
            };

            unsubscribe = webSocketService.subscribe(
                "REGISTER",
                handleResponse
            );

            try {
                webSocketService.send("REGISTER", {
                    user: username,
                    pass: password
                });
            } catch (error) {
                cleanup();
                reject(error);
            }
        });
    }
}

export const authService = new AuthService();
