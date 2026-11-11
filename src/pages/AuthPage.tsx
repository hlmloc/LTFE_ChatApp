import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { MessageCircleMore } from "lucide-react";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import type { RootState } from "../store/Store";
import { authSessionManager } from "../services/AuthSessionManager";
import "../components/auth/Auth.css";

function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );

    if (isAuthenticated || authSessionManager.hasSavedSession()) {
        return <Navigate to="/chats" replace />;
    }

    return (
        <main className="auth-page">
            <div className="auth-shell">
                <section className="auth-story" aria-label="Chuyển đổi đăng nhập và đăng ký">
                    <div className="auth-story__content">
                        <h2>{isLogin ? "Xin chào!" : "Chào mừng trở lại!"}</h2>
                        <p>
                            {isLogin
                                ? "Tham gia EchoChat và bắt đầu trò chuyện."
                                : "Tiếp tục những cuộc trò chuyện của bạn."}
                        </p>
                        <button
                            className="auth-story__button"
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin ? "Đăng ký" : "Đăng nhập"}
                        </button>
                    </div>
                </section>

                <section className="auth-main" aria-label={isLogin ? "Đăng nhập" : "Đăng ký"}>
                    <div className="auth-brand">
                        <MessageCircleMore size={25} aria-hidden="true" />
                        <span>EchoChat</span>
                    </div>

                    <div className="auth-main__content">
                        <h1>{isLogin ? "Đăng nhập" : "Tạo tài khoản"}</h1>
                        {isLogin ? <Login /> : <Register />}
                        <p className="auth-main__switch">
                            {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
                            <button type="button" onClick={() => setIsLogin(!isLogin)}>
                                {isLogin ? "Đăng ký" : "Đăng nhập"}
                            </button>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default AuthPage;
