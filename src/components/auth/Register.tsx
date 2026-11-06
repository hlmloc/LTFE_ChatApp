
import { useState } from 'react'

function Register() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    function checkRegister() {
        setError('')
        setMessage('')

        if (!username.trim()) {
            setError('Vui lòng nhập tên đăng nhập')
            return
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            setError('Tên đăng nhập chỉ được chứa chữ, số và dấu _')
            return
        }

        if (!password) {
            setError('Vui lòng nhập mật khẩu')
            return
        }

        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự')
            return
        }

        if (!confirmPassword) {
            setError('Vui lòng xác nhận mật khẩu')
            return
        }

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp')
            return
        }

        setMessage('Thông tin đăng ký hợp lệ')
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

            <label>Xác nhận mật khẩu</label>
            <input
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && <p className="form-error">{error}</p>}
            {message && <p className="form-success">{message}</p>}

            <button
                className="login-btn"
                type="button"
                onClick={checkRegister}
            >
                Đăng ký
            </button>
        </div>
    )
}

export default Register
