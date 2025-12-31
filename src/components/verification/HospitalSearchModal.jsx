"use client"

import { useState, useEffect } from "react"
import { getAllHospitals } from "../../api/hospitalApi"
import "./HospitalSearchModal.css"

const HospitalSearchModal = ({ onClose, onSelect }) => {
    const [hospitals, setHospitals] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchHospitals()
    }, [])

    const fetchHospitals = async () => {
        try {
        const data = await getAllHospitals()
        setHospitals(data)
        setLoading(false)
        } catch (error) {
        console.error("병원 목록 조회 실패:", error)
        setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
            <h2 className="modal-title">병원 선택</h2>
            <button className="modal-close" onClick={onClose}>
                ✕
            </button>
            </div>

            <div className="modal-body">
            {loading ? (
                <div className="loading-text">로딩 중...</div>
            ) : (
                <div className="hospital-list">
                {hospitals.length === 0 ? (
                    <div className="empty-state">등록된 병원이 없습니다</div>
                ) : (
                    hospitals.map((hospital) => (
                    <div key={hospital.id} className="hospital-item" onClick={() => onSelect(hospital)}>
                        <div className="hospital-name">{hospital.name}</div>
                        {hospital.businessNumber && (
                        <div className="hospital-info">사업자번호: {hospital.businessNumber}</div>
                        )}
                        {hospital.address && <div className="hospital-info">{hospital.address}</div>}
                        {hospital.phone && <div className="hospital-info">{hospital.phone}</div>}
                    </div>
                    ))
                )}
                </div>
            )}
            </div>
        </div>
        </div>
    )
}

export default HospitalSearchModal
