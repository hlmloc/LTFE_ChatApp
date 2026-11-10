
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

    private loginPending = false;

    async login(
        username: string,
        password: string
    ): Promise<{ username: string; reLoginCode: string }> {
        if (this.loginPending) {
            throw new Error("Đang xử lý đăng nhập");
        }

        this.loginPending = true;

        try {
            await webSocketService.waitUntilConnected();

            return await new Promise((resolve, reject) => {
                let unsubscribe = () => {};

                const timeout = window.setTimeout(() => {
                    cleanup();
                    reject(new Error("Server không phản hồi. Vui lòng thử lại."));
                }, 10000);

                const cleanup = () => {
                    window.clearTimeout(timeout);
                    unsubscribe();
                };

                const handleResponse = (response: ChatResponse) => {
                    cleanup();

                    if (response.status !== "success") {
                        reject(new Error(
                            response.mes || "Đăng nhập thất bại"
                        ));
                        return;
                    }

                    const data = response.data;

                    if (
                        !data ||
                        typeof data !== "object" ||
                        !("RE_LOGIN_CODE" in data) ||
                        typeof data.RE_LOGIN_CODE !== "string" ||
                        !data.RE_LOGIN_CODE
                    ) {
                        reject(new Error(
                            "Server không trả về mã đăng nhập hợp lệ"
                        ));
                        return;
                    }

                    resolve({
                        username,
                        reLoginCode: data.RE_LOGIN_CODE
                    });
                };

                unsubscribe = webSocketService.subscribe(
                    "LOGIN",
                    handleResponse
                );

                try {
                    webSocketService.send("LOGIN", {
                        user: username,
                        pass: password
                    });
                } catch (error) {
                    cleanup();
                    reject(error);
                }
            });
        } finally {
            this.loginPending = false;
        }
    }

}

export const authService = new AuthService();
