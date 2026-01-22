import React, { useEffect, useState } from "react";
import { api } from "../config"; 
import { useAuth } from "../contexts/AuthContext";
import "./MyReservationPage.css"; 

const MyReservationPage = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 데이터 페칭 로직
  const fetchReservations = async () => {
    try {
      setLoading(true);
      // 백엔드 HospitalUserActionController의 getMyReservations 엔드포인트 호출
      const response = await api.get(`/api/hospitals/my/reservations`, {
        params: { userId: user.userId || user.id } // 엔티티 필드명에 맞춰 userId 우선 시도
      });
      setReservations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("예약 내역 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId || user?.id) {
      fetchReservations();
    } else {
      setLoading(false); 
    }
  }, [user]);

  // ✅ 예약 취소 핸들러
  const handleCancel = async (reservationId) => {
    if (!window.confirm("정말로 예약을 취소하시겠습니까?")) return;

    try {
      await api.delete(`/api/hospitals/reservations/${reservationId}`, {
        params: { userId: user.userId || user.id }
      });
      alert("예약이 취소되었습니다.");
      // 목록에서 즉시 제거 (다시 불러오기)
      setReservations(prev => prev.filter(res => res.id !== reservationId));
    } catch (error) {
      console.error("취소 실패:", error);
      alert(error.response?.data?.message || "취소 권한이 없거나 이미 처리된 예약입니다.");
    }
  };

  if (loading) return <div className="loading">데이터를 불러오는 중입니다...</div>;

  return (
    <div className="my-reservation-container">
      <div className="page-header">
        <h2>📅 나의 병원 예약 현황</h2>
        <p className="description">신청하신 예약의 승인 상태를 확인하고 관리할 수 있습니다.</p>
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
                  {res.hospital?.dutyName || res.hospitalName || "병원 정보 없음"}
                </span>
                <span className={`res-status status-${res.status?.toLowerCase()}`}>
                  {res.status === "REQUESTED" ? "예약 대기" : 
                   res.status === "CONFIRMED" ? "예약 확정" : 
                   res.status === "COMPLETED" ? "진료 완료" : "상태 확인"}
                </span>
              </div>

              <div className="res-info">
                <p><strong>예약 일시:</strong> {new Date(res.reservedAt).toLocaleString("ko-KR", {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}</p>
                <p><strong>환자 성함:</strong> {res.patientName}</p>
                {res.memo && <p><strong>요청 사항:</strong> {res.memo}</p>}
              </div>

              <div className="res-footer">
                {/* 진료 완료 상태가 아닐 때만 취소 버튼 노출 */}
                {res.status !== "COMPLETED" && (
                  <button 
                    className="cancel-btn" 
                    onClick={() => handleCancel(res.id)}
                  >
                    예약 취소
                  </button>
                )}
                {res.status === "COMPLETED" && !res.isReviewed && (
                  <button className="review-btn" onClick={() => window.location.href=`/hospitals/${res.hospital.id}/review/new`}>
                    리뷰 쓰기
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