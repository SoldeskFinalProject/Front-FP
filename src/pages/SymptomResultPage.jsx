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

  // ✅ 1. 데이터 초기화 및 유효성 검사
  useEffect(() => {
    if (location.state) {
      setResultData(location.state);
      
      // 초기값 설정: 1순위 진료과를 기본 선택 상태로 둡니다.
      if (location.state.depts && location.state.depts.length > 0) {
        setSelectedDepts([location.state.depts[0]]); 
      }
      console.log("[SymptomResultPage] 분석 데이터 로드 완료:", location.state);
    } else {
      alert("잘못된 접근입니다. 증상 선택 페이지로 이동합니다.");
      navigate("/symptom"); // 프로젝트 경로에 맞춰 수정 가능 (/search 등)
    }
  }, [location, navigate]);

  // ✅ 2. 진료과 토글 핸들러 (다중 선택 기능)
  const handleDeptToggle = (deptName) => {
    setSelectedDepts((prev) => {
      if (prev.includes(deptName)) {
        // 이미 선택된 경우 제거 (단, 최소 1개는 선택 유지하고 싶다면 조건 추가 가능)
        return prev.filter(d => d !== deptName);
      } else {
        // 선택되지 않은 경우 추가
        return [...prev, deptName];
      }
    });
  };

  if (!resultData) return <div className="loading">결과 분석 데이터를 불러오는 중...</div>;

  const { depts, selectedSymptoms } = resultData;
  const isPediatricsChecked = selectedDepts.includes("소아청소년과");

  // 일반 진료과 목록 (소아과 제외 상위 3개 추출)
  const visibleDepts = depts
    ? depts.filter(dept => dept !== "소아청소년과").slice(0, 3)
    : [];

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

      {/* 2. 추천 진료과 리스트 (다중 선택 UI) */}
      <section className="result-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 className="result-section-title" style={{ marginBottom: 0 }}>추천 진료과 (AI 분석)</h3>
          
          {/* ✅ 소아청소년과 포함 필터 (Toggle 스위치 형태) */}
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
          * 아래 진료과를 클릭하여 주변 병원을 검색해 보세요. (중복 선택 가능)
        </p>
        
        {visibleDepts.length > 0 ? (
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
                    backgroundColor: isChecked ? '#f8f9fa' : '#fff',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <div className="hospital-row-top" style={{ alignItems: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={isChecked} 
                      readOnly
                      style={{ transform: 'scale(1.3)', marginRight: '15px', accentColor: '#228be6' }}
                    />
                    <div className="hospital-top-left">
                      <h4 className="hospital-name" style={{fontSize: '1.1rem', marginBottom: '4px'}}>
                        {index + 1}순위: <span style={{color: '#228be6'}}>{deptName}</span>
                      </h4>
                      <p className="hospital-type" style={{fontSize: '0.9rem', color: '#888'}}>
                        {index === 0 ? "가장 추천드리는 전문 진료분야입니다." : "이 분야의 전문의 진료도 권장됩니다."}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="recommendation-placeholder">
            <p>분석된 추천 진료과 정보가 없습니다.</p>
          </div>
        )}
      </section>

      {/* 3. 병원 추천 컴포넌트 연동 */}
      {/* HospitalRecommendSection은 searchKeywords(배열)를 받아 
          해당되는 모든 진료과의 병원을 통합하여 보여줍니다. 
      */}
      {selectedDepts.length > 0 && (
        <HospitalRecommendSection 
          searchKeywords={selectedDepts} 
          resultData={resultData} 
        />
      )}
      
      {selectedDepts.length === 0 && (
        <div className="no-selection-notice" style={{textAlign: 'center', padding: '40px', color: '#999'}}>
          <p>상단에서 진료과를 선택하면 주변 병원을 추천해 드립니다.</p>
        </div>
      )}
    </div>
  );
}