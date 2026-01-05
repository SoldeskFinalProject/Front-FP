"use client"

import { useState } from "react"
import HospitalSearchModal from "./HospitalSearchModal"
import "./HospitalVerificationForm.css"

// 숫자만 남기기
const onlyDigits = (v = "") => v.replace(/[^0-9]/g, "")

// 사업자번호 표시용 포맷: 123-45-67890
const formatBizNo = (digits = "") => {
    const d = onlyDigits(digits).slice(0, 10)
    const a = d.slice(0, 3)
    const b = d.slice(3, 5)
    const c = d.slice(5, 10)
    if (d.length <= 3) return a
    if (d.length <= 5) return `${a}-${b}`
    return `${a}-${b}-${c}`
}

// date input(YYYY-MM-DD) -> YYYYMMDD
const toYYYYMMDD = (yyyyDashMmDashDd = "") => yyyyDashMmDashDd.replaceAll("-", "")

// 대표자명 trim + 연속공백 정리
const normalizeName = (v = "") => v.replace(/\s+/g, " ").trim()

const HospitalVerificationForm = ({ onSubmit, onCancel, onVerifyBusiness, submitting }) => {
    const [hospitalForm, setHospitalForm] = useState({
        businessNumber: "",
        startDt: "",
        startDtUi: "",
        hospitalName: "",
        hospitalId: null,
        address: "",
        phoneNumber: "",
        representativeName: "",
    })

    const [businessVerified, setBusinessVerified] = useState(false)
    const [showHospitalModal, setShowHospitalModal] = useState(false)

    const handleVerifyBusiness = async () => {
        const bNoDigits = onlyDigits(hospitalForm.businessNumber).slice(0, 10)
        const pNm = normalizeName(hospitalForm.representativeName)
        const startDt = hospitalForm.startDt

        if (!bNoDigits || bNoDigits.length !== 10 || !pNm || !startDt || startDt.length !== 8) {
        alert("사업자번호(10자리), 대표자명, 개업일자를 입력해주세요.")
        setBusinessVerified(false)
        return
        }

        const ok = await onVerifyBusiness({
        businessNumber: bNoDigits,   // ✅ 숫자 10자리로 전달
        representativeName: pNm,     // ✅ trim된 값
        startDt,                     // ✅ YYYYMMDD
        })

        setBusinessVerified(!!ok)
    }

    const handleHospitalSelect = (hospital) => {
        setHospitalForm((prev) => ({
        ...prev,
        hospitalId: hospital.hospitalId,
        hospitalName: hospital.name,
        address: hospital.address,
        phoneNumber: hospital.phone,
        }))
        setShowHospitalModal(false)
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!businessVerified) {
        alert("사업자 번호 확인을 먼저 진행해주세요.")
        return
        }

        // ✅ 최종 제출 시에도 안전하게 정규화해서 넘김
        onSubmit({
        ...hospitalForm,
        businessNumber: onlyDigits(hospitalForm.businessNumber).slice(0, 10),
        representativeName: normalizeName(hospitalForm.representativeName),
        startDt: hospitalForm.startDt, // YYYYMMDD
        })
    }

    return (
        <div className="verification-container">
        <div className="verification-header">
            <h1 className="verification-title">병원 관계자 인증 신청</h1>
            <p className="verification-subtitle">사업자등록번호와 병원 정보를 입력해주세요</p>
        </div>

        <form className="verification-form" onSubmit={handleSubmit}>
            {/* 사업자등록번호 */}
            <div className="form-section">
            <label className="form-label">
                사업자등록번호 <span className="required">*</span>
            </label>
            <div className="input-with-button">
                <input
                type="text"
                className="form-input"
                placeholder="123-45-67890"
                value={formatBizNo(hospitalForm.businessNumber)} // ✅ 화면엔 포맷
                onChange={(e) => {
                    const digits = onlyDigits(e.target.value).slice(0, 10)
                    setHospitalForm((prev) => ({ ...prev, businessNumber: digits }))
                    if (businessVerified) setBusinessVerified(false) // 값 바뀌면 재검증 필요
                }}
                disabled={businessVerified}
                inputMode="numeric"
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

            {/* 대표자명 */}
            <div className="form-section">
            <label className="form-label">
                대표자명 <span className="required">*</span>
            </label>
            <input
                type="text"
                className="form-input"
                placeholder="대표자명을 입력하세요"
                value={hospitalForm.representativeName}
                onChange={(e) => {
                setHospitalForm((prev) => ({ ...prev, representativeName: e.target.value }))
                if (businessVerified) setBusinessVerified(false)
                }}
                onBlur={() => {
                // ✅ 포커스 빠질 때 trim 반영
                setHospitalForm((prev) => ({
                    ...prev,
                    representativeName: normalizeName(prev.representativeName),
                }))
                }}
                disabled={businessVerified}
                required
            />
            </div>

            {/* 개업일자: date picker */}
            <div className="form-section">
            <label className="form-label">
                개업일자 <span className="required">*</span>
            </label>
            <input
                type="date"
                className="form-input"
                value={hospitalForm.startDtUi}
                onChange={(e) => {
                const ui = e.target.value // YYYY-MM-DD
                const yyyymmdd = toYYYYMMDD(ui)
                setHospitalForm((prev) => ({ ...prev, startDtUi: ui, startDt: yyyymmdd }))
                if (businessVerified) setBusinessVerified(false)
                }}
                disabled={businessVerified}
                required
            />
            {/* 필요하면 아래처럼 숨김 처리/디버그용으로 startDt 보여줘도 됨 */}
            {/* <small>전송값: {hospitalForm.startDt}</small> */}
            </div>

            {/* 병원명 */}
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
                onChange={(e) => setHospitalForm((prev) => ({ ...prev, hospitalName: e.target.value }))}
                required
                />
                <button type="button" className="verify-btn" onClick={() => setShowHospitalModal(true)}>
                병원 검색
                </button>
            </div>
            </div>

            {/* 주소 */}
            <div className="form-section">
            <label className="form-label">
                주소 <span className="required">*</span>
            </label>
            <input
                type="text"
                className="form-input"
                placeholder="병원 주소"
                value={hospitalForm.address}
                onChange={(e) => setHospitalForm((prev) => ({ ...prev, address: e.target.value }))}
                required
            />
            </div>

            {/* 전화번호 */}
            <div className="form-section">
            <label className="form-label">
                전화번호 <span className="required">*</span>
            </label>
            <input
                type="tel"
                className="form-input"
                placeholder="000-0000-0000"
                value={hospitalForm.phoneNumber}
                onChange={(e) => setHospitalForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
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
