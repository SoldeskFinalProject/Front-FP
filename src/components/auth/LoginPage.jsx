"use client"

<<<<<<< HEAD
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/authAPI"; // ✅ 파일명 통일하면 ../../api/authApi 로 바꾸세요
import "./LoginPage.css";
import KakaoLoginButton from "./KakaoLoginButton";
=======
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import "./LoginPage.css"
>>>>>>> 96b9df30b320512acab2458d87fa6cd0496381a4

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
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
<<<<<<< HEAD
      const response = await login(formData);

      // 🔑 로그인 성공 → 사용자 정보 저장
      localStorage.setItem("user", JSON.stringify(response));

      // ❗ 로그인은 무조건 메인으로
      navigate("/");
=======
      await login(formData)
      navigate("/")
>>>>>>> 96b9df30b320512acab2458d87fa6cd0496381a4
    } catch (error) {
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

        {/* ✅ 카카오 로그인 버튼 (리다이렉트 방식으로 통일) */}
        <KakaoLoginButton />

        {/* ✅ 회원가입 링크 */}
        <div className="signup-link">
          계정이 없으신가요?
          <button onClick={() => navigate("/signup")}>회원가입</button>
        </div>
      </div>
    </div>
  )
}
