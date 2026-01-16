"use client"

import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
<<<<<<< HEAD
import { useAuth } from "../../contexts/AuthContext" // 1. useAuth 임포트
=======
import { useAuth } from "../../contexts/AuthContext"
>>>>>>> 96b9df30b320512acab2458d87fa6cd0496381a4
import "./Navbar.css"

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
<<<<<<< HEAD
  const { user, logout, loading } = useAuth() // 2. 인증 상태와 로그아웃 함수 가져오기
=======
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
>>>>>>> 96b9df30b320512acab2458d87fa6cd0496381a4

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

<<<<<<< HEAD
  // 로딩 중일 때는 레이아웃 깨짐 방지를 위해 로딩 상태 처리 (선택사항)
  if (loading) return null;
=======
  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
      alert("로그아웃되었습니다.")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }
>>>>>>> 96b9df30b320512acab2458d87fa6cd0496381a4

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

<<<<<<< HEAD
        {/* 3. 오른쪽 버튼 영역: 로그인 상태에 따른 조건부 렌더링 */}
        <div className="navbar-section navbar-right">
          <button className="nav-btn" onClick={toggleSidebar}>
            메뉴
          </button>
          
          {user ? (
            // 로그인 상태일 때
            <>
              <span className="user-name"><strong>{user.name}</strong>님</span>
              <button onClick={logout} className="nav-btn logout-btn">
=======
        {/* 오른쪽 버튼: 로그인 상태에 따라 다르게 표시 */}
        <div className="navbar-section navbar-right">
          {user ? (
            <>
              <span className="user-info">{user.name}님</span>
              <button className="nav-btn" onClick={toggleSidebar}>
                메뉴
              </button>
              <button className="nav-btn logout-btn" onClick={handleLogout}>
>>>>>>> 96b9df30b320512acab2458d87fa6cd0496381a4
                로그아웃
              </button>
            </>
          ) : (
<<<<<<< HEAD
            // 로그아웃 상태일 때
=======
>>>>>>> 96b9df30b320512acab2458d87fa6cd0496381a4
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
<<<<<<< HEAD
              {/* 관리자 권한일 때만 보이도록 설정 예시 */}
              {user?.role === "ADMIN" && (
                <Link to="/admin/verification" className="sidebar-item" onClick={toggleSidebar}>
                  승인 요청 리스트
                </Link>
              )}
              <Link to="/mypage" className="sidebar-item" onClick={toggleSidebar}>
                마이페이지
              </Link>
=======
              {user && (
                <>
                  <Link to="/verification" className="sidebar-item" onClick={toggleSidebar}>
                    인증 요청
                  </Link>
                  {isAdmin && (
                    <Link to="/admin/verification" className="sidebar-item" onClick={toggleSidebar}>
                      승인 요청 관리
                    </Link>
                  )}
                </>
              )}
>>>>>>> 96b9df30b320512acab2458d87fa6cd0496381a4
            </nav>
          </div>
        </>
      )}
    </>
  )
}

export default Navbar
