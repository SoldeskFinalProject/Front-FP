import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../config";
import { useAuth } from "../contexts/AuthContext";
import "./MyReservationPage.css";

const MyReservationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 사용자 ID 추출
  const userId = useMemo(() => user?.userId || user?.id, [user]);

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 예약 목록 불러오기
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
      
      console.log("서버 응답 데이터:", response.data);

      if (Array.isArray(response.data)) {
        // CANCELED 상태 필터링 및 병원 이름 안전 추출
        const activeData = response.data
          .filter((res) => String(res.status).toUpperCase() !== "CANCELED")
          .map((res) => ({
            ...res,
            safeHospitalName: res.hospitalName || res.hospital?.dutyName || "병원 정보 없음"
          }));
        setReservations(activeData);
      } else {
        setReservations([]);
      }
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

  // ✅ 예약 취소 처리
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
        // 목록에서 즉시 제거
        setReservations((prev) => prev.filter((r) => r.id !== reservationId));
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

  // ✅ 리뷰 페이지 이동
  const handleReviewClick = useCallback(
    (reservationId) => {
      if (!reservationId) {
        alert("예약 정보가 없어 리뷰를 확인할 수 없습니다.");
        return;
      }
      // 통일된 리뷰 작성 경로
      navigate(`/reservations/${reservationId}/review/new`);
    },
    [navigate]
  );

  // 상태 텍스트 변환
  const renderStatusText = (status) => {
    switch (status) {
      case "REQUESTED": return "예약 대기";
      case "CONFIRMED": return "예약 확정";
      case "COMPLETED": return "진료 완료";
      case "CANCELED": return "예약 취소";
      default: return "상태 확인";
    }
  };

  // 날짜 포맷
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
          {reservations.map((res, index) => {
            // 🚀 Key 에러 해결 포인트: res.id가 없으면 index를 조합하여 고유성 확보
            const itemKey = res.id ? `res-id-${res.id}` : `res-idx-${index}`;
            
            return (
              <div key={itemKey} className="reservation-card">
                <div className="res-header">
                  <span className="res-hospital">
                    {res.safeHospitalName}
                  </span>
                  <span
                    className={`res-status status-${String(res.status || "").toLowerCase()}`}
                  >
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
                  {/* 대기중/확정 상태일 때만 취소 가능 */}
                  {(res.status === "REQUESTED" || res.status === "CONFIRMED") && (
                    <button
                      className="cancel-btn"
                      onClick={() => handleCancel(res.id)}
                    >
                      예약 취소
                    </button>
                  )}

                  {/* 진료 완료 상태일 때 리뷰 버튼 활성화 */}
                  {res.status === "COMPLETED" && (
                    <button
                      className="review-btn"
                      onClick={() => handleReviewClick(res.id)}
                    >
                      {res.isReviewed ? "리뷰 보기" : "리뷰 쓰기"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyReservationPage;
