
function Register() {
    return (
        <div className="login-form">
            <label>Họ và tên</label>
            <input type="text" placeholder="Nhập họ và tên" />

            <label>Email hoặc số điện thoại</label>
            <input type="text" placeholder="Nhập email hoặc số điện thoại" />

            <label>Mật khẩu</label>
            <input type="password" placeholder="Nhập mật khẩu" />

            <label>Xác nhận mật khẩu</label>
            <input type="password" placeholder="Nhập lại mật khẩu" />

            <button className="login-btn" type="button">
                Đăng ký
            </button>
        </div>
    )
}

export default Register
