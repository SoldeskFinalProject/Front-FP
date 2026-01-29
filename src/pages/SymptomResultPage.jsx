"use client";

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { searchHospitals } from "../api/hospitalApi";
import HospitalCard from "../components/hospital/HospitalCard";
import "./SymptomResultPage.css";

export default function SymptomResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [resultData, setResultData] = useState(null);
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [userId, setUserId] = useState(null);

  // ✅ 병원 검색 관련 상태 추가
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myLocation, setMyLocation] = useState({ lat: null, lng: null });

  // 1. 초기 데이터 및 유저 정보 로드
  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      const user = JSON.parse(userJson);
      setUserId(user.userId || user.id);
    }

    if (location.state) {
      setResultData(location.state);
      // 첫 번째 추천 진료과 자동 선택
      if (location.state.depts && location.state.depts.length > 0) {
        setSelectedDepts([location.state.depts[0]]);
      }
    } else {
      alert("잘못된 접근입니다. 증상 선택 페이지로 이동합니다.");
      navigate("/symptom");
    }

    // 내 위치 가져오기 (거리순 정렬용)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMyLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log("위치 권한 없음:", error)
      );
    }
  }, [location, navigate]);

  // 2. 진료과가 변경되면 병원 목록 다시 불러오기
  useEffect(() => {
    const loadHospitals = async () => {
      if (selectedDepts.length === 0) {
        setHospitals([]);
        return;
      }

      setLoading(true);
      try {
        // 선택된 진료과 중 첫 번째 키워드로 검색
        const deptKeyword = selectedDepts[0];
        
        const data = await searchHospitals({
          deptName: deptKeyword,
          lat: myLocation.lat,
          lng: myLocation.lng,
          userId: userId,
          page: 0,
          size: 10 // 결과 페이지에서는 10개 정도만 보여줌
        });

        setHospitals(data.content || []);
      } catch (error) {
        console.error("병원 추천 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHospitals();
  }, [selectedDepts, myLocation.lat, myLocation.lng, userId]);

  const handleDeptToggle = (deptName) => {
    // 다중 선택보다는 탭처럼 하나씩 전환하는 UX가 추천 결과에 더 적합
    setSelectedDepts([deptName]);
  };

  if (!resultData) return <div className="loading">결과 분석 데이터를 불러오는 중...</div>;

  const { depts, selectedSymptoms } = resultData;
  const isPediatricsChecked = selectedDepts.includes("소아청소년과");

  // 상위 3개 진료과만 표시 (소아과 제외 로직 포함)
  const visibleDepts = depts
    ? depts.filter(dept => dept !== "소아청소년과").slice(0, 3)
    : [];

  return (
    <div className="result-page-container">
      <header className="result-header">
        <h2 className="result-title">증상 분석 결과</h2>
        <button className="back-btn" onClick={() => navigate(-1)}>다시 선택하기</button>
      </header>

      {/* 섹션 1: 선택한 증상 */}
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

      {/* 섹션 2: AI 추천 진료과 */}
      <section className="result-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 className="result-section-title" style={{ marginBottom: 0 }}>추천 진료과 (AI 분석)</h3>
          <label className="pediatrics-toggle" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={isPediatricsChecked}
              onChange={() => handleDeptToggle("소아청소년과")}
            />
            🧸 소아청소년과 보기
          </label>
        </div>
        
        <div className="recommendation-list">
          {visibleDepts.map((deptName, index) => {
            const isChecked = selectedDepts.includes(deptName);
            return (
              <div 
                key={index} 
                className="hospital-card" // 이 클래스는 카드 모양 잡는 용도 (SymptomResultPage.css에 정의됨)
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

      {/* 섹션 3: 추천 병원 리스트 (세로 정렬 적용) */}
      <section className="result-section">
        <h3 className="result-section-title">
          추천 병원 {selectedDepts.length > 0 ? `(${selectedDepts[0]})` : ""}
        </h3>

        {/* ✅ [핵심 변경] className="symptom-hospital-list" 적용 (Grid 해제, 세로 정렬) */}
        <div className="symptom-hospital-list">
          {loading ? (
            <div className="loading-state" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
              추천 병원을 불러오는 중... 🏥
            </div>
          ) : hospitals.length > 0 ? (
            hospitals.map((hospital) => (
              <HospitalCard key={hospital.hospitalId} hospital={hospital} />
            ))
          ) : (
             <div className="empty-state" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
               {selectedDepts.length > 0 
                 ? "근처에 해당 진료과 병원이 없습니다." 
                 : "진료과를 선택하면 병원을 추천해 드립니다."}
             </div>
          )}
        </div>
      </section>
    </div>
  );
}