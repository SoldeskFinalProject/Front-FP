"use client";

import { useNavigate } from "react-router-dom";
import "./VerificationTypeSelect.css";

const VerificationTypeSelect = () => {
  const navigate = useNavigate();

  return (
    <div className="verification-container">
      <div className="verification-header">
        <h1 className="verification-title">전문가 인증</h1>
        <p className="verification-subtitle">
          의사 또는 병원 관계자 인증을 통해 더 많은 기능을 이용하세요
        </p>
      </div>

      <div className="selection-cards">
        <div
          className="selection-card"
          onClick={() => navigate("/verification/doctor")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigate("/verification/doctor")}
        >
          <div className="card-icon">👨‍⚕️</div>
          <h2 className="card-title">의사 인증</h2>
          <p className="card-description">
            면허번호를 통해 의사 자격을 인증하고 전문가 기능을 이용하세요
          </p>
          <button
            className="card-button"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate("/verification/doctor");
            }}
          >
            인증 시작하기
          </button>
        </div>

        <div
          className="selection-card"
          onClick={() => navigate("/verification/hospital")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigate("/verification/hospital")}
        >
          <div className="card-icon">🏥</div>
          <h2 className="card-title">병원 관계자 인증</h2>
          <p className="card-description">
            사업자등록번호로 병원 관계자임을 인증하고 병원 관리 기능을 이용하세요
          </p>
          <button
            className="card-button"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate("/verification/hospital");
            }}
          >
            인증 시작하기
          </button>
        </div>
      </div>

      <button className="back-btn" type="button" onClick={() => navigate(-1)}>
        돌아가기
      </button>
    </div>
  );
};

export default VerificationTypeSelect;
