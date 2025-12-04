"use client"
import { Link } from "react-router-dom"
import "./Navbar.css"

const Navbar = () => {
  return (
    <header className="navbar">
      {/* 왼쪽 로고 */}
      <div className="navbar-section navbar-left">
        <Link to="/" className="navbar-logo">
          메디케어 AI
        </Link>
      </div>

      {/* 가운데 메뉴 */}
      <div className="navbar-section navbar-center">
        {/* Navbar.css에 .nav-item 스타일이 이미 있으므로 Link 태그에 className="nav-item"을 적용 */}
        <Link to="/" className="nav-item">
          증상검색
        </Link>
        <Link to="/dictionary" className="nav-item">
          의약품 사전
        </Link>
        <Link to="/qna" className="nav-item">
          Q&amp;A
        </Link>
      </div>

      {/* 오른쪽 버튼 */}
      <div className="navbar-section navbar-right">
        <button
          className="nav-btn"
          onClick={() => alert("로그인 기능은 준비 중입니다.")}
        >
          로그인
        </button>
        <button
          className="nav-btn primary"
          onClick={() => alert("회원가입 기능은 준비 중입니다.")}
        >
          회원가입
        </button>
      </div>
    </header>
  )
}

export default Navbar
