"use client"

import { useState } from "react"
import "./DoctorVerificationForm.css"

const DoctorVerificationForm = ({ onSubmit, onCancel, submitting }) => {
    const [doctorForm, setDoctorForm] = useState({
        licenseNumber: "",
        specialty: "",
        hospitalName: "",
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!doctorForm.licenseNumber || !doctorForm.specialty) {
            alert("모든 필수 항목을 입력해주세요.")
        return
        }
        onSubmit(doctorForm)
    }

    return (
        <div className="verification-container">
        <div className="verification-header">
            <h1 className="verification-title">의사 인증 신청</h1>
            <p className="verification-subtitle">면허번호와 전문 분야를 입력해주세요</p>
        </div>

        <form className="verification-form" onSubmit={handleSubmit}>
            <div className="form-section">
            <label className="form-label">
                의사 면허번호 <span className="required">*</span>
            </label>
            <input
                type="text"
                className="form-input"
                placeholder="면허번호를 입력하세요"
                value={doctorForm.licenseNumber}
                onChange={(e) => setDoctorForm({ ...doctorForm, licenseNumber: e.target.value })}
                required
            />
            </div>

            <div className="form-section">
            <label className="form-label">
                전문 분야 <span className="required">*</span>
            </label>
            <input
                type="text"
                className="form-input"
                placeholder="예: 내과, 외과, 소아과"
                value={doctorForm.specialty}
                onChange={(e) => setDoctorForm({ ...doctorForm, specialty: e.target.value })}
                required
            />
            </div>

            <div className="form-section">
            <label className="form-label">소속 병원 (선택)</label>
            <input
                type="text"
                className="form-input"
                placeholder="소속 병원명"
                value={doctorForm.hospitalName}
                onChange={(e) => setDoctorForm({ ...doctorForm, hospitalName: e.target.value })}
            />
            </div>

            <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>
                취소
            </button>
            <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? "제출 중..." : "인증 신청"}
            </button>
            </div>
        </form>
        </div>
    )
}

export default DoctorVerificationForm
