"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import {
    getMyVerificationInfo,
    requestDoctorVerification,
    requestHospitalVerification,
    verifyBusinessLicense,
} from "../api/userAPI"
import VerificationTypeSelect from "../components/verification/VerificationTypeSelect"
import VerificationStatusBanner from "../components/verification/VerificationStatusBanner"
import DoctorVerificationForm from "../components/verification/DoctorVerificationForm"
import HospitalVerificationForm from "../components/verification/HospitalVerificationForm"
import "./VerificationRequestPage.css"

const VerificationRequestPage = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const typeFromUrl = searchParams.get("type")

    const { user, isAuthenticated } = useAuth()
    const [selectedType, setSelectedType] = useState(typeFromUrl?.toUpperCase() || null)
    const [verificationStatus, setVerificationStatus] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) {
            alert("로그인이 필요한 서비스입니다.")
            navigate("/login")
        }
    }, [isAuthenticated, navigate])

    useEffect(() => {
        if (typeFromUrl) {
        setSelectedType(typeFromUrl.toUpperCase())
        }
    }, [typeFromUrl])

    const fetchVerificationStatus = useCallback(async () => {
        try {
        if (!user?.userId) {
            setLoading(false)
            return
        }
        const status = await getMyVerificationInfo(user.userId)
        setVerificationStatus(status)
        } catch (e) {
            console.error("인증 상태 조회 실패:", e)
        } finally {
            setLoading(false)
        }
    }, [user?.userId])

    useEffect(() => {
        fetchVerificationStatus()
    }, [fetchVerificationStatus])

    const handleDoctorSubmit = async (doctorForm) => {
        try {
        setSubmitting(true)
        if (!user?.userId) {
            alert("로그인이 필요합니다.")
            navigate("/login")
            return
        }

        await requestDoctorVerification({
            userId: user.userId,
            licenseNumber: doctorForm.licenseNumber,
            specialty: doctorForm.specialty,
            requestedHospitalId: doctorForm.hospitalId,
            bio: doctorForm.bio || null,
            profileImageUrl: doctorForm.profileImageUrl || null,
            licenseFileUrl: doctorForm.licenseFileUrl || null,
        })

        alert("의사 인증 요청이 제출되었습니다. 관리자 승인을 기다려주세요.")
        navigate("/")
        } catch (error) {
        console.error(error)
        alert(error.response?.data?.message || "인증 요청 제출에 실패했습니다.")
        } finally {
        setSubmitting(false)
        }
    }

    const handleHospitalSubmit = async (hospitalForm) => {
        try {
        setSubmitting(true)
        if (!user?.userId) {
            alert("로그인이 필요합니다.")
            navigate("/login")
            return
        }

        const payload = {
            userId: user.userId,
            hospitalId: hospitalForm.hospitalId,
            requireValidate: true,
            bNo: hospitalForm.businessNumber,
            startDt: hospitalForm.startDt,
            pNm: hospitalForm.representativeName,
            pNm2: null,
            bNm: "",
            corpNo: "",
            bSector: "",
            bType: "",
            bAdr: "",
        }

        const res = await requestHospitalVerification(payload)

        if (res?.created !== true) {
            alert(res?.ntsResult?.message || "국세청 검증이 통과되지 않아 저장되지 않았습니다.")
            return
        }

        alert("병원 관계자 인증 요청이 제출되었습니다. 관리자 승인을 기다려주세요.")
        navigate("/")
        } catch (error) {
        console.error(error)
        alert(error.response?.data?.message || "인증 요청 제출에 실패했습니다.")
        } finally {
        setSubmitting(false)
        }
    }

    const handleVerifyBusiness = async ({ bNo, startDt, pNm }) => {
        try {
        setSubmitting(true)

        const res = await verifyBusinessLicense({
            bNo,
            startDt,
            pNm,
            pNm2: null,
            bNm: "",
            corpNo: "",
            bSector: "",
            bType: "",
            bAdr: "",
        })

        if (res?.outcome === "PASS") {
            return { ok: true, message: res?.message || "진위확인 통과(Valid)입니다." }
        }

        return { ok: false, message: res?.message || "사업자 정보 확인 실패" }
        } catch (error) {
        console.error("사업자 검증 오류:", error)
        return { ok: false, message: "국세청 API 호출 실패" }
        } finally {
        setSubmitting(false)
        }
    }

    if (!isAuthenticated) {
        return null
    }

    if (loading) {
        return (
        <div className="verification-loading">
            <div className="loading-spinner"></div>
            <p>로딩 중...</p>
        </div>
        )
    }

    if (!selectedType) {
        return (
        <>
            <VerificationStatusBanner verificationStatus={verificationStatus} />
            <VerificationTypeSelect onSelectType={(type) => setSelectedType(type)} onBack={() => navigate("/")} />
        </>
        )
    }

    if (selectedType === "DOCTOR") {
        return (
        <DoctorVerificationForm
            onSubmit={handleDoctorSubmit}
            onCancel={() => setSelectedType(null)}
            submitting={submitting}
        />
        )
    }

    if (selectedType === "HOSPITAL") {
        return (
        <HospitalVerificationForm
            onSubmit={handleHospitalSubmit}
            onCancel={() => setSelectedType(null)}
            onVerifyBusiness={handleVerifyBusiness}
            submitting={submitting}
        />
        )
    }

    return null
}

export default VerificationRequestPage
