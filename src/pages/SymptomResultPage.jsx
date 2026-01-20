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
  const [selectedDepts, setSelectedDepts] = useState([]);

  useEffect(() => {
    if (location.state) {
      setResultData(location.state);
      
      // 초기값: 1순위 진료과 자동 선택
      if (location.state.depts && location.state.depts.length > 0) {
        setSelectedDepts([location.state.depts[0]]); 
      }
    } else {
      alert("잘못된 접근입니다.");
      navigate("/symptom");
    }
  }, [location, navigate]);

  // ✅ [공통] 진료과 토글 핸들러
  const handleDeptToggle = (deptName) => {
    setSelectedDepts((prev) => {
      if (prev.includes(deptName)) {
        return prev.filter(d => d !== deptName);
      } else {
        return [...prev, deptName];
      }
    });
  };

  if (!resultData) return <div className="loading">로딩 중...</div>;

  const { depts, selectedSymptoms } = resultData;
  const isPediatricsChecked = selectedDepts.includes("소아청소년과");

  const visibleDepts = depts
    .filter(dept => dept !== "소아청소년과")
    .slice(0, 3);

  return (
    <div className="result-page-container">
      <header className="result-header">
        <h2 className="result-title">증상 분석 결과</h2>
        <button className="back-btn" onClick={() => navigate(-1)}>
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
                <span className="symptom-name">{symptom.symptomName}</span>
                <span className="symptom-category">{symptom.categoryName}</span>
              </div>
            ))
          ) : (
            <p className="no-data">표시할 증상 정보가 없습니다.</p>
          )}
        </div>
      </section>

      {/* 2. 추천 진료과 리스트 */}
      <section className="result-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 className="result-section-title" style={{ marginBottom: 0 }}>추천 진료과 (AI 분석)</h3>
          
          {/* ✅ [추가] 소아청소년과 포함 필터 (우측 상단 배치) */}
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            cursor: 'pointer',
            padding: '8px 12px',
            backgroundColor: isPediatricsChecked ? '#e7f5ff' : '#f8f9fa',
            borderRadius: '20px',
            border: isPediatricsChecked ? '1px solid #228be6' : '1px solid #e5e7eb',
            transition: 'all 0.2s',
            fontWeight: '600',
            fontSize: '14px',
            color: isPediatricsChecked ? '#228be6' : '#495057'
          }}>
            <input 
              type="checkbox" 
              checked={isPediatricsChecked}
              onChange={() => handleDeptToggle("소아청소년과")}
              style={{ accentColor: '#228be6', transform: 'scale(1.1)' }}
            />
            🧸 소아청소년과 포함
          </label>
        </div>

        <p style={{fontSize: '14px', color: '#666', marginBottom: '15px'}}>
          * 병원을 찾고 싶은 진료과를 선택해주세요 (다중 선택 가능)
        </p>
        
        {visibleDepts && visibleDepts.length > 0 ? (
          <div className="recommendation-list">
            {visibleDepts.map((deptName, index) => {
              const isChecked = selectedDepts.includes(deptName);
              
              return (
                <div 
                  key={index} 
                  className="hospital-card" 
                  onClick={() => handleDeptToggle(deptName)}
                  style={{
                    borderColor: isChecked ? '#228be6' : '#e5e7eb', 
                    borderWidth: isChecked ? '2px' : '1px',
                    cursor: 'pointer',
                    backgroundColor: isChecked ? '#f8f9fa' : '#fff'
                  }}
                >
                  <div className="hospital-row-top" style={{ alignItems: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={isChecked} 
                      readOnly
                      style={{ transform: 'scale(1.5)', marginRight: '15px', accentColor: '#228be6' }}
                    />
                    <div className="hospital-top-left">
                      <h4 className="hospital-name" style={{fontSize: '1.2rem'}}>
                        {index + 1}순위: <span style={{color: '#228be6'}}>{deptName}</span>
                      </h4>
                      <p className="hospital-type">
                        {index === 0 ? "가장 권장하는 진료과입니다." : "이 진료과에서도 진료 가능합니다."}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="recommendation-placeholder">
            <p>추천할 수 있는 진료과를 찾지 못했습니다.</p>
          </div>
        )}
      </section>

      {/* 3. 병원 추천 컴포넌트 */}
      {selectedDepts.length > 0 && (
        <HospitalRecommendSection 
          searchKeywords={selectedDepts} 
          resultData={resultData} 
        />
      )}
    </div>
  );
}