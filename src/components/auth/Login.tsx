
import './Auth.css'

function Login() {
    return (
        <div className="auth-page">
            <div className="login-container">
                <h1>EchoChat</h1>
                <p>Kết nối liền mạch, trò chuyện không giới hạn</p>

                <div className="auth-tabs">
                    <button className="active" type="button">Đăng nhập</button>
                    <button type="button">Đăng ký</button>
                </div>

                <div className="login-form">
                    <label>Email hoặc số điện thoại</label>
                    <input type="text" placeholder="Nhập email hoặc số điện thoại" />

                    <label>Mật khẩu</label>
                    <input type="password" placeholder="Nhập mật khẩu" />

                    <button className="login-btn" type="button">
                        Đăng nhập
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Login
