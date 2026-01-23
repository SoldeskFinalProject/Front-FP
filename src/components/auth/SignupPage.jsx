"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signup } from "../../api/authAPI"
import EmailVerification from "./EmailVerification"
import "./SignupPage.css"

export default function SignupPage() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1) 
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        passwordConfirm: "",
        name: "",
        zipcode: "",
        address: "",
        addressDetail: "",
    })
    const [errors, setErrors] = useState({})

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" })
        }
    }

    const validateForm = () => {
        const newErrors = {}
        // ... (유효성 검사 로직은 기존과 동일하므로 생략) ...
        if (!formData.email) newErrors.email = "이메일을 입력해주세요."
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "올바른 이메일 형식이 아닙니다."
        
        if (!formData.password) newErrors.password = "비밀번호를 입력해주세요."
        else if (formData.password.length < 8) newErrors.password = "비밀번호는 8자 이상이어야 합니다."
        
        if (formData.password !== formData.passwordConfirm) newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다."
        
        if (!formData.name) newErrors.name = "이름을 입력해주세요."

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // 🔥 [수정됨] handleNext에서 회원가입 요청을 먼저 보냅니다!
    const handleNext = async (e) => {
        e.preventDefault()
        
        // 1. 유효성 검사 통과 시
        if (validateForm()) {
            try {
                // 2. 백엔드에 회원가입 요청 (DB에 PENDING 상태로 생성)
                await signup(formData)
                
                // 3. 성공하면 다음 단계(이메일 인증)로 이동
                alert("정보가 등록되었습니다. 이메일 인증을 진행해주세요.")
                setStep(2) 
            } catch (error) {
                // 실패 시 (예: 중복된 이메일 등) 에러 표시하고 넘어가지 않음
                console.error(error)
                const errorMsg = error.response?.data?.message || "회원가입 요청 실패"
                alert(errorMsg)
                
                // 에러 메시지를 폼 하단에 보여주고 싶다면 errors 상태에 추가 가능
                setErrors(prev => ({ ...prev, email: errorMsg }))
            }
        }
    }

    // 🔥 [수정됨] 이미 가입은 위에서 끝났으므로, 여기선 이동만 합니다.
    const handleEmailVerified = () => {
        // 이미 1단계에서 signup()을 했고, 
        // EmailVerification 컴포넌트 내부에서 verify API를 호출하여 상태가 ACTIVE로 바뀌었을 것임.
        
        alert("회원가입 및 인증이 모두 완료되었습니다! 로그인해주세요.")
        navigate("/login")
    }

    if (step === 2) {
        return (
            <div className="signup-page">
                {/* 이메일 인증 컴포넌트 */}
                <EmailVerification email={formData.email} onVerified={handleEmailVerified} />
            </div>
        )
    }

    return (
        <div className="signup-page">
            <div className="signup-container">
                <h1>회원가입</h1>
                <p className="signup-subtitle">메디케어 AI에 오신 것을 환영합니다</p>

                <form onSubmit={handleNext} className="signup-form">
                   {/* ... 기존 input 필드들 (변경 없음) ... */}
                   
                   {/* 이메일 입력 부분 등 기존 코드 그대로 유지 */}
                    <div className="form-group">
                        <label>이메일 <span className="required">*</span></label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@email.com"
                            className={errors.email ? "error" : ""}
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label>비밀번호 <span className="required">*</span></label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="8자 이상"
                            className={errors.password ? "error" : ""}
                        />
                        {errors.password && <span className="error-text">{errors.password}</span>}
                    </div>

                    <div className="form-group">
                        <label>비밀번호 확인 <span className="required">*</span></label>
                        <input
                            type="password"
                            name="passwordConfirm"
                            value={formData.passwordConfirm}
                            onChange={handleChange}
                            placeholder="비밀번호 재입력"
                            className={errors.passwordConfirm ? "error" : ""}
                        />
                        {errors.passwordConfirm && <span className="error-text">{errors.passwordConfirm}</span>}
                    </div>

                    <div className="form-group">
                        <label>이름 <span className="required">*</span></label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="홍길동"
                            className={errors.name ? "error" : ""}
                        />
                        {errors.name && <span className="error-text">{errors.name}</span>}
                    </div>

                    <div className="form-section-title">주소 정보 (선택)</div>

                    <div className="form-group">
                        <label>우편번호</label>
                        <input type="text" name="zipcode" value={formData.zipcode} onChange={handleChange} placeholder="12345" />
                    </div>

                    <div className="form-group">
                        <label>주소</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="서울시 강남구" />
                    </div>

                    <div className="form-group">
                        <label>상세주소</label>
                        <input type="text" name="addressDetail" value={formData.addressDetail} onChange={handleChange} placeholder="상세주소 입력" />
                    </div>

                    <button type="submit" className="signup-button">
                        다음 (이메일 인증)
                    </button>
                </form>

                <div className="login-link">
                    이미 계정이 있으신가요?
                    <button onClick={() => navigate("/login")}>로그인</button>
                </div>
            </div>
        </div>
    )
}