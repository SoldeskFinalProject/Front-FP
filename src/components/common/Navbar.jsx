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

        {/* 👇 [수정됨] 드롭다운 메뉴 영역 */}
        <div className="nav-item dropdown-container">
          {/* 마우스를 올릴 텍스트 */}
          <span className="dropdown-trigger">
            의학 백과 ▾
          </span>
          
          {/* 숨겨져 있다가 나타날 메뉴들 */}
          <div className="dropdown-menu">
            <Link to="/dictionary" className="dropdown-item">
              의약품 백과
            </Link>
            <Link to="/disease" className="dropdown-item">
              질환 백과
            </Link>
          </div>
        </div> 
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