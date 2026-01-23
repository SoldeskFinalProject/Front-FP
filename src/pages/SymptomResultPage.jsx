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
  // ✅ 추가: 로그인한 유저 ID 상태 관리
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // ✅ 1. 로컬 스토리지에서 유저 정보 로드
    const userJson = localStorage.getItem("user");
    if (userJson) {
      const user = JSON.parse(userJson);
      setUserId(user.userId || user.id); // DTO 구조에 따라 userId 또는 id 사용
    }

    if (location.state) {
      setResultData(location.state);
      if (location.state.depts && location.state.depts.length > 0) {
        setSelectedDepts([location.state.depts[0]]); 
      }
    } else {
      alert("잘못된 접근입니다. 증상 선택 페이지로 이동합니다.");
      navigate("/symptom");
    }
  }, [location, navigate]);

  const handleDeptToggle = (deptName) => {
    setSelectedDepts((prev) => {
      if (prev.includes(deptName)) {
        return prev.filter(d => d !== deptName);
      } else {
        return [...prev, deptName];
      }
    });
  };

  if (!resultData) return <div className="loading">결과 분석 데이터를 불러오는 중...</div>;

  const { depts, selectedSymptoms } = resultData;
  const isPediatricsChecked = selectedDepts.includes("소아청소년과");

  const visibleDepts = depts
    ? depts.filter(dept => dept !== "소아청소년과").slice(0, 3)
    : [];

  return (
    <div className="result-page-container">
      {/* ... (상단 헤더 및 증상 리스트 섹션은 동일) ... */}
      
      <header className="result-header">
        <h2 className="result-title">증상 분석 결과</h2>
        <button className="back-btn" onClick={() => navigate(-1)}>다시 선택하기</button>
      </header>

      <section className="result-section">
        <h3 className="result-section-title">선택하신 증상</h3>
        <div className="symptom-list">
          {selectedSymptoms?.map((symptom, index) => (
            <div key={index} className="symptom-item">
              <span className="symptom-name">{symptom.symptomName}</span>
              <span className="symptom-category">{symptom.categoryName}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="result-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 className="result-section-title" style={{ marginBottom: 0 }}>추천 진료과 (AI 분석)</h3>
          <label className="pediatrics-toggle" style={{ /* 기존 스타일 유지 */ }}>
            <input 
              type="checkbox" 
              checked={isPediatricsChecked}
              onChange={() => handleDeptToggle("소아청소년과")}
            />
            🧸 소아청소년과 포함
          </label>
        </div>
        
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
                  backgroundColor: isChecked ? '#f8f9fa' : '#fff',
                  borderWidth: isChecked ? '2px' : '1px',
                  cursor: 'pointer'
                }}
              >
                <input type="checkbox" checked={isChecked} readOnly />
                <span style={{marginLeft: '10px'}}>{index + 1}순위: {deptName}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ✅ 3. 병원 추천 컴포넌트에 userId 전달 */}
      {selectedDepts.length > 0 && (
        <HospitalRecommendSection 
          searchKeywords={selectedDepts} 
          resultData={resultData} 
          userId={userId} // 👈 이 userId가 전달되어야 합니다!
        />
      )}
      
      {selectedDepts.length === 0 && (
        <div className="no-selection-notice">
          <p>진료과를 선택하면 주변 병원을 추천해 드립니다.</p>
        </div>
      )}
    </div>
  );
}