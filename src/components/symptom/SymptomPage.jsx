import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { fetchCategories, getRecommendation } from "../api/symptomAPI";
import { predictSymptom } from "../api/aiAPI"; 
import "./SymptomPage.css"; 

export default function SymptomPage() {
  const navigate = useNavigate();

  // 상태 관리
  const [categories, setCategories] = useState([]); // 전체 데이터 (탭+증상)
  const [activeTabId, setActiveTabId] = useState(null); // 현재 활성화된 탭 ID
  const [selectedIds, setSelectedIds] = useState([]); // 선택된 증상 ID 리스트
  const [loading, setLoading] = useState(false); // 결과 분석 로딩

  // AI 검색창 상태 관리
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // 1. 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
        if (data && data.length > 0) {
          setActiveTabId(data[0].categoryId);
        }
      } catch (error) {
        console.error(error);
        alert("증상 데이터를 불러오는데 실패했습니다.");
      }
    };
    loadData();
  }, []);

  // 2. 탭 변경 핸들러
  const handleTabClick = (id) => setActiveTabId(id);

  // 3. 증상 체크박스 선택/해제 핸들러
  const handleCheck = (symptomId) => {
    setSelectedIds((prev) => 
      prev.includes(symptomId) ? prev.filter(id => id !== symptomId) : [...prev, symptomId]
    );
  };

  // 4. AI 증상 자동 감지 핸들러
  const handleAiSearch = async () => {
    if (!aiInput.trim()) return alert("증상을 문장으로 설명해주세요! (예: 배가 아파요)");

    setAiLoading(true);
    try {
      // AI 서버에 문장 전송
      const result = await predictSymptom(aiInput);
      
      if (result.status === "success" && result.symptom_ids.length > 0) {
        // 기존 선택된 ID들과 AI가 찾은 ID 합치기 (중복 제거)
        const newSelection = [...new Set([...selectedIds, ...result.symptom_ids])];
        
        setSelectedIds(newSelection);
        alert(`AI가 ${result.symptom_ids.length}개의 증상을 감지하여 선택했습니다! 🩺`);
        setAiInput(""); // 입력창 초기화
      } else {
        alert("AI가 적절한 증상을 찾지 못했습니다. 조금 더 구체적으로 적어주세요.");
      }
    } catch (error) {
      console.error(error);
      alert("AI 서버 연결에 실패했습니다.");
    } finally {
      setAiLoading(false);
    }
  };

  // 엔터키 입력 시 검색 실행
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAiSearch();
  };

  // 5. 결과 보기 버튼 핸들러 (API 호출 및 페이지 이동)
  const handleSubmit = async () => {
    if (selectedIds.length === 0) return alert("증상을 하나 이상 선택해주세요.");
    
    setLoading(true);
    try {
      const recommendedDepts = await getRecommendation(selectedIds);
      
      if (recommendedDepts && recommendedDepts.length > 0) {
        // 선택된 증상의 상세 정보(이름, 카테고리) 추출
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

        // 결과 페이지로 데이터 전달하며 이동
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
      alert("결과를 분석하는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 현재 활성화된 탭의 데이터 찾기
  const activeCategory = categories.find(c => c.categoryId === activeTabId);

  return (
    <div className="symptom-container">
      <div className="page-header">
        <h1 className="page-title">어디가 불편하신가요?!!!</h1>
        <p className="page-subtitle">
          증상을 선택하면 <span className="highlight">AI 닥터</span>가<br/>
          적합한 진료과를 추천해 드려요.
        </p>
      </div>

      {/* AI 자연어 검색창 영역 */}
      <div className="ai-search-area">
        <div className="ai-input-wrapper">
          <input 
            type="text" 
            className="ai-input"
            placeholder="예: 열이 나고 머리가 깨질 듯이 아파요 (AI 자동 선택)"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={aiLoading}
          />
          <button 
            className="ai-search-btn" 
            onClick={handleAiSearch}
            disabled={aiLoading}
          >
            {aiLoading ? "분석 중.." : "🤖 AI 감지"}
          </button>
        </div>
      </div>

      {/* 카테고리 탭 영역 */}
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

      {/* 증상 리스트 영역 */}
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
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(symptom.symptomId)} 
                    readOnly 
                  />
                </div>
              ))
            ) : (
              <div className="no-symptom-text">이 카테고리에는 등록된 증상이 없습니다.</div>
            )}
          </div>
        ) : (
          <div className="loading-area">로딩 중...</div>
        )}
      </div>

      {/* 하단 액션 영역 */}
      <div className="action-area">
        {selectedIds.length > 0 && (
          <span className="selected-count"><strong>{selectedIds.length}</strong>개의 증상이 선택됨</span>
        )}
        <button 
          className="submit-btn" 
          onClick={handleSubmit} 
          disabled={loading || selectedIds.length === 0}
        >
          {loading ? "분석 중..." : "결과 보기"}
        </button>
      </div>
    </div>
  );
}