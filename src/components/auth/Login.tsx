
import { useState } from 'react'

function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    function checkLogin() {
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

        setMessage('Thông tin nhập hợp lệ')
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
            {message && <p className="form-success">{message}</p>}

            <button
                className="login-btn"
                type="button"
                onClick={checkLogin}
            >
                Đăng nhập
            </button>
        </div>
    )
}

export default Login
