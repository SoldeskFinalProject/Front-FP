"use client"

import "./VerificationTypeSelect.css"

const VerificationTypeSelect = ({ onSelectType, onBack }) => {
    return (
        <div className="verification-container">
        <div className="verification-header">
            <h1 className="verification-title">전문가 인증</h1>
            <p className="verification-subtitle">의사 또는 병원 관계자 인증을 통해 더 많은 기능을 이용하세요</p>
        </div>

        <div className="selection-cards">
            <div className="selection-card" onClick={() => onSelectType("DOCTOR")}>
            <div className="card-icon">👨‍⚕️</div>
            <h2 className="card-title">의사 인증</h2>
            <p className="card-description">면허번호를 통해 의사 자격을 인증하고 전문가 기능을 이용하세요</p>
            <button className="card-button">인증 시작하기</button>
            </div>

            <div className="selection-card" onClick={() => onSelectType("HOSPITAL")}>
            <div className="card-icon">🏥</div>
            <h2 className="card-title">병원 관계자 인증</h2>
            <p className="card-description">사업자등록번호로 병원 관계자임을 인증하고 병원 관리 기능을 이용하세요</p>
            <button className="card-button">인증 시작하기</button>
            </div>
        </div>

        <button className="back-btn" onClick={onBack}>
            돌아가기
        </button>
        </div>
    )
}

export default VerificationTypeSelect
