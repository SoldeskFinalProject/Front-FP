import React, { useEffect, useMemo, useState, useCallback } from "react";
import { api } from "../config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./MyPage.css";

export default function MyPage() {
  const { user, logout } = useAuth(); // ✅ logout이 AuthContext에 있으면 사용
  const navigate = useNavigate();

  const userId = useMemo(() => user?.userId || user?.id, [user]);

  const [reservationCount, setReservationCount] = useState(0);
  const [reviewableCount, setReviewableCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchSummaryData = useCallback(async () => {
    if (!userId) {
      setReservationCount(0);
      setReviewableCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [reviewRes, reservRes] = await Promise.all([
        api.get(`/api/hospitals/my/reviewable`, { params: { userId } }),
        api.get(`/api/hospitals/my/reservations`, { params: { userId } }),
      ]);

      setReviewableCount(Array.isArray(reviewRes.data) ? reviewRes.data.length : 0);
      setReservationCount(Array.isArray(reservRes.data) ? reservRes.data.length : 0);
    } catch (error) {
      console.error("데이터 로딩 중 에러 발생:", error);
      // 실패 시에도 화면은 뜨게 (0으로)
      setReviewableCount(0);
      setReservationCount(0);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSummaryData();
  }, [fetchSummaryData]);

  const handleLogout = useCallback(() => {
    // ✅ AuthContext에 logout()이 구현돼 있으면 그걸 호출
    if (typeof logout === "function") {
      logout();
    } else {
      // ✅ 없으면 최소 동작: 토큰 제거 + 홈 이동
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  if (loading) return <div className="mypage-loading">정보를 불러오는 중입니다...</div>;
  if (!user) return <div className="mypage-error">로그인이 필요한 페이지입니다.</div>;

  return (
    <div className="mypage-container">
      <header className="mypage-header">
        <h1>마이페이지</h1>
        <p className="user-info">
          <strong>{user.name || "사용자"}</strong>님, 반갑습니다!
        </p>
      </header>

      <div className="mypage-dashboard">
        {/* 📅 카드 1: 나의 예약 관리 */}
        <div className="dashboard-card" onClick={() => navigate("/mypage/reservations")}>
          <div className="card-icon">📅</div>
          <div className="card-content">
            <h3>나의 예약 현황</h3>
            <p className="count-text">
              현재 <strong>{reservationCount}</strong>건의 예약이 있습니다.
            </p>
            <span className="go-detail">예약 확인 및 취소하기 &gt;</span>
          </div>
        </div>

        {/* ✍️ 카드 2: 리뷰 관리 */}
        <div className="dashboard-card" onClick={() => navigate("/mypage/reviews")}>
          <div className="card-icon">✍️</div>
          <div className="card-content">
            <h3>리뷰 관리</h3>
            <p className="count-text">
              작성 가능한 리뷰가 <strong>{reviewableCount}</strong>건 있습니다.
            </p>
            <span className="go-detail">리뷰 작성/관리 하러가기 &gt;</span>
          </div>
        </div>

        {/* 🏥 카드 3: 병원 찾기 (바로가기) */}
        <div className="dashboard-card" onClick={() => navigate("/search")}>
          <div className="card-icon">🏥</div>
          <div className="card-content">
            <h3>병원 찾기</h3>
            <p className="count-text">주변의 병원을 검색하고 예약하세요.</p>
            <span className="go-detail">검색 페이지로 이동 &gt;</span>
          </div>
        </div>
      </div>

      <footer className="mypage-footer">
        <button className="logout-btn" onClick={handleLogout}>
          로그아웃
        </button>
      </footer>
    </div>
  );
}
