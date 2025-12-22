"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { signup, getAllHospitals } from "../../api/authAPI"
import "./SignupPage.css"

export default function SignupPage() {
    const navigate = useNavigate()
    const [userType, setUserType] = useState("USER") // USER, DOCTOR, HOSPITAL
    const [hospitals, setHospitals] = useState([])
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        passwordConfirm: "",
        name: "",
        // 일반 사용자
        zipcode: "",
        address: "",
        addressDetail: "",
        // 의사
        licenseNumber: "",
        specialty: "",
        hospitalId: "",
        bio: "",
        // 병원 관계자
        businessNumber: "",
    })

    useEffect(() => {
        // 병원 목록 가져오기
        if (userType === "DOCTOR" || userType === "HOSPITAL") {
        loadHospitals()
        }
    }, [userType])

    const loadHospitals = async () => {
        try {
        const data = await getAllHospitals()
        setHospitals(data)
        } catch (error) {
        console.error("병원 목록 로딩 실패:", error)
        }
    }

    const handleChange = (e) => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // 비밀번호 확인
        if (formData.password !== formData.passwordConfirm) {
        alert("비밀번호가 일치하지 않습니다.")
        return
        }

        try {
        await signup(userType, formData)

        if (userType === "USER") {
            alert("회원가입이 완료되었습니다. 로그인해주세요.")
            navigate("/login")
        } else {
            alert("가입 신청이 완료되었습니다. 관리자 승인 후 이용 가능합니다.")
            navigate("/login")
        }
        } catch (error) {
        alert(error.message || "회원가입에 실패했습니다.")
        }
    }

    return (
        <div className="signup-page">
        <div className="signup-container">
            <h1>회원가입</h1>

            {/* 사용자 유형 선택 */}
            <div className="user-type-selector">
            <button type="button" className={userType === "USER" ? "active" : ""} onClick={() => setUserType("USER")}>
                일반 사용자
            </button>
            <button type="button" className={userType === "DOCTOR" ? "active" : ""} onClick={() => setUserType("DOCTOR")}>
                의사
            </button>
            <button
                type="button"
                className={userType === "HOSPITAL" ? "active" : ""}
                onClick={() => setUserType("HOSPITAL")}
            >
                병원 관계자
            </button>
            </div>

            <form onSubmit={handleSubmit} className="signup-form">
            {/* 공통 입력 필드 */}
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
                placeholder="8자 이상"
                minLength="8"
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

            {/* 일반 사용자 전용 */}
            {userType === "USER" && (
                <>
                <div className="form-group">
                    <label>우편번호</label>
                    <input
                    type="text"
                    name="zipcode"
                    value={formData.zipcode}
                    onChange={handleChange}
                    placeholder="12345"
                    />
                </div>
                <div className="form-group">
                    <label>주소</label>
                    <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="서울특별시 강남구"
                    />
                </div>
                <div className="form-group">
                    <label>상세주소</label>
                    <input
                    type="text"
                    name="addressDetail"
                    value={formData.addressDetail}
                    onChange={handleChange}
                    placeholder="아파트 동/호수"
                    />
                </div>
                </>
            )}

            {/* 의사 전용 */}
            {userType === "DOCTOR" && (
                <>
                <div className="form-group">
                    <label>의사 면허번호 *</label>
                    <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    required
                    placeholder="123456"
                    />
                </div>
                <div className="form-group">
                    <label>진료과 *</label>
                    <input
                    type="text"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    required
                    placeholder="내과, 외과, 정형외과 등"
                    />
                </div>
                <div className="form-group">
                    <label>소속 병원 *</label>
                    <select name="hospitalId" value={formData.hospitalId} onChange={handleChange} required>
                    <option value="">병원을 선택하세요</option>
                    {hospitals.map((hospital) => (
                        <option key={hospital.hospitalId} value={hospital.hospitalId}>
                        {hospital.hospitalName}
                        </option>
                    ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>소개</label>
                    <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="간단한 소개를 입력하세요"
                    rows="4"
                    />
                </div>
                </>
            )}

            {/* 병원 관계자 전용 */}
            {userType === "HOSPITAL" && (
                <>
                <div className="form-group">
                    <label>사업자 번호 *</label>
                    <input
                    type="text"
                    name="businessNumber"
                    value={formData.businessNumber}
                    onChange={handleChange}
                    required
                    placeholder="123-45-67890"
                    />
                </div>
                <div className="form-group">
                    <label>소속 병원 *</label>
                    <select name="hospitalId" value={formData.hospitalId} onChange={handleChange} required>
                    <option value="">병원을 선택하세요</option>
                    {hospitals.map((hospital) => (
                        <option key={hospital.hospitalId} value={hospital.hospitalId}>
                        {hospital.hospitalName}
                        </option>
                    ))}
                    </select>
                </div>
                </>
            )}

            <button type="submit" className="signup-button">
                가입하기
            </button>
            </form>

            <div className="login-link">
            이미 계정이 있으신가요? <button onClick={() => navigate("/login")}>로그인</button>
            </div>
        </div>
        </div>
    )
}
