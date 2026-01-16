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
      alert("잘못된 접근입니다. 증상 선택 페이지로 이동합니다.");
      navigate("/symptom"); // 증상 선택 페이지 경로로 수정 필요
    }
  }, [location, navigate]);

  if (!resultData) {
    return <div className="loading">결과를 불러오는 중...</div>;
  }

  // 데이터 구조 분해 할당 (편의성)
  const { depts, selectedSymptoms } = resultData;

  return (
    <div className="result-page-container">
      <header className="result-header">
        <h2 className="result-title">증상 분석 결과</h2>
        <button className="back-btn" onClick={() => navigate(-1)}> {/* 뒤로가기 */}
          다시 선택하기
        </button>
      </header>

      {/* 1. 선택한 증상 리스트 */}
      <section className="result-section">
        <h3 className="result-section-title">선택하신 증상</h3>
        <div className="symptom-list">
          {selectedSymptoms && selectedSymptoms.length > 0 ? (
            selectedSymptoms.map((symptom, index) => (
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
            <p className="no-data">표시할 증상 정보가 없습니다.</p>
          )}
        </div>
      </section>

      {/* 2. 추천 진료과 리스트 (수정된 부분) */}
      <section className="result-section">
        <h3 className="result-section-title">추천 진료과 (AI 분석)</h3>
        
        {/* 데이터가 있을 때만 렌더링 */}
        {depts && depts.length > 0 ? (
          <div className="recommendation-list">
            {depts.map((deptName, index) => (
              <div key={index} className="hospital-card" style={{borderColor: index === 0 ? '#228be6' : '#e5e7eb', borderWidth: index === 0 ? '2px' : '1px'}}>
                <div className="hospital-row-top">
                  <div className="hospital-top-left">
                    <h4 className="hospital-name" style={{fontSize: '1.2rem'}}>
                      {index + 1}순위: <span style={{color: '#228be6'}}>{deptName}</span>
                    </h4>
                    <p className="hospital-type">회원님의 증상에 가장 적합한 진료과입니다.</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="recommendation-placeholder">
            <p>추천할 수 있는 진료과를 찾지 못했습니다.</p>
          </div>
        )}
      </section>

      {/* 3. 병원 추천 컴포넌트 연동 */}
      {/* HospitalRecommendSection 컴포넌트가 '검색어(dept)'를 받아서 
         지도를 띄우도록 설계되어 있다고 가정하고, 1순위 진료과를 넘겨줍니다. 
      */}
      {depts && depts.length > 0 && (
        <HospitalRecommendSection 
          searchKeyword={depts[0]} // 가장 추천하는(0번) 진료과 전달
          resultData={resultData} 
        />
      )}
    </div>
  );
}