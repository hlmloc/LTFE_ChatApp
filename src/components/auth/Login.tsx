import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { authService } from "../../services/AuthService";
import { authSessionManager } from "../../services/AuthSessionManager";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    async function checkLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
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
        <form className="auth-form" onSubmit={checkLogin} noValidate>
            <div className="auth-field">
                <label className="auth-sr-only" htmlFor="login-username">Tên đăng nhập</label>
                <input
                    id="login-username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Tên đăng nhập"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    disabled={isLoading}
                    required
                />
            </div>

            <div className="auth-field auth-field--password">
                <label className="auth-sr-only" htmlFor="login-password">Mật khẩu</label>
                <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={isLoading}
                    required
                />
                <button
                    className="auth-field__toggle"
                    type="button"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            {error && <p className="form-error" role="alert">{error}</p>}

            <button className="auth-submit" type="submit" disabled={isLoading}>
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
        </form>
    );
}

export default Login;
