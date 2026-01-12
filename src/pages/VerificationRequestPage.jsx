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
            setSubmitting(true);
            const userId = user?.userId || 1;

            await requestDoctorVerification({
            userId,
            licenseNumber: doctorForm.licenseNumber,
            specialty: doctorForm.specialty,
            requestedHospitalId: doctorForm.hospitalId, // ✅ 병원 PK
            bio: doctorForm.bio || null,
            profileImageUrl: doctorForm.profileImageUrl || null,
            licenseFileUrl: doctorForm.licenseFileUrl || null,
            });

            alert("의사 인증 요청이 제출되었습니다. 관리자 승인을 기다려주세요.");
            navigate("/");
        } catch (error) {
            console.error(error);
            alert("인증 요청 제출에 실패했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleHospitalSubmit = async (hospitalForm) => {
        try {
            setSubmitting(true)
            const userId = user?.userId || 1

            const payload = {
            userId,
            hospitalId: hospitalForm.hospitalId,
            requireValidate: true,

            // ✅ DTO 필드명과 동일해야 함
            bNo: hospitalForm.businessNumber,     // 이미 HospitalVerificationForm에서 숫자 10자리로 정규화해서 옴
            startDt: hospitalForm.startDt,        // YYYYMMDD
            pNm: hospitalForm.representativeName, // 정규화된 이름

            // optional
            pNm2: null,
            bNm: "",
            corpNo: "",
            bSector: "",
            bType: "",
            bAdr: "",
            }

            const res = await requestHospitalVerification(payload)

            // PASS만 저장하는 설계면 created로 분기
            if (res?.created !== true) {
            alert(res?.ntsResult?.message || "국세청 검증이 통과되지 않아 저장되지 않았습니다.")
            return
            }

            alert("병원 관계자 인증 요청이 제출되었습니다. 관리자 승인을 기다려주세요.")
            navigate("/")
        } catch (error) {
            console.error(error)
            alert("인증 요청 제출에 실패했습니다.")
        } finally {
            setSubmitting(false)
        }
    }



    // const handleVerifyBusiness = async (data) => {
    //     try {
    //         setSubmitting(true);

    //         const response = await verifyBusinessLicense({
    //         businessNumber: data.businessNumber.replace(/-/g, ""),
    //         representativeName: data.representativeName,
    //         });

    //         if (!response) {
    //         throw new Error("INVALID");
    //         }

    //         alert("사업자 번호가 확인되었습니다.");
    //     } catch (error) {
    //         alert("유효하지 않은 사업자 번호입니다.");
    //         throw error;
    //     } finally {
    //         setSubmitting(false);
    //     }
    // };

    const handleVerifyBusiness = async ({ bNo, startDt, pNm }) => {
    try {
        setSubmitting(true)

        const res = await verifyBusinessLicense({
        bNo,      // HospitalVerificationCreateReqDTO와 동일한 이름
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

        // FAIL/ERROR 모두 여기로
        return { ok: false, message: res?.message || "사업자 정보 확인 실패" }
    } catch (error) {
        console.error("", error)
        return { ok: false, message: "국세청 API 호출 실패(네트워크/키/타임아웃) 가능" }
    } finally {
        setSubmitting(false)
    }
    }




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
