"use client"

import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import VerificationStatusBanner from "../verification/VerificationStatusBanner" // ✅ 경로 맞게 수정
import "./Navbar.css"

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user, logout, loading, isAdmin, isHospitalMember, verificationStatus } = useAuth()
  const navigate = useNavigate()

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
      alert("로그아웃되었습니다.")
      setIsSidebarOpen(false)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) return null

  return (
    <>
      <header className="navbar">
        <div className="navbar-section navbar-left">
          <Link to="/" className="navbar-logo">메디케어 AI</Link>
        </div>

        <div className="navbar-section navbar-center">
          <Link to="/search" className="nav-item">증상검색</Link>
          <div className="nav-item dropdown-container">
            <span className="dropdown-trigger">의학 백과 ▾</span>
            <div className="dropdown-menu">
              <Link to="/dictionary" className="dropdown-item">의약품 백과</Link>
              <Link to="/disease" className="dropdown-item">질환 백과</Link>
            </div>
          </div>
          <Link to="/qna" className="nav-item">Q&A</Link>
        </div>

        <div className="navbar-section navbar-right">
          <button className="nav-btn" onClick={toggleSidebar}>메뉴</button>

          {user ? (
            <>
              <Link to="/mypage" className="user-info-link">
                <span className="user-info"><strong>{user.name}</strong>님</span>
              </Link>
              <button className="nav-btn logout-btn" onClick={handleLogout}>로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-btn">로그인</Link>
              <Link to="/signup" className="nav-btn primary">회원가입</Link>
            </>
          )}
        </div>
      </header>

      {isSidebarOpen && (
        <>
          <div className="sidebar-overlay" onClick={toggleSidebar}></div>

          <div className="sidebar">
            <div className="sidebar-header">
              <h2>전체 메뉴</h2>
              <button className="sidebar-close" onClick={toggleSidebar}>✕</button>
            </div>

            <nav className="sidebar-menu">
              {/* 일반 메뉴 */}
              <Link to="/search" className="sidebar-item" onClick={toggleSidebar}>🔍 증상검색</Link>
              <Link to="/dictionary" className="sidebar-item" onClick={toggleSidebar}>💊 의약품 백과</Link>
              <Link to="/disease" className="sidebar-item" onClick={toggleSidebar}>🦠 질환 백과</Link>
              <Link to="/qna" className="sidebar-item" onClick={toggleSidebar}>💬 Q&A</Link>

              {user && (
                <>
                  <hr className="sidebar-divider" />
                  <div className="sidebar-group-title">마이페이지</div>

                  <Link to="/mypage" className="sidebar-item" onClick={toggleSidebar}>👤 마이 대시보드</Link>
                  <Link to="/mypage/reservations" className="sidebar-item" onClick={toggleSidebar}>📅 진료 예약 현황</Link>
                  <Link to="/mypage/favorites" className="sidebar-item" onClick={toggleSidebar}>⭐ 즐겨찾기 병원</Link>
                  <Link to="/mypage/reviews" className="sidebar-item" onClick={toggleSidebar}>✍️ 리뷰 작성/관리</Link>
                  <Link to="/verification" className="sidebar-item" onClick={toggleSidebar}>🏥 의사/병원 인증</Link>

                  {/* ✅ 병원 관계자 인증 승인된 사용자만 "구독 관리" 메뉴 노출 */}
                  {isHospitalMember && (
                    <>
                      <hr className="sidebar-divider" />
                      <div className="sidebar-group-title">병원 관계자</div>

                      <Link
                        to="/mypage/subscription"
                        className="sidebar-item"
                        onClick={toggleSidebar}
                      >
                        💳 구독(상단 노출) 관리
                      </Link>
                    </>
                  )}

                  {/* ✅ 관리자 메뉴 (관리자 권한일 때만 노출) */}
                  {isAdmin && (
                    <>
                      <hr className="sidebar-divider" />
                      <div className="sidebar-group-title">관리자</div>

                      <Link to="/admin/verification" className="sidebar-item" onClick={toggleSidebar}>
                        🛠 승인 요청 관리
                      </Link>

                      <Link to="/admin/subscriptions/plans" className="sidebar-item" onClick={toggleSidebar}>
                        💳 구독 상품(플랜) 관리
                      </Link>
                    </>
                  )}

                  <div className="sidebar-footer">
                    <button className="sidebar-logout" onClick={handleLogout}>로그아웃</button>
                  </div>
                </>
              )}
            </nav>
          </div>
        </>
      )}
    </>
  )
}

export default Navbar
