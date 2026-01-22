import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../config";
import { useAuth } from "../contexts/AuthContext";
import "./MyReviewPage.css";

const TAB = {
  REVIEWABLE: "REVIEWABLE",
  MY_REVIEWS: "MY_REVIEWS",
};

const MyReviewPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userId = useMemo(() => user?.userId || user?.id, [user]);

  const [activeTab, setActiveTab] = useState(TAB.REVIEWABLE);

  const [reviewableList, setReviewableList] = useState([]);
  const [myReviews, setMyReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ 단일 이동 함수: 리뷰 작성/보기/수정 모두 같은 페이지로 통일
  const goReviewPage = useCallback(
    (reservationId) => {
      if (!reservationId) {
        alert("예약 정보가 없어 리뷰 화면으로 이동할 수 없습니다.");
        return;
      }
      navigate(`/reservations/${reservationId}/review/new`);
    },
    [navigate]
  );

  // ✅ 리뷰 작성 가능한 예약(진료완료 + 미작성) 가져오기
  const fetchReviewable = useCallback(async () => {
    if (!userId) return [];
    const res = await api.get("/api/hospitals/my/reviewable", {
      params: { userId },
    });
    return Array.isArray(res.data) ? res.data : [];
  }, [userId]);

  // ✅ 내가 작성한 리뷰 목록 가져오기
  const fetchMyReviews = useCallback(async () => {
    if (!userId) return [];
    const res = await api.get("/api/hospitals/my/reviews", {
      params: { userId },
    });
    return Array.isArray(res.data) ? res.data : [];
  }, [userId]);

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setError("로그인이 필요합니다.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [a, b] = await Promise.all([fetchReviewable(), fetchMyReviews()]);
      setReviewableList(a);
      setMyReviews(b);
    } catch (e) {
      console.error(e);
      setError(
        e?.response?.data?.message ||
          e?.response?.data ||
          e?.message ||
          "데이터를 불러오지 못했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, [userId, fetchReviewable, fetchMyReviews]);

  useEffect(() => {
    load();
  }, [load]);

  const formatDate = (dt) => {
    if (!dt) return "-";
    const d = new Date(dt);
    if (Number.isNaN(d.getTime())) return String(dt);
    return d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) return <div className="loading">불러오는 중입니다...</div>;

  return (
    <div className="my-review-container">
      <div className="review-header">
        <h2>✍️ 리뷰 작성/관리</h2>
        <p className="description">
          리뷰 작성 가능한 예약과, 내가 작성한 리뷰를 한 곳에서 관리합니다.
        </p>

        {/* ✅ 탭 */}
        <div className="review-tabs">
          <button
            type="button"
            className={`review-tab ${activeTab === TAB.REVIEWABLE ? "active" : ""}`}
            onClick={() => setActiveTab(TAB.REVIEWABLE)}
          >
            작성 가능 ({reviewableList.length})
          </button>
          <button
            type="button"
            className={`review-tab ${activeTab === TAB.MY_REVIEWS ? "active" : ""}`}
            onClick={() => setActiveTab(TAB.MY_REVIEWS)}
          >
            내가 작성한 리뷰 ({myReviews.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="empty-review-box">
          <p>{error}</p>
          <button className="go-review-btn" onClick={() => navigate("/login")}>
            로그인 하러가기
          </button>
        </div>
      )}

      {/* =========================
          탭 1) 작성 가능
         ========================= */}
      {activeTab === TAB.REVIEWABLE && !error && (
        <>
          {reviewableList.length === 0 ? (
            <div className="empty-review-box">
              <p>새로 작성할 수 있는 리뷰 내역이 없습니다.</p>
              <small>진료 완료 처리된 예약만 리뷰 작성이 가능합니다.</small>
            </div>
          ) : (
            <div className="review-list">
              {reviewableList.map((res) => (
                <div key={res.id} className="review-item-card">
                  <div className="item-main">
                    <div className="item-info">
                      <span className="complete-badge">진료 완료</span>
                      <h3>
                        {res.hospital?.dutyName || res.hospitalName || "병원 정보 없음"}
                      </h3>
                      <p className="visit-date">방문 날짜: {formatDate(res.reservedAt)}</p>
                    </div>

                    <button className="go-review-btn" onClick={() => goReviewPage(res.id)}>
                      리뷰 작성하기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* =========================
          탭 2) 내가 작성한 리뷰
         ========================= */}
      {activeTab === TAB.MY_REVIEWS && !error && (
        <>
          {myReviews.length === 0 ? (
            <div className="empty-review-box">
              <p>작성한 리뷰가 아직 없습니다.</p>
              <small>진료 완료 예약에서 리뷰를 작성해 보세요.</small>
            </div>
          ) : (
            <div className="review-list">
              {myReviews.map((r) => (
                <div key={r.reviewId || r.id} className="review-item-card">
                  <div className="item-main">
                    <div className="item-info">
                      <span className="complete-badge">작성됨</span>
                      <h3>{r.hospitalName || r.hospital?.dutyName || "병원 정보 없음"}</h3>
                      <p className="visit-date">작성일: {formatDate(r.createdAt)}</p>
                      <p className="visit-date">평점: {Number(r.rating ?? 0).toFixed(1)}점</p>
                      <p className="review-preview">
                        {String(r.content || "").slice(0, 60)}
                        {String(r.content || "").length > 60 ? "..." : ""}
                      </p>
                    </div>

                    <button
                      className="go-review-btn"
                      onClick={() => goReviewPage(r.reservationId)}
                    >
                      리뷰 보기/수정
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyReviewPage;
