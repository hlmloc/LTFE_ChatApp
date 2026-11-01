
function Login() {
    return (
        <div className="login-form">
            <label>Email hoặc số điện thoại</label>
            <input type="text" placeholder="Nhập email hoặc số điện thoại" />

            <label>Mật khẩu</label>
            <input type="password" placeholder="Nhập mật khẩu" />

            <button className="login-btn" type="button">
                Đăng nhập
            </button>
        </div>
    )
}

export default Login
