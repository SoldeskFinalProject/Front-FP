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

    const { user } = useAuth()
    const [selectedType, setSelectedType] = useState(typeFromUrl?.toUpperCase() || null)
    const [verificationStatus, setVerificationStatus] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (typeFromUrl) {
        setSelectedType(typeFromUrl.toUpperCase())
        }
    }, [typeFromUrl])

    const fetchVerificationStatus = useCallback(async () => {
    try {
        const userId = user?.userId || 1
        const status = await getMyVerificationInfo(userId)
        setVerificationStatus(status)
    } catch (e) {
        console.error("인증 상태 조회 실패:", e)
    } finally {
        setLoading(false)
    }
    }, [user?.userId]) // 또는 [user]

    useEffect(() => {
    fetchVerificationStatus()
    }, [fetchVerificationStatus])


    const handleDoctorSubmit = async (doctorForm) => {
        try {
        setSubmitting(true)
        const userId = user?.userId || 1
        await requestDoctorVerification({
            userId,
            licenseNumber: doctorForm.licenseNumber,
            specialty: doctorForm.specialty,
            hospitalName: doctorForm.hospitalName,
        })
        alert("의사 인증 요청이 제출되었습니다. 관리자 승인을 기다려주세요.")
        navigate("/")
        } catch (error) {
            console.error("", error)
        alert("인증 요청 제출에 실패했습니다.")
        } finally {
        setSubmitting(false)
        }
    }

    const handleHospitalSubmit = async (hospitalForm) => {
        try {
        setSubmitting(true)
        const userId = user?.userId || 1
        await requestHospitalVerification({
            userId,
            businessNumber: hospitalForm.businessNumber,
            hospitalName: hospitalForm.hospitalName,
            address: hospitalForm.address,
            phoneNumber: hospitalForm.phoneNumber,
            representativeName: hospitalForm.representativeName,
        })
        alert("병원 관계자 인증 요청이 제출되었습니다. 관리자 승인을 기다려주세요.")
        navigate("/")
        } catch (error) {
            console.error("", error)
            alert("인증 요청 제출에 실패했습니다.")
        } finally {
            setSubmitting(false)
        }
    }

    const handleVerifyBusiness = async (data) => {
        try {
            setSubmitting(true);

            const response = await verifyBusinessLicense({
            businessNumber: data.businessNumber.replace(/-/g, ""),
            representativeName: data.representativeName,
            });

            if (!response) {
            throw new Error("INVALID");
            }

            alert("사업자 번호가 확인되었습니다.");
        } catch (error) {
            alert("유효하지 않은 사업자 번호입니다.");
            throw error;
        } finally {
            setSubmitting(false);
        }
        };

    if (loading) {
        return <div className="loading">로딩 중...</div>
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
