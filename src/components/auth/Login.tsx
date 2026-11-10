import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/AuthService";
import { authSessionManager } from "../../services/AuthSessionManager";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    async function checkLogin() {
        if (isLoading) return;
        setError("");

        if (!username.trim()) {
            setError("Vui lòng nhập tên đăng nhập");
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
            setError("Tên đăng nhập chỉ được chứa chữ, số và dấu _");
            return;
        }

        if (!password) {
            setError("Vui lòng nhập mật khẩu");
            return;
        }

        setIsLoading(true);

        try {
            const result = await authService.login(username.trim(), password);
            authSessionManager.acceptLogin(result);
            setPassword("");
            navigate("/chats", { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi đăng nhập");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="login-form">
            <label>Tên đăng nhập</label>
            <input
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <label>Mật khẩu</label>
            <input
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="form-error">{error}</p>}
            <button
                className="login-btn"
                type="button"
                onClick={checkLogin}
                disabled={isLoading}
            >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
        </div>
    );
}

export default Login;
