"use client"

import { useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import "./SymptomResultPage.css"

export default function SymptomResultPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const [resultData, setResultData] = useState(null)

    useEffect(() => {
        // SymptomPage에서 전달받은 데이터
        if (location.state) {
        setResultData(location.state)
        console.log("[v0] 받은 데이터:", location.state)
        } else {
        // 데이터 없이 직접 접근한 경우 메인으로 리다이렉트
        alert("증상 분석 데이터가 없습니다.")
        navigate("/")
        }
    }, [location, navigate])

    if (!resultData) {
        return <div className="loading">로딩 중...</div>
    }

    return (
        <div className="result-page-container">
        <header className="result-header">
            <h2 className="result-title">증상 분석 결과</h2>
            <button className="back-btn" onClick={() => navigate("/")}>
            다시 검색하기
            </button>
        </header>

        <section className="result-section">
            <h3 className="result-section-title">선택하신 증상</h3>
            <div className="symptom-list">
            {resultData.selectedSymptoms && resultData.selectedSymptoms.length > 0 ? (
                resultData.selectedSymptoms.map((symptom, index) => (
                <div key={index} className="symptom-item">
                    <span className="symptom-name">{symptom.symptomName}</span>
                    <span className="symptom-category">{symptom.categoryName}</span>
                </div>
                ))
            ) : (
                <p className="no-data">선택된 증상이 없습니다.</p>
            )}
            </div>
        </section>

        {resultData.uploadedImage && (
            <section className="result-section">
            <h3 className="result-section-title">업로드한 외상 이미지</h3>
            <div className="uploaded-image-container">
                <img src={resultData.uploadedImage || "/placeholder.svg"} alt="업로드된 외상" className="result-image" />
            </div>
            </section>
        )}

        <section className="result-section">
            <h3 className="result-section-title">추천 진료과</h3>
            <div className="recommendation-placeholder">
            <p>진료과 추천 기능은 준비 중입니다.</p>
            <p className="placeholder-hint">향후 AI 분석을 통해 적합한 진료과를 추천해드릴 예정입니다.</p>
            </div>
        </section>

        <section className="result-section">
            <h3 className="result-section-title">추천 병원</h3>
            <div className="recommendation-placeholder">
            <p>병원 추천 기능은 준비 중입니다.</p>
            <p className="placeholder-hint">향후 위치 기반으로 근처 병원을 추천해드릴 예정입니다.</p>
            </div>
        </section>
        </div>
    )
}
