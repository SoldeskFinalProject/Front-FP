// src/pages/MyReservationPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../config";
import { useAuth } from "../contexts/AuthContext";
import "./MyReservationPage.css";

const MyReservationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userId = useMemo(() => user?.userId || user?.id, [user]);

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = useCallback(async () => {
    if (!userId) {
      setReservations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get("/api/hospitals/my/reservations", {
        params: { userId },
      });
      setReservations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("예약 내역 로딩 실패:", error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleCancel = useCallback(
    async (reservationId) => {
      if (!userId) {
        alert("로그인이 필요합니다.");
        return;
      }

      if (!window.confirm("정말로 예약을 취소하시겠습니까?")) return;

      try {
        await api.delete(`/api/hospitals/reservations/${reservationId}`, {
          params: { userId },
        });
        alert("예약이 취소되었습니다.");

        setReservations((prev) =>
          prev.map((r) =>
            r.id === reservationId ? { ...r, status: "CANCELED" } : r
          )
        );
      } catch (error) {
        console.error("취소 실패:", error);
        alert(
          error?.response?.data?.message ||
            error?.response?.data ||
            "취소 권한이 없거나 이미 처리된 예약입니다."
        );
      }
    },
    [userId]
  );

  /**
   * ✅ 리뷰 버튼 클릭
   * - 미작성: 리뷰 작성 페이지로 이동 (/review/new)
   * - 작성됨: 리뷰 보기 페이지로 이동 (/review)
   */
  const handleReviewClick = useCallback(
    (reservationId, isReviewed) => {
      if (!reservationId) {
        alert("예약 정보가 없어 리뷰를 확인할 수 없습니다.");
        return;
      }

      if (isReviewed) {
        // ✅ 이미 작성된 리뷰는 '리뷰 보기' 화면으로 이동
        // (App.jsx에 Route: /reservations/:reservationId/review 추가 필요)
        navigate(`/reservations/${reservationId}/review`);
        return;
      }

      // ✅ 미작성일 때만 리뷰 작성 화면으로 이동
      navigate(`/reservations/${reservationId}/review/new`);
    },
    [navigate]
  );

  const renderStatusText = (status) => {
    switch (status) {
      case "REQUESTED":
        return "예약 대기";
      case "CONFIRMED":
        return "예약 확정";
      case "COMPLETED":
        return "진료 완료";
      case "CANCELED":
        return "예약 취소";
      default:
        return "상태 확인";
    }
  };

  const formatReservedAt = (reservedAt) => {
    if (!reservedAt) return "-";
    const d = new Date(reservedAt);
    if (Number.isNaN(d.getTime())) return String(reservedAt);
    return d.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <div className="loading">데이터를 불러오는 중입니다...</div>;

  return (
    <div className="my-reservation-container">
      <div className="page-header">
        <h2>📅 나의 병원 예약 현황</h2>
        <p className="description">
          신청하신 예약의 승인 상태를 확인하고 관리할 수 있습니다.
        </p>
      </div>

      {reservations.length === 0 ? (
        <div className="no-data-box">
          <p>현재 진행 중인 예약 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="reservation-list">
          {reservations.map((res) => (
            <div key={res.id} className="reservation-card">
              <div className="res-header">
                <span className="res-hospital">
                  {res.hospitalName || "병원 정보 없음"}
                </span>
                <span className={`res-status status-${String(res.status || "").toLowerCase()}`}>
                  {renderStatusText(res.status)}
                </span>
              </div>

              <div className="res-info">
                <p>
                  <strong>예약 일시 :</strong> {formatReservedAt(res.reservedAt)}
                </p>
                <p>
                  <strong>환자 성함 :</strong>{" "}
                  {res.patientName || user?.name || "이름 정보 없음"}
                </p>
                {res.memo && (
                  <p>
                    <strong>요청 사항:</strong> {res.memo}
                  </p>
                )}
              </div>

              <div className="res-footer">
                {(res.status === "REQUESTED" || res.status === "CONFIRMED") && (
                  <button className="cancel-btn" onClick={() => handleCancel(res.id)}>
                    예약 취소
                  </button>
                )}

                {/* ✅ COMPLETED이면: 미작성=리뷰쓰기, 작성됨=리뷰보기 */}
                {res.status === "COMPLETED" && (
                  <button
                    className="review-btn"
                    onClick={() => handleReviewClick(res.id, !!res.isReviewed)}
                  >
                    {res.isReviewed ? "리뷰 보기" : "리뷰 쓰기"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReservationPage;
