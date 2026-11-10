import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/Store";
import { authSessionManager } from "../services/AuthSessionManager";

function ProtectedRoute() {
    const { isAuthenticated, isRestoring } = useSelector(
        (state: RootState) => state.auth
    );

    if (isAuthenticated) {
        return <Outlet />;
    }

    if (!authSessionManager.hasSavedSession()) {
        return <Navigate to="/" replace />;
    }

    if (isRestoring) {
        return <p role="status">Đang xác thực lại phiên đăng nhập...</p>;
    }

    return (
        <div role="status" style={{ padding: 24 }}>
            <p>Không thể xác thực phiên. Vui lòng kiểm tra kết nối mạng hoặc thử lại.</p>
            <button type="button" onClick={() => authSessionManager.retryNow()}>
                Thử kết nối lại
            </button>
            <button
                type="button"
                onClick={() => { void authSessionManager.logout(); }}
                style={{ marginLeft: 12 }}
            >
                Đăng xuất
            </button>
        </div>
    );
}

export default ProtectedRoute;
