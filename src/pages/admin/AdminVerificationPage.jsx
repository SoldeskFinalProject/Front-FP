"use client"

import { useNavigate } from "react-router-dom"
import "./AdminVerificationPage.css"

const AdminVerificationPage = () => {
    const navigate = useNavigate()

    return (
        <div className="admin-container">
        <div className="admin-header">
            <h1 className="admin-title">인증 요청 관리</h1>
            <button className="back-btn" onClick={() => navigate("/")}>
            메인으로
            </button>
        </div>

        <div className="verification-type-select">
            <div className="verification-type-card" onClick={() => navigate("/admin/verification/doctor")}>
            <div className="icon-circle doctor">
                <span className="icon">👨‍⚕️</span>
            </div>
            <h2>의사 인증 요청</h2>
            <p>의사 면허 인증 요청을 승인/거절합니다</p>
            </div>

            <div className="verification-type-card" onClick={() => navigate("/admin/verification/hospital")}>
            <div className="icon-circle hospital">
                <span className="icon">🏥</span>
            </div>
            <h2>병원 관계자 인증 요청</h2>
            <p>병원 관계자 인증 요청을 승인/거절합니다</p>
            </div>
        </div>
        </div>
    )
}

export default AdminVerificationPage
