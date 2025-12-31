"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../../api/authAPI";
import "./SignupPage.css";

export default function SignupPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        passwordConfirm: "",
        name: "",
        phoneNumber: "",

    });

    const handleChange = (e) => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.passwordConfirm) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
        }

        try {
        await signup(formData);

        alert("회원가입이 완료되었습니다. 로그인해주세요.");
        navigate("/login");
        } catch (error) {
        alert(error.message || "회원가입에 실패했습니다.");
        }
    };

    return (
        <div className="signup-page">
        <div className="signup-container">
            <h1>회원가입</h1>

            <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-group">
                <label>이메일 *</label>
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
                <label>비밀번호 *</label>
                <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                placeholder="8자 이상"
                />
            </div>

            <div className="form-group">
                <label>비밀번호 확인 *</label>
                <input
                type="password"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                required
                placeholder="비밀번호 재입력"
                />
            </div>

            <div className="form-group">
                <label>이름 *</label>
                <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="홍길동"
                />
            </div>

            <button type="submit" className="signup-button">
                가입하기
            </button>
            </form>

            <div className="login-link">
            이미 계정이 있으신가요?
            <button onClick={() => navigate("/login")}>로그인</button>
            </div>
        </div>
        </div>
    );
}
