"use client"

import { useState } from "react"
import HospitalSearchModal from "./HospitalSearchModal"
import "./HospitalVerificationForm.css"

// 숫자만
const onlyDigits = (v = "") => v.replace(/[^0-9]/g, "")

// 사업자번호 표시: 123-45-67890
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
const toYYYYMMDD = (yyyyDashMmDashDd = "") => (yyyyDashMmDashDd || "").replaceAll("-", "")

// 대표자명 공백 정리
const normalizeName = (v = "") => v.replace(/\s+/g, " ").trim()

const HospitalVerificationForm = ({ onSubmit, onCancel, onVerifyBusiness, submitting }) => {
    const [hospitalForm, setHospitalForm] = useState({
        businessNumber: "",   // UI 표시용 (하이픈 포함 가능)
        startDt: "",          // YYYYMMDD (서버로 보낼 값)
        startDtUi: "",        // YYYY-MM-DD (date input용)
        hospitalName: "",
        hospitalId: null,
        address: "",
        phoneNumber: "",
        representativeName: "",
    })

    const [businessVerified, setBusinessVerified] = useState(false)
    const [verifyMsg, setVerifyMsg] = useState("")
    const [verifyError, setVerifyError] = useState(false)
    const [showHospitalModal, setShowHospitalModal] = useState(false)

    const handleVerifyBusiness = async () => {
        const bNoDigits = onlyDigits(hospitalForm.businessNumber).slice(0, 10)
        const pNm = normalizeName(hospitalForm.representativeName)
        const startDt = onlyDigits(hospitalForm.startDt).slice(0, 8)

        // 프론트 1차 검증
        if (bNoDigits.length !== 10 || !pNm || startDt.length !== 8) {
        setBusinessVerified(false)
        setVerifyError(true)
        setVerifyMsg("사업자번호(10자리), 대표자명, 개업일자(8자리)를 올바르게 입력해주세요.")
        alert("사업자번호(10자리), 대표자명, 개업일자를 입력해주세요.")
        return
        }

        setVerifyMsg("")
        setVerifyError(false)

        // ✅ verify는 딱 1번만 호출
        const result = await onVerifyBusiness({
        bNo: bNoDigits,
        startDt,
        pNm,
        })

        if (result?.ok) {
        setBusinessVerified(true)
        setVerifyError(false)
        setVerifyMsg(result.message || "사업자번호 확인 완료")
        } else {
        setBusinessVerified(false)
        setVerifyError(true)
        setVerifyMsg(result?.message || "사업자 정보 확인에 실패했습니다.")
        }
    }

    const handleHospitalSelect = (hospital) => {
        // hospital entity 기준: hospitalId / dutyName / dutyAddr / dutyTel1
        setHospitalForm((prev) => ({
        ...prev,
        hospitalId: hospital.hospitalId,
        hospitalName: hospital.dutyName,
        address: hospital.dutyAddr || "",
        phoneNumber: hospital.dutyTel1 || "",
        }))
        setShowHospitalModal(false)
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!businessVerified) {
            alert("사업자 번호 확인을 먼저 진행해주세요.")
            return
        }
        if (!hospitalForm.hospitalId) {
            alert("관리할 병원을 선택해주세요.")
            return
        }

        onSubmit({
        ...hospitalForm,
        // ✅ 서버로 보낼 값은 항상 정규화
        businessNumber: onlyDigits(hospitalForm.businessNumber).slice(0, 10),
        startDt: onlyDigits(hospitalForm.startDt).slice(0, 8),
        representativeName: normalizeName(hospitalForm.representativeName),
        })
    }

    return (
        <div className="verification-container">
        <div className="verification-header">
            <h1 className="verification-title">병원 관계자 인증 신청</h1>
            <p className="verification-subtitle">사업자등록번호와 병원 정보를 입력해주세요</p>
        </div>

        <form className="verification-form" onSubmit={handleSubmit}>
            {/* 사업자번호 */}
            <div className="form-section">
            <label className="form-label">
                사업자등록번호 <span className="required">*</span>
            </label>
            <div className="input-with-button">
                <input
                type="text"
                className="form-input"
                placeholder="123-45-67890"
                value={formatBizNo(hospitalForm.businessNumber)}
                onChange={(e) =>
                    setHospitalForm((prev) => ({ ...prev, businessNumber: e.target.value }))
                }
                disabled={submitting}
                required
                />
                <button
                type="button"
                className="verify-btn"
                onClick={handleVerifyBusiness}
                disabled={submitting}
                >
                {businessVerified ? "재확인" : "확인"}
                </button>
            </div>

            {verifyMsg && (
                <p className={verifyError ? "verify-fail" : "verify-success"}>
                {verifyError ? "✗ " : "✓ "}
                {verifyMsg}
                </p>
            )}
            </div>

            {/* 대표자명 */}
            <div className="form-section">
            <label className="form-label">
                대표자명 <span className="required">*</span>
            </label>
            <input
                type="text"
                className="form-input"
                placeholder="홍길동"
                value={hospitalForm.representativeName}
                onChange={(e) =>
                setHospitalForm((prev) => ({ ...prev, representativeName: e.target.value }))
                }
                disabled={submitting}
                required
            />
            </div>

            {/* 개업일자 */}
            <div className="form-section">
            <label className="form-label">
                개업일자 <span className="required">*</span>
            </label>
            <input
                type="date"
                className="form-input"
                value={hospitalForm.startDtUi}
                onChange={(e) => {
                const v = e.target.value
                setHospitalForm((prev) => ({
                    ...prev,
                    startDtUi: v,
                    startDt: toYYYYMMDD(v), // ✅ YYYYMMDD 저장
                }))
                }}
                disabled={submitting}
                required
            />
            </div>

            {/* 병원 선택 */}
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
                readOnly
                required
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

            {/* 주소/전화 */}
            <div className="form-section">
            <label className="form-label">주소</label>
            <input className="form-input" value={hospitalForm.address} readOnly />
            </div>

            <div className="form-section">
            <label className="form-label">전화번호</label>
            <input className="form-input" value={hospitalForm.phoneNumber} readOnly />
            </div>

            <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>
                취소
            </button>
            <button
                type="submit"
                className="submit-btn"
                disabled={submitting || !businessVerified || !hospitalForm.hospitalId}
            >
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

export default HospitalVerificationForm
