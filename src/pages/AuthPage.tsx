import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
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
        <div className="auth-page">
            <div className="login-container">
                <h1>EchoChat</h1>
                <p>Kết nối liền mạch, trò chuyện không giới hạn</p>
                <div className="auth-tabs">
                    <button
                        type="button"
                        className={isLogin ? "active" : ""}
                        onClick={() => setIsLogin(true)}
                    >
                        Đăng nhập
                    </button>
                    <button
                        type="button"
                        className={!isLogin ? "active" : ""}
                        onClick={() => setIsLogin(false)}
                    >
                        Đăng ký
                    </button>
                </div>
                {isLogin ? <Login /> : <Register />}
            </div>
        </div>
    );
}

export default AuthPage;
