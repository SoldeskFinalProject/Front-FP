"use client"
import { Link } from "react-router-dom"
import "./Navbar.css"

const Navbar = () => {
  // const location = useLocation()

  return (
    <header className="navbar">
      {/* 왼쪽 로고 */}
      <div className="navbar-section navbar-left">
        <Link to="/" className="navbar-logo">
          메디케어 AI
        </Link>
      </div>

      <div className="navbar-section navbar-center"></div>

      {/* 오른쪽 버튼 */}
      <div className="navbar-section navbar-right">
        <button className="nav-btn" onClick={() => alert("로그인 기능은 준비 중입니다.")}>
          로그인
        </button>
        <button className="nav-btn primary" onClick={() => alert("회원가입 기능은 준비 중입니다.")}>
          회원가입
        </button>
      </div>
    </header>
  )
}

export default Navbar
