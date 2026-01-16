import { useEffect, useState } from "react";
// 👇 [1. 추가] 페이지 이동 훅(useNavigate) 불러오기
import { useNavigate } from "react-router-dom"; 
import { fetchCategories, getRecommendation } from "../api/symptomAPI"; 
import "./SymptomPage.css"; 

export default function SymptomPage() {
  // 👇 [2. 추가] navigate 함수 생성 (이 줄이 없어서 에러가 난 겁니다!)
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]); 
  const [activeTabId, setActiveTabId] = useState(null); 
  const [selectedIds, setSelectedIds] = useState([]); 
  // results 상태는 페이지 이동하므로 삭제해도 되지만, 남겨둬도 상관없습니다.
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCategories();
        console.log("🔥 데이터 확인:", data);
        setCategories(data);
        
        if (data && data.length > 0) {
          setActiveTabId(data[0].categoryId);
        }
      } catch (error) {
        console.error(error);
        alert("데이터 로드 실패");
      }
    };
    loadData();
  }, []);

  const handleTabClick = (id) => setActiveTabId(id);

  const handleCheck = (symptomId) => {
    setSelectedIds((prev) => 
      prev.includes(symptomId) ? prev.filter(id => id !== symptomId) : [...prev, symptomId]
    );
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) return alert("증상을 선택해주세요.");

    setLoading(true);
    try {
      // 1. API 호출
      const recommendedDepts = await getRecommendation(selectedIds);
      console.log("🔥 추천 결과:", recommendedDepts);

      if (recommendedDepts && recommendedDepts.length > 0) {
        
        // 2. 결과 페이지로 넘길 데이터(증상 이름 등) 찾기
        const selectedSymptomDetails = [];
        categories.forEach(cat => {
          (cat.symptoms || []).forEach(sym => {
            if (selectedIds.includes(sym.symptomId)) {
              selectedSymptomDetails.push({
                symptomName: sym.symptomName,
                categoryName: cat.categoryName 
              });
            }
          });
        });

        // 3. 결과 페이지로 이동
        navigate('/result', { 
          state: { 
            depts: recommendedDepts,          
            selectedSymptoms: selectedSymptomDetails 
          } 
        });

      } else {
        alert("일치하는 진료과를 찾지 못했습니다.");
      }
    } catch (error) {
      console.error("분석 실패:", error);
      alert("분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const activeCategory = categories.find(c => c.categoryId === activeTabId);

  return (
    <div className="symptom-container">
      <div className="page-header">
        <h1 className="page-title">어디가 불편하신가요?</h1>
        <p className="page-subtitle">
          증상을 선택하면 <span className="highlight">AI 닥터</span>가<br/>
          적합한 진료과를 추천해 드려요.
        </p>
      </div>

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

      <div className="symptom-list-area">
        {activeCategory ? (
          <div className="symptom-grid">
            {(activeCategory.symptoms || []).length > 0 ? (
              activeCategory.symptoms.map((symptom) => (
                <div 
                  key={symptom.symptomId} 
                  className={`symptom-item ${selectedIds.includes(symptom.symptomId) ? "checked" : ""}`}
                  onClick={() => handleCheck(symptom.symptomId)}
                >
                  <span className="symptom-name">{symptom.symptomName}</span>
                  <input type="checkbox" checked={selectedIds.includes(symptom.symptomId)} readOnly />
                </div>
              ))
            ) : (
              <div className="no-symptom-text">
                이 카테고리에는 등록된 증상이 없습니다.<br/>
                관리자 페이지에서 증상을 추가해 주세요.
              </div>
            )}
          </div>
        ) : (
          <div className="loading-area">로딩 중...</div>
        )}
      </div>

      <div className="action-area">
        {selectedIds.length > 0 && (
          <span className="selected-count">{selectedIds.length}개의 증상이 선택됨</span>
        )}
        <button className="submit-btn" onClick={handleSubmit} disabled={loading || selectedIds.length === 0}>
          {loading ? "분석 중..." : "결과 보기"}
        </button>
      </div>
    </div>
  );
}