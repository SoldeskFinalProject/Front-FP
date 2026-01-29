import React from "react";
import { useNavigate } from "react-router-dom";
import "./HospitalCard.css";

export default function HospitalCard({ hospital }) {
  const navigate = useNavigate();

  // 1. 운영 상태 뱃지 (백엔드 operatingStatus 값 매핑)
  const renderStatusBadge = () => {
    switch (hospital.operatingStatus) {
      case "OPEN": return <span className="badge badge-open">🟢 진료중</span>;
      case "CLOSED": return <span className="badge badge-closed">⚪ 진료종료</span>;
      default: return <span className="badge badge-unknown">🟡 정보없음</span>; // UNKNOWN
    }
  };

  return (
    <div 
      className="hospital-card-item" 
      // 클릭 시 예약 페이지나 상세 페이지로 이동 (추후 구현)
      onClick={() => navigate(`/hospitals/${hospital.hospitalId}`)}
    >
      <div className="card-header">
        <div className="header-top">
          <h3 className="hospital-name">{hospital.dutyName}</h3>
          {/* 즐겨찾기 된 병원이면 하트 표시 */}
          {hospital.isFavorite && <span className="favorite-heart">❤️</span>}
        </div>
        
        <div className="badges-row">
          {renderStatusBadge()}
          
          {/* 공휴일 진료 병원이면 빨간 뱃지 추가 */}
          {hospital.isHolidayClinic && (
            <span className="badge badge-holiday">🔴 공휴일진료</span>
          )}
        </div>
      </div>

      <div className="card-info">
        <div className="rating-row">
          <span className="star">⭐</span>
          <span className="score">
            {hospital.ratingAvg ? hospital.ratingAvg.toFixed(1) : "0.0"}
          </span>
          <span className="review-count">
            ({hospital.reviewCount || 0}개 리뷰)
          </span>
        </div>
        
        <div className="addr-row">
          {/* 내 위치 권한이 있어서 거리가 계산된 경우에만 표시 */}
          {hospital.distanceStr && (
            <span className="distance">{hospital.distanceStr} · </span>
          )}
          <span className="address">{hospital.dutyAddr}</span>
        </div>
        
        <div className="tel-row">
           📞 {hospital.dutyTel1 || "전화번호 없음"}
        </div>
      </div>
    </div>
  );
}