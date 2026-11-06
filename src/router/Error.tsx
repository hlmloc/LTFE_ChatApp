import { Link } from 'react-router-dom';

export function Error() {
    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Oops! Đã xảy ra lỗi.</h2>
            <p>Đường dẫn không hợp lệ hoặc dữ liệu không tồn tại.</p>
            <Link to="/">Quay về trang chủ</Link>
        </div>
    );
}