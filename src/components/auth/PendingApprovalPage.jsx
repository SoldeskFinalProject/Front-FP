"use client"
import { useNavigate } from "react-router-dom"
import "./PendingApprovalPage.css"

export default function PendingApprovalPage() {
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user") || "{}")

    const handleLogout = () => {
        localStorage.removeItem("user")
        navigate("/login")
    }

    return (
        <div className="pending-page">
        <div className="pending-container">
            <div className="pending-icon">⏳</div>
            <h1>승인 대기 중</h1>
            <p className="pending-message">{user.name}님의 가입 신청이 접수되었습니다.</p>
            <p className="pending-description">
            관리자의 승인이 완료되면 이메일로 안내드리겠습니다.
            <br />
            승인 후 로그인하여 서비스를 이용하실 수 있습니다.
            </p>
            <button onClick={handleLogout} className="logout-button">
            로그아웃
            </button>
        </div>
        </div>
    )
}
