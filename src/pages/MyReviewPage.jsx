import React, { useEffect, useState } from "react";
import { api } from "../config";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./MyReviewPage.css"; 

const MyReviewPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviewableList, setReviewableList] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 리뷰 가능한 진료 내역 가져오기
  const fetchReviewable = async () => {
    try {
      setLoading(true);
      // 백엔드 HospitalUserActionController의 @GetMapping("/my/reviewable") 호출
      const response = await api.get("/api/hospitals/my/reviewable", {
        params: { userId: user.userId || user.id }
      });
      setReviewableList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("리뷰 가능 목록 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId || user?.id) {
      fetchReviewable();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <div className="loading">진료 내역을 불러오는 중입니다...</div>;

  return (
    <div className="my-review-container">
      <div className="review-header">
        <h2>✍️ 리뷰 관리</h2>
        <p className="description">방문하신 병원의 후기를 남겨주세요. 작성된 리뷰는 다른 환자들에게 큰 도움이 됩니다.</p>
      </div>

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
                  <h3>{res.hospital?.dutyName || "병원 정보 없음"}</h3>
                  <p className="visit-date">방문 날짜: {new Date(res.reservedAt).toLocaleDateString()}</p>
                </div>
                <button 
                  className="go-review-btn"
                  onClick={() => navigate(`/hospitals/${res.hospital?.id}/review/new`)}
                >
                  리뷰 작성하기
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReviewPage;