"use client"

import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import "./Navbar.css"

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user, logout, loading, isAdmin } = useAuth()
  const navigate = useNavigate()

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // 로그아웃 시 알림과 함께 메인으로 이동
  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
      alert("로그아웃되었습니다.")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // 인증 로딩 중일 때 레이아웃 깜빡임 방지
  if (loading) return null;

  return (
    <>
      <header className="navbar">
        {/* 왼쪽 로고 */}
        <div className="navbar-section navbar-left">
          <Link to="/" className="navbar-logo">
            메디케어 AI
          </Link>
        </div>

        {/* 가운데 메뉴 */}
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

        {/* 오른쪽 버튼 영역: 로그인 상태에 따른 조건부 렌더링 */}
        <div className="navbar-section navbar-right">
          {user ? (
            <>
              <span className="user-info"><strong>{user.name}</strong>님</span>
              <button className="nav-btn" onClick={toggleSidebar}>
                메뉴
              </button>
              <button className="nav-btn logout-btn" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-btn">
                로그인
              </Link>
              <Link to="/signup" className="nav-btn primary">
                회원가입
              </Link>
            </>
          )}
        </div>
      </header>

      {/* 사이드바 영역 */}
      {isSidebarOpen && (
        <>
          <div className="sidebar-overlay" onClick={toggleSidebar}></div>
          <div className="sidebar">
            <div className="sidebar-header">
              <h2>메뉴</h2>
              <button className="sidebar-close" onClick={toggleSidebar}>✕</button>
            </div>
            <nav className="sidebar-menu">
              {user && (
                <>
                  <Link to="/verification" className="sidebar-item" onClick={toggleSidebar}>
                    인증 요청
                  </Link>
                  <Link to="/mypage" className="sidebar-item" onClick={toggleSidebar}>
                    마이페이지
                  </Link>
                  {isAdmin && (
                    <Link to="/admin/verification" className="sidebar-item" onClick={toggleSidebar}>
                      승인 요청 관리
                    </Link>
                  )}
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