
import { useState } from 'react'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import './components/auth/Auth.css'

function App() {
    const [isLogin, setIsLogin] = useState(true)

    return (
        <div className="auth-page">
            <div className="login-container">
                <h1>EchoChat</h1>
                <p>Kết nối liền mạch, trò chuyện không giới hạn</p>

                <div className="auth-tabs">
                    <button
                        className={isLogin ? 'active' : ''}
                        onClick={() => setIsLogin(true)}
                        type="button"
                    >
                        Đăng nhập
                    </button>
                    <button
                        className={!isLogin ? 'active' : ''}
                        onClick={() => setIsLogin(false)}
                        type="button"
                    >
                        Đăng ký
                    </button>
                </div>

                {isLogin ? <Login /> : <Register />}
            </div>
        </div>
    )
}

export default App
