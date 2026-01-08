"use client"
import { Link } from "react-router-dom"
import { useState } from "react"
import "./Navbar.css"

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <>
      <header className="navbar">
        {/* 왼쪽 로고 */}
        <div className="navbar-section navbar-left">
          <Link to="/" className="navbar-logo">
            메디케어 AI
          </Link>
        </div>

        {/* 가운데 메뉴: 드롭다운 기능 포함 */}
        <div className="navbar-section navbar-center">
          <Link to="/search" className="nav-item">
            증상검색
          </Link>

          {/* 의학 백과 드롭다운 */}
          <div className="nav-item dropdown-container">
            <span className="dropdown-trigger">
              의학 백과 ▾
            </span>
            <div className="dropdown-menu">
              <Link to="/dictionary" className="dropdown-item">
                의약품 백과
              </Link>
              <Link to="/disease" className="dropdown-item">
                질환 백과
              </Link>
            </div>
          </div>

          <Link to="/qna" className="nav-item">
            Q&A
          </Link>
        </div>

        {/* 오른쪽 버튼: 메뉴(사이드바) 및 로그인/회원가입 */}
        <div className="navbar-section navbar-right">
          <button className="nav-btn" onClick={toggleSidebar}>
            메뉴
          </button>
          <Link to="/login" className="nav-btn">
            로그인
          </Link>
          <Link to="/signup" className="nav-btn primary">
            회원가입
          </Link>
        </div>
      </header>

      {/* 사이드바 영역 */}
      {isSidebarOpen && (
        <>
          <div className="sidebar-overlay" onClick={toggleSidebar}></div>
          <div className="sidebar">
            <div className="sidebar-header">
              <h2>메뉴</h2>
              <button className="sidebar-close" onClick={toggleSidebar}>
                ✕
              </button>
            </div>
            <nav className="sidebar-menu">
              <Link to="/admin/verification" className="sidebar-item" onClick={toggleSidebar}>
                승인 요청 리스트
              </Link>
              {/* 필요한 경우 사이드바에 추가 메뉴를 여기에 넣으세요 */}
            </nav>
          </div>
        </>
      )}
    </>
  )
}

export default Navbar