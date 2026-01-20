"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import KakaoLoginButton from "./KakaoLoginButton"
import NaverLoginButton from "./NaverLoginButton"
import "./LoginPage.css"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth() // Context에서 제공하는 login 함수 사용

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // AuthContext의 login 함수를 호출하여 로그인을 진행합니다.
      await login(formData)
      navigate("/")
    } catch (error) {
      // 에러 메시지 처리 (서버 에러 응답이 있을 경우 해당 메시지 출력)
      setError(error.response?.data?.message || "로그인에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>로그인</h1>
        <p className="login-subtitle">메디케어 AI에 다시 오신 것을 환영합니다</p>

        {/* ✅ 로컬 로그인 폼 */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>이메일</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="example@email.com"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="비밀번호 입력"
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {/* ✅ 구분선 */}
        <div className="login-divider">
          <span>또는</span>
        </div>

        {/* ✅ 소셜 로그인 버튼 영역 */}
        <div className="social-login-container">
          <KakaoLoginButton />
          {/* 버튼 사이 간격을 위한 여백 */}
          <div style={{ height: "12px" }}></div> 
          <NaverLoginButton />
        </div>

        {/* ✅ 회원가입 링크 */}
        <div className="signup-link">
          계정이 없으신가요?
          <button type="button" onClick={() => navigate("/signup")}>
            회원가입
          </button>
        </div>
      </div>
    </div>
  )
}