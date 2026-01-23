import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { fetchCategories, getRecommendation } from "../api/symptomAPI";
import { predictSymptom } from "../api/aiAPI";
import "./SymptomPage.css"; 

export default function SymptomPage() {
  const navigate = useNavigate();

  // 상태 관리
  const [categories, setCategories] = useState([]); 
  const [activeTabId, setActiveTabId] = useState(null); 
  const [selectedIds, setSelectedIds] = useState([]); 
  const [loading, setLoading] = useState(false); 

  // AI 검색창 상태
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // 🆕 모달(팝업) 관련 상태 추가
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiDetectedSymptoms, setAiDetectedSymptoms] = useState([]); // 팝업에 보여줄 증상 상세 정보
  const [tempSelectedIds, setTempSelectedIds] = useState([]); // 팝업 안에서만 쓰는 임시 선택 ID

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
        alert("데이터 로드 실패");
      }
    };
    loadData();
  }, []);

  const handleTabClick = (id) => setActiveTabId(id);

  // 메인 화면의 증상 체크박스
  const handleCheck = (symptomId) => {
    setSelectedIds((prev) => 
      prev.includes(symptomId) ? prev.filter(id => id !== symptomId) : [...prev, symptomId]
    );
  };

  // 🤖 AI 검색 핸들러 (모달 버전)
  const handleAiSearch = async () => {
    if (!aiInput.trim()) return alert("증상을 문장으로 설명해주세요!");

    setAiLoading(true);
    try {
      // 1. AI 서버 요청
      const result = await predictSymptom(aiInput);
      console.log("🤖 AI 결과:", result);

      if (result.status === "success" && result.symptom_ids.length > 0) {
        
        // 2. ID만으로는 화면에 보여줄 수 없으니, 전체 데이터에서 '이름'과 '카테고리'를 찾습니다.
        const detectedDetails = [];
        
        result.symptom_ids.forEach(id => {
          categories.forEach(cat => {
            const found = (cat.symptoms || []).find(s => s.symptomId === id);
            if (found) {
              detectedDetails.push({
                ...found,
                categoryName: cat.categoryName
              });
            }
          });
        });

        if (detectedDetails.length === 0) {
           alert("AI가 증상을 찾았으나, 화면에 표시할 데이터와 매칭되지 않습니다.");
           return;
        }

        // 3. 모달 띄우기 세팅
        setAiDetectedSymptoms(detectedDetails);
        // 초기 임시 선택은 빈 배열로
        setTempSelectedIds([]);
        setIsModalOpen(true); // 🚀 팝업 오픈!

      } else {
        alert("관련된 증상을 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("AI 분석 중 오류가 발생했습니다.");
    } finally {
      setAiLoading(false);
    }
  };

  // 엔터키 처리
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAiSearch();
  };

  // 🆕 모달 내부 체크박스 핸들러
  const handleTempCheck = (id) => {
    setTempSelectedIds(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  // 🆕 모달 [선택 완료] 버튼 클릭 시
  const confirmAiSelection = () => {
    // 기존 선택된 것 + 팝업에서 최종 선택한 것 합치기 (중복 제거)
    const finalSelection = [...new Set([...selectedIds, ...tempSelectedIds])];
    setSelectedIds(finalSelection);
    
    setIsModalOpen(false); // 팝업 닫기
    setAiInput(""); // 검색창 비우기
  };

  // 결과 보기 (페이지 이동)
  const handleSubmit = async () => {
    if (selectedIds.length === 0) return alert("증상을 선택해주세요.");
    setLoading(true);
    try {
      const recommendedDepts = await getRecommendation(selectedIds);
      if (recommendedDepts && recommendedDepts.length > 0) {
        
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

      {/* AI 검색창 */}
      <div className="ai-search-area">
        <div className="ai-input-wrapper">
          <input 
            type="text" 
            className="ai-input"
            placeholder="예: 머리가 아파요"
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
            {aiLoading ? "분석 중.." : "검색"}
          </button>
        </div>
      </div>

      {/* 탭 영역 */}
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

      {/* 증상 리스트 */}
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
              <div className="no-symptom-text">이 카테고리에는 등록된 증상이 없습니다.</div>
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

      {/* 🆕 AI 결과 확인 모달 (여기가 핵심입니다!) */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>
              🤖 AI 분석 결과
            </h2>
            <p className="modal-desc">
              회원님의 설명에서 다음 증상들이 감지되었습니다.<br/>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>
                맞는 항목을 체크한 뒤 '선택 완료'를 눌러주세요.
              </span>
            </p>

            <div className="result-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {aiDetectedSymptoms.map(sym => (
                <div 
                  key={sym.symptomId} 
                  className={`result-card ${tempSelectedIds.includes(sym.symptomId) ? 'selected' : ''}`}
                  onClick={() => handleTempCheck(sym.symptomId)}
                  style={{ 
                    cursor: 'pointer',
                    border: tempSelectedIds.includes(sym.symptomId) ? '2px solid #228be6' : '1px solid #ddd',
                    backgroundColor: tempSelectedIds.includes(sym.symptomId) ? '#e7f5ff' : '#fff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div>
                      <span className="rank-badge" style={{ background: '#868e96', fontSize: '0.7rem' }}>
                        {sym.categoryName}
                      </span>
                      <span className="dept-name" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                        {sym.symptomName}
                      </span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={tempSelectedIds.includes(sym.symptomId)} 
                      readOnly
                      style={{ transform: 'scale(1.3)', accentColor: '#228be6' }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                className="close-btn" 
                onClick={() => setIsModalOpen(false)}
                style={{ flex: 1, background: '#f1f3f5', padding: '12px', borderRadius: '8px', fontWeight: 'bold', border: 'none' }}
              >
                취소
              </button>
              <button 
                className="submit-btn" 
                onClick={confirmAiSelection}
                style={{ flex: 1, margin: 0 }}
              >
                선택 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}