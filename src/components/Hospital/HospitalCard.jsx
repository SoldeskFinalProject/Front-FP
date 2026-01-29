import React from "react";
import { useNavigate } from "react-router-dom";
import "./HospitalCard.css";

export default function HospitalCard({ hospital }) {
  const navigate = useNavigate();

  // ✅ [NEW] 프리미엄(광고) 병원 체크
  // 거리나 정렬 상관없이, 광고 병원이면 무조건 강조
  const isPremiumDisplay = hospital.isAd || hospital.isPremium;

  // 1. 운영 상태 뱃지 (기존 로직 유지)
  const renderStatusBadge = () => {
    switch (hospital.operatingStatus) {
      case "OPEN": return <span className="badge badge-open">🟢 진료중</span>;
      case "CLOSED": return <span className="badge badge-closed">⚪ 진료종료</span>;
      default: return <span className="badge badge-unknown">🟡 정보없음</span>;
    }
  };

  return (
    <div 
      // ✅ [NEW] 프리미엄이면 'premium' 클래스 추가 (금색 테두리용)
      className={`hospital-card-item ${isPremiumDisplay ? "premium" : ""}`} 
      onClick={() => navigate(`/hospitals/${hospital.hospitalId}`)}
    >
      <div className="card-header">
        <div className="header-top">
          {/* ✅ [NEW] 프리미엄 뱃지 (이름 앞 혹은 위에 배치) */}
          {isPremiumDisplay && <span className="badge badge-premium">⚡</span>}
          
          <h3 className="hospital-name">{hospital.dutyName}</h3>
          
          {/* 즐겨찾기 하트 (기존 유지) */}
          {hospital.isFavorite && <span className="favorite-heart">❤️</span>}
        </div>
        
        <div className="badges-row">
          {renderStatusBadge()}
          
          {/* 공휴일 뱃지 (기존 유지) */}
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
          {/* 거리 정보 (기존 유지) */}
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