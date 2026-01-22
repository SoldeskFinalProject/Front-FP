import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    // 유저 정보가 없으면 로그인 페이지로 강제 이동
    // replace: 뒤로가기 눌렀을 때 다시 여기로 못 오게 함
    if (loading) return <div>Loading...</div>;
    if (!user) {
        alert("로그인이 필요한 페이지입니다.");
        return <Navigate to="/login" replace />;
    }

    // 로그인 했으면 자식 라우트(Outlet) 보여줌
    return <Outlet />;
};

export default ProtectedRoute;