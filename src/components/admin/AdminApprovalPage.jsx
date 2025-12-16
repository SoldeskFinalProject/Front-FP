"use client"

import { useState, useEffect } from "react"
import { getPendingDoctors, getPendingHospitals, approveDoctor, approveHospital } from "../../api/authAPI"
import "./AdminApprovalPage.css"

export default function AdminApprovalPage() {
    const [pendingDoctors, setPendingDoctors] = useState([])
    const [pendingHospitals, setPendingHospitals] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("doctors") // 탭 상태 추가

    useEffect(() => {
        loadPendingLists()
    }, [])

    const loadPendingLists = async () => {
        try {
        setLoading(true)
        const [doctors, hospitals] = await Promise.all([getPendingDoctors(), getPendingHospitals()])
        setPendingDoctors(doctors)
        setPendingHospitals(hospitals)
        } catch (error) {
        console.error("승인 목록 로딩 실패:", error)
        } finally {
        setLoading(false)
        }
    }

    const handleApproveDoctor = async (doctorId) => {
        if (!window.confirm("의사 승인하시겠습니까?")) return

        try {
        await approveDoctor(doctorId)
        alert("의사가 승인되었습니다.")
        loadPendingLists()
        } catch (error) {
        alert(error.message || "승인에 실패했습니다.")
        }
    }

    const handleApproveHospital = async (hospitalId) => {
        if (!window.confirm("병원 관계자를 승인하시겠습니까?")) return

        try {
        await approveHospital(hospitalId)
        alert("병원 관계자가 승인되었습니다.")
        loadPendingLists()
        } catch (error) {
        alert(error.message || "승인에 실패했습니다.")
        }
    }

    if (loading) {
        return (
        <div className="admin-page">
            <div className="loading">로딩 중...</div>
        </div>
        )
    }

    const currentList = activeTab === "doctors" ? pendingDoctors : pendingHospitals
    const totalPending = pendingDoctors.length + pendingHospitals.length

    return (
        <div className="admin-page">
        <div className="admin-container">
            <h1>승인 요청 관리</h1>
            <p className="admin-description">
            의사 및 병원 관계자 가입 신청을 검토하고 승인할 수 있습니다.
            <span className="pending-count"> (대기 중: {totalPending}건)</span>
            </p>

            <div className="approval-tabs">
            <button
                className={`tab-button ${activeTab === "doctors" ? "active" : ""}`}
                onClick={() => setActiveTab("doctors")}
            >
                의사 ({pendingDoctors.length})
            </button>
            <button
                className={`tab-button ${activeTab === "hospitals" ? "active" : ""}`}
                onClick={() => setActiveTab("hospitals")}
            >
                병원 관계자 ({pendingHospitals.length})
            </button>
            </div>

            {currentList.length === 0 ? (
            <div className="no-data">
                <p>승인 대기 중인 {activeTab === "doctors" ? "의사" : "병원 관계자"}가 없습니다.</p>
            </div>
            ) : (
            <div className="approval-list">
                {activeTab === "doctors" &&
                pendingDoctors.map((doctor) => (
                    <div key={doctor.doctorId} className="approval-item">
                    <div className="user-info">
                        <div className="user-header">
                        <h3>{doctor.name}</h3>
                        <span className="role-badge doctor">의사</span>
                        </div>
                        <p className="user-email">{doctor.email}</p>
                        <p className="user-detail">면허번호: {doctor.licenseNumber}</p>
                        <p className="user-detail">진료과: {doctor.specialty}</p>
                        {doctor.bio && <p className="user-detail">소개: {doctor.bio}</p>}
                    </div>
                    <div className="action-buttons">
                        <button onClick={() => handleApproveDoctor(doctor.doctorId)} className="approve-button">
                        승인
                        </button>
                    </div>
                    </div>
                ))}

                {activeTab === "hospitals" &&
                pendingHospitals.map((hospital) => (
                    <div key={hospital.hospitalMemberId} className="approval-item">
                    <div className="user-info">
                        <div className="user-header">
                        <h3>{hospital.name}</h3>
                        <span className="role-badge hospital">병원 관계자</span>
                        </div>
                        <p className="user-email">{hospital.email}</p>
                        <p className="user-detail">사업자번호: {hospital.businessNumber}</p>
                    </div>
                    <div className="action-buttons">
                        <button onClick={() => handleApproveHospital(hospital.hospitalMemberId)} className="approve-button">
                        승인
                        </button>
                    </div>
                    </div>
                ))}
            </div>
            )}
        </div>
        </div>
    )
}
