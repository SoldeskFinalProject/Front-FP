// src/pages/SymptomResultPage.jsx
"use client";

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./SymptomResultPage.css";
import HospitalRecommendSection from "../components/Hospital/HospitalRecommendSection";

export default function SymptomResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [resultData, setResultData] = useState(null);

  // 0. SymptomPage 에서 넘어온 데이터 세팅
  useEffect(() => {
    if (location.state) {
      setResultData(location.state);
      console.log("[SymptomResultPage] 받은 데이터:", location.state);
    } else {
      alert("증상 분석 데이터가 없습니다.");
      navigate("/");
    }
  }, [location, navigate]);

  if (!resultData) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="result-page-container">
      <header className="result-header">
        <h2 className="result-title">증상 분석 결과</h2>
        <button className="back-btn" onClick={() => navigate("/")}>
          다시 검색하기
        </button>
      </header>

      {/* 선택한 증상 */}
      <section className="result-section">
        <h3 className="result-section-title">선택하신 증상</h3>
        <div className="symptom-list">
          {resultData.selectedSymptoms &&
          resultData.selectedSymptoms.length > 0 ? (
            resultData.selectedSymptoms.map((symptom, index) => (
              <div key={index} className="symptom-item">
                <span className="symptom-name">
                  {symptom.symptomName}
                </span>
                <span className="symptom-category">
                  {symptom.categoryName}
                </span>
              </div>
            ))
          ) : (
            <p className="no-data">선택된 증상이 없습니다.</p>
          )}
        </div>
      </section>

      {/* 업로드한 외상 이미지 */}
      {resultData.uploadedImage && (
        <section className="result-section">
          <h3 className="result-section-title">업로드한 외상 이미지</h3>
          <div className="uploaded-image-container">
            <img
              src={resultData.uploadedImage || "/placeholder.svg"}
              alt="업로드된 외상"
              className="result-image"
            />
          </div>
        </section>
      )}

      {/* 진료과 추천 (placeholder) */}
      <section className="result-section">
        <h3 className="result-section-title">추천 진료과</h3>
        <div className="recommendation-placeholder">
          <p>진료과 추천 기능은 준비 중입니다.</p>
          <p className="placeholder-hint">
            향후 AI 분석을 통해 적합한 진료과를 추천해드릴 예정입니다.
          </p>
        </div>
      </section>

      {/* ✅ 병원 추천 + 즐겨찾기/예약/리뷰/길찾기 – 전부 별도 컴포넌트로 분리 */}
      <HospitalRecommendSection resultData={resultData} />
    </div>
  );
}
