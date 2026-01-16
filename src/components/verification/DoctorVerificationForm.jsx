"use client"

import { useState } from "react"
import HospitalSearchModal from "./HospitalSearchModal"
import "./DoctorVerificationForm.css"

const DoctorVerificationForm = ({ onSubmit, onCancel, submitting }) => {
    // ✅ 1. state에 address, phoneNumber 추가
    const [doctorForm, setDoctorForm] = useState({
        licenseNumber: "",
        specialty: "",
        hospitalName: "",
        hospitalId: null,
        address: "",      // 주소 추가
        phoneNumber: "",  // 전화번호 추가
    })

    const [showHospitalModal, setShowHospitalModal] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!doctorForm.licenseNumber || !doctorForm.specialty) {
            alert("모든 필수 항목을 입력해주세요.")
            return
        }
        
        onSubmit(doctorForm)
    }

    // ✅ 2. 병원 선택 시 주소와 전화번호도 함께 업데이트
    const handleHospitalSelect = (hospital) => {
        setDoctorForm((prev) => ({
            ...prev,
            hospitalId: hospital.hospitalId,
            hospitalName: hospital.dutyName || hospital.name,
            address: hospital.dutyAddr || "",     // 주소 매핑 (API 응답 필드명 확인)
            phoneNumber: hospital.dutyTel1 || "", // 전화번호 매핑
        }))
        setShowHospitalModal(false)
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

                {/* 소속 병원 검색 */}
                <div className="form-section">
                    <label className="form-label">
                        소속 병원
                    </label>
                    <div className="input-with-button">
                        <input
                            type="text"
                            className="form-input"
                            placeholder="병원 검색 버튼을 눌러주세요"
                            value={doctorForm.hospitalName}
                            readOnly
                        />
                        <button 
                            type="button" 
                            className="verify-btn" 
                            onClick={() => setShowHospitalModal(true)}
                        >
                            병원 검색
                        </button>
                    </div>
                </div>

                {/* ✅ 3. 주소 표시 (자동 입력) */}
                <div className="form-section">
                    <label className="form-label">주소</label>
                    <input 
                        className="form-input" 
                        value={doctorForm.address} 
                        readOnly 
                        placeholder="병원 검색 시 자동 입력됩니다"
                    />
                </div>

                {/* ✅ 4. 전화번호 표시 (자동 입력) */}
                <div className="form-section">
                    <label className="form-label">전화번호</label>
                    <input 
                        className="form-input" 
                        value={doctorForm.phoneNumber} 
                        readOnly 
                        placeholder="병원 검색 시 자동 입력됩니다"
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

            {showHospitalModal && (
                <HospitalSearchModal
                    onClose={() => setShowHospitalModal(false)}
                    onSelect={handleHospitalSelect}
                />
            )}
        </div>
    )
}

export default DoctorVerificationForm