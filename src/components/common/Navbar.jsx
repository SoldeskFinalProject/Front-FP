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

        <div className="navbar-section navbar-center">
          <Link to="/" className="nav-item">
            증상검색
          </Link>
          <Link to="/dictionary" className="nav-item">
            의약품 사전
          </Link>
          <Link to="/qna" className="nav-item">
            Q&A
          </Link>
        </div>

        {/* 오른쪽 버튼 */}
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
              <Link to="/admin/approval" className="sidebar-item" onClick={toggleSidebar}>
                승인 요청 리스트
              </Link>
            </nav>
          </div>
        </>
      )}
    </>
  )
}

export default Navbar
