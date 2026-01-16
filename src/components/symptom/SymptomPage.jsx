import { useEffect, useState } from "react";
import { fetchCategories, getRecommendation } from "../api/symptomAPI"; 
import "./SymptomPage.css"; 

export default function SymptomPage() {
  // 상태 관리
  const [categories, setCategories] = useState([]); // 전체 데이터 (탭+증상)
  const [activeTabId, setActiveTabId] = useState(null); // 현재 활성화된 탭 ID
  const [selectedIds, setSelectedIds] = useState([]); // 선택된 증상 ID 리스트 (예: [1, 3])
  const [results, setResults] = useState(null); // 추천 결과 (예: ["내과", "이비인후과"])
  const [loading, setLoading] = useState(false);

  // 1. 초기 데이터 로드 (컴포넌트 마운트 시)
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
        // 데이터가 있다면 첫 번째 탭을 기본 활성화
        if (data.length > 0) {
          setActiveTabId(data[0].categoryId);
        }
      } catch (error) {
        alert("증상 데이터를 불러오는데 실패했습니다.");
      }
    };
    loadData();
  }, []);

  // 2. 탭 변경 핸들러
  const handleTabClick = (id) => {
    setActiveTabId(id);
  };

  // 3. 체크박스 선택/해제 핸들러
  const handleCheck = (symptomId) => {
    setSelectedIds((prev) => {
      if (prev.includes(symptomId)) {
        // 이미 있으면 제거
        return prev.filter((id) => id !== symptomId);
      } else {
        // 없으면 추가
        return [...prev, symptomId];
      }
    });
  };

  // 4. 결과 보기 버튼 핸들러 (API 호출)
  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      alert("증상을 하나 이상 선택해주세요.");
      return;
    }

    setLoading(true);
    try {
      // 백엔드 API 호출: 선택된 ID 배열([1, 5])을 보냄
      const recommendedDepts = await getRecommendation(selectedIds);
      setResults(recommendedDepts); // 결과 저장 (모달 띄우기용)
    } catch (error) {
      alert("결과를 분석하는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 5. 병원 찾기 버튼 (지도 컴포넌트로 연결)
  const handleGoToMap = (deptName) => {
    // TODO: 동료가 만든 지도 페이지로 이동 (예: /map?dept=내과)
    alert(`'${deptName}' 관련 병원을 지도에서 찾습니다.\n(지도 페이지 연동 필요)`);
    // navigate(`/map?search=${deptName}`); 
  };

  // 현재 활성화된 탭의 데이터 찾기
  const activeCategory = categories.find(c => c.categoryId === activeTabId);

  return (
    <div className="symptom-container">
      <h1 className="page-title">증상을 선택해주세요</h1>
      <p className="page-subtitle">적합한 진료과를 추천해드립니다.</p>

      {/* A. 카테고리 탭 영역 */}
      <div className="tabs-container">
        {categories.map((cat) => (
          <button
            key={cat.categoryId}
            className={`tab-btn ${activeTabId === cat.categoryId ? "active" : ""}`}
            onClick={() => handleTabClick(cat.categoryId)}
          >
            {cat.categoryName}
          </button>
        ))}
      </div>

      {/* B. 증상 체크박스 리스트 영역 */}
      <div className="symptom-list-area">
        {activeCategory ? (
          <div className="symptom-grid">
            {activeCategory.symptoms.map((symptom) => (
              <label key={symptom.symptomId} className={`symptom-item ${selectedIds.includes(symptom.symptomId) ? "checked" : ""}`}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(symptom.symptomId)}
                  onChange={() => handleCheck(symptom.symptomId)}
                />
                <span className="symptom-name">{symptom.symptomName}</span>
              </label>
            ))}
          </div>
        ) : (
          <div className="loading-area">로딩 중...</div>
        )}
      </div>

      {/* C. 하단 결과 보기 버튼 */}
      <div className="action-area">
        <div className="selected-count">
          선택된 증상: <strong>{selectedIds.length}</strong>개
        </div>
        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "분석 중..." : "결과 보기"}
        </button>
      </div>

      {/* D. 결과 모달 (결과가 있을 때만 표시) */}
      {results && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>추천 진료과</h2>
            <p className="modal-desc">회원님의 증상을 분석한 결과입니다.</p>
            
            <div className="result-list">
              {results.length > 0 ? (
                results.map((dept, index) => (
                  <div key={index} className="result-card">
                    <span className="rank-badge">{index + 1}순위</span>
                    <h3 className="dept-name">{dept}</h3>
                    <button className="find-hospital-btn" onClick={() => handleGoToMap(dept)}>
                      주변 병원 찾기 &gt;
                    </button>
                  </div>
                ))
              ) : (
                <p>일치하는 진료과를 찾지 못했습니다.</p>
              )}
            </div>

            <button className="close-btn" onClick={() => setResults(null)}>
              다시 선택하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}