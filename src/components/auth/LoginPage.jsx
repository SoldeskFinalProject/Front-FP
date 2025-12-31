"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/authAPI";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await login(formData);

      /**
       * response 예시 (JWT 전)
       * {
       *   userId,
       *   email,
       *   name,
       *   role: "USER" | "DOCTOR" | "HOSPITAL" | "ADMIN",
       *   status: "ACTIVE" | "PENDING_DOCTOR" | "PENDING_HOSPITAL"
       * }
       */

      // 🔑 로그인 성공 → 사용자 정보 저장
      localStorage.setItem("user", JSON.stringify(response));

      // ❗ 로그인은 무조건 메인으로
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "로그인에 실패했습니다.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>로그인</h1>

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
            />
          </div>

          <button type="submit" className="login-button">
            로그인
          </button>
        </form>

        <div className="signup-link">
          계정이 없으신가요?
          <button onClick={() => navigate("/signup")}>회원가입</button>
        </div>
      </div>
    </div>
  );
}
