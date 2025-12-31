"use client"

import { useState } from "react"
import HospitalSearchModal from "./HospitalSearchModal"
import "./HospitalVerificationForm.css"

const HospitalVerificationForm = ({ onSubmit, onCancel, onVerifyBusiness, submitting }) => {
    const [hospitalForm, setHospitalForm] = useState({
        businessNumber: "",
        hospitalName: "",
        address: "",
        phoneNumber: "",
        representativeName: "",
    })

    const [businessVerified, setBusinessVerified] = useState(false)
    const [showHospitalModal, setShowHospitalModal] = useState(false)

    const handleVerifyBusiness = async () => {
        if (!hospitalForm.businessNumber || !hospitalForm.representativeName) {
            alert("사업자번호와 대표자명을 입력해주세요.");
            return;
        }

        try {
            await onVerifyBusiness({
            businessNumber: hospitalForm.businessNumber,
            representativeName: hospitalForm.representativeName,
            });

            setBusinessVerified(true);
        } catch (e) {
            console.e("실패", e)
            // onVerifyBusiness 내부에서 alert 처리
        }
        };

    const handleHospitalSelect = (hospital) => {
        setHospitalForm({
        ...hospitalForm,
        hospitalName: hospital.name,
        address: hospital.address,
        phoneNumber: hospital.phone,
        })
        setShowHospitalModal(false)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!businessVerified) {
        alert("사업자 번호 확인을 먼저 진행해주세요.")
        return
        }
        onSubmit(hospitalForm)
    }

    return (
        <div className="verification-container">
        <div className="verification-header">
            <h1 className="verification-title">병원 관계자 인증 신청</h1>
            <p className="verification-subtitle">사업자등록번호와 병원 정보를 입력해주세요</p>
        </div>

        <form className="verification-form" onSubmit={handleSubmit}>
            <div className="form-section">
            <label className="form-label">
                사업자등록번호 <span className="required">*</span>
            </label>
            <div className="input-with-button">
                <input
                type="text"
                className="form-input"
                placeholder="000-00-00000"
                value={hospitalForm.businessNumber}
                onChange={(e) => setHospitalForm({ ...hospitalForm, businessNumber: e.target.value })}
                disabled={businessVerified}
                required
                />
                <button
                type="button"
                className="verify-btn"
                onClick={handleVerifyBusiness}
                disabled={businessVerified || submitting}
                >
                {businessVerified ? "확인 완료" : "확인"}
                </button>
            </div>
            {businessVerified && <p className="verify-success">✓ 사업자번호가 확인되었습니다</p>}
            </div>

            <div className="form-section">
            <label className="form-label">
                대표자명 <span className="required">*</span>
            </label>
            <input
                type="text"
                className="form-input"
                placeholder="대표자명을 입력하세요"
                value={hospitalForm.representativeName}
                onChange={(e) => setHospitalForm({ ...hospitalForm, representativeName: e.target.value })}
                disabled={businessVerified}
                required
            />
            </div>

            <div className="form-section">
            <label className="form-label">
                병원명 <span className="required">*</span>
            </label>
            <div className="input-with-button">
                <input
                type="text"
                className="form-input"
                placeholder="병원명"
                value={hospitalForm.hospitalName}
                onChange={(e) => setHospitalForm({ ...hospitalForm, hospitalName: e.target.value })}
                required
                />
                <button type="button" className="verify-btn" onClick={() => setShowHospitalModal(true)}>
                병원 검색
                </button>
            </div>
            </div>

            <div className="form-section">
            <label className="form-label">
                주소 <span className="required">*</span>
            </label>
            <input
                type="text"
                className="form-input"
                placeholder="병원 주소"
                value={hospitalForm.address}
                onChange={(e) => setHospitalForm({ ...hospitalForm, address: e.target.value })}
                required
            />
            </div>

            <div className="form-section">
            <label className="form-label">
                전화번호 <span className="required">*</span>
            </label>
            <input
                type="tel"
                className="form-input"
                placeholder="000-0000-0000"
                value={hospitalForm.phoneNumber}
                onChange={(e) => setHospitalForm({ ...hospitalForm, phoneNumber: e.target.value })}
                required
            />
            </div>

            <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>
                취소
            </button>
            <button type="submit" className="submit-btn" disabled={submitting || !businessVerified}>
                {submitting ? "제출 중..." : "인증 신청"}
            </button>
            </div>
        </form>

        {showHospitalModal && (
            <HospitalSearchModal onClose={() => setShowHospitalModal(false)} onSelect={handleHospitalSelect} />
        )}
        </div>
    )
}

export default HospitalVerificationForm
