import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { authService } from "../../services/AuthService";

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function checkRegister(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isLoading) return;
        setError("");
        setMessage("");

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

        if (password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        if (!confirmPassword) {
            setError("Vui lòng xác nhận mật khẩu");
            return;
        }

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            return;
        }

        setIsLoading(true);

        try {
            const result = await authService.register(username.trim(), password);
            setMessage(result);
            setPassword("");
            setConfirmPassword("");
            setShowPassword(false);
            setShowConfirmation(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi đăng ký");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form className="auth-form" onSubmit={checkRegister} noValidate>
            <div className="auth-field">
                <label className="auth-sr-only" htmlFor="register-username">Tên đăng nhập</label>
                <input
                    id="register-username"
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
                <label className="auth-sr-only" htmlFor="register-password">Mật khẩu</label>
                <input
                    id="register-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Mật khẩu (ít nhất 6 ký tự)"
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

            <div className="auth-field auth-field--password">
                <label className="auth-sr-only" htmlFor="register-confirm-password">Xác nhận mật khẩu</label>
                <input
                    id="register-confirm-password"
                    name="confirmPassword"
                    type={showConfirmation ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Xác nhận mật khẩu"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    disabled={isLoading}
                    required
                />
                <button
                    className="auth-field__toggle"
                    type="button"
                    aria-label={showConfirmation ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}
                    aria-pressed={showConfirmation}
                    onClick={() => setShowConfirmation(!showConfirmation)}
                    disabled={isLoading}
                >
                    {showConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            {error && <p className="form-error" role="alert">{error}</p>}
            {message && <p className="form-success" role="status">{message}</p>}

            <button className="auth-submit" type="submit" disabled={isLoading}>
                {isLoading ? "Đang đăng ký..." : "Tạo tài khoản"}
            </button>
        </form>
    );
}

export default Register;
