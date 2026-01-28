import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCategories, getRecommendation } from "../api/symptomAPI";
import { predictSymptom, predictImageSymptom } from "../api/aiAPI";
import "./SymptomPage.css";

export default function SymptomPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // 상태 관리
  const [categories, setCategories] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  // AI 검색/이미지 분석 상태
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiDetectedSymptoms, setAiDetectedSymptoms] = useState([]);
  const [tempSelectedIds, setTempSelectedIds] = useState([]);

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

  const handleCheck = (symptomId) => {
    setSelectedIds((prev) =>
      prev.includes(symptomId) ? prev.filter((id) => id !== symptomId) : [...prev, symptomId]
    );
  };

  // 🤖 공통: AI 결과 처리 로직 (분리된 UI 매칭)
  const processAiResult = (symptomIds) => {
    const detectedDetails = [];
    symptomIds.forEach((id) => {
      categories.forEach((cat) => {
        const found = (cat.symptoms || []).find((s) => s.symptomId === id);
        if (found) {
          detectedDetails.push({ ...found, categoryName: cat.categoryName });
        }
      });
    });

    if (detectedDetails.length === 0) {
      alert("분석된 증상이 현재 시스템의 증상 목록과 일치하지 않습니다.");
      return;
    }

    setAiDetectedSymptoms(detectedDetails);
    setTempSelectedIds([]); 
    setIsModalOpen(true);
  };

  // 📝 1. 텍스트 검색 핸들러
  const handleAiSearch = async () => {
    if (!aiInput.trim()) return alert("증상을 문장으로 설명해주세요!");
    setAiLoading(true);
    try {
      const result = await predictSymptom(aiInput);
      if (result.status === "success" && result.symptom_ids.length > 0) {
        processAiResult(result.symptom_ids);
      } else {
        alert("관련된 증상을 찾을 수 없습니다. 조금 더 구체적으로 묘사해 주세요.");
      }
    } catch (error) {
      console.error(error);
      alert("AI 분석 중 오류가 발생했습니다.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAiSearch();
  };

  // 📸 2. 이미지 검색 핸들러 (수정본)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAiLoading(true);
    try {
      const result = await predictImageSymptom(file);
      
      if (result.status === "success") {
        if (result.type === "action") {
          // ✅ 불필요한 Alert 제거 후 즉시 모달 팝업
          processAiResult(result.symptom_ids);
        } else if (result.type === "info") {
          alert(result.message || "의료와 관련된 이미지가 아닙니다.");
        }
      } else {
        alert("이미지 분석에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("서버 오류가 발생했습니다.");
    } finally {
      setAiLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  // 모달 핸들러
  const handleTempCheck = (id) => {
    setTempSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  const confirmAiSelection = () => {
    const finalSelection = [...new Set([...selectedIds, ...tempSelectedIds])];
    setSelectedIds(finalSelection);
    setIsModalOpen(false);
    setAiInput("");
  };

  // 최종 제출
  const handleSubmit = async () => {
    if (selectedIds.length === 0) return alert("증상을 선택해주세요.");
    setLoading(true);
    try {
      const recommendedDepts = await getRecommendation(selectedIds);
      if (recommendedDepts && recommendedDepts.length > 0) {
        const selectedSymptomDetails = [];
        categories.forEach((cat) => {
          (cat.symptoms || []).forEach((sym) => {
            if (selectedIds.includes(sym.symptomId)) {
              selectedSymptomDetails.push({
                symptomName: sym.symptomName,
                categoryName: cat.categoryName,
              });
            }
          });
        });
        navigate("/result", {
          state: { depts: recommendedDepts, selectedSymptoms: selectedSymptomDetails },
        });
      } else {
        alert("일치하는 진료과를 찾지 못했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const activeCategory = categories.find((c) => c.categoryId === activeTabId);

  return (
    <div className="symptom-container">
      <div className="page-header">
        <h1 className="page-title">어디가 불편하신가요?</h1>
        <p className="page-subtitle">
          증상을 선택하거나 사진을 올리면 <span className="highlight">AI 닥터</span>가<br />
          적합한 진료과를 추천해 드려요.
        </p>
      </div>

      {/* 1. 텍스트 검색 영역 (카메라 아이콘 제거됨) */}
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
          <button className="ai-search-btn" onClick={handleAiSearch} disabled={aiLoading}>
            {aiLoading ? "분석 중.." : "검색"}
          </button>
        </div>
      </div>

      {/* 2. 이미지 검색 영역 (배너형 UI) */}
      <div className="ai-image-area">
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/*"
          onChange={handleImageUpload}
        />
        <button 
          className="ai-image-banner-btn" 
          onClick={triggerFileInput} 
          disabled={aiLoading}
        >
          <div className="banner-icon">{aiLoading ? "⏳" : "📷"}</div>
          <div className="banner-text">
            <span className="banner-title">사진으로 증상 찾기</span>
            <span className="banner-desc">사진으로 키워드를 찾아보세요.</span>
          </div>
          <div className="banner-arrow">→</div>
        </button>
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
            {(activeCategory.symptoms || []).map((symptom) => (
              <div
                key={symptom.symptomId}
                className={`symptom-item ${selectedIds.includes(symptom.symptomId) ? "checked" : ""}`}
                onClick={() => handleCheck(symptom.symptomId)}
              >
                <span className="symptom-name">{symptom.symptomName}</span>
                <input type="checkbox" checked={selectedIds.includes(symptom.symptomId)} readOnly />
              </div>
            ))}
          </div>
        ) : (
          <div className="loading-area">데이터를 불러오는 중입니다...</div>
        )}
      </div>

      <div className="action-area">
        {selectedIds.length > 0 && <span className="selected-count">{selectedIds.length}개 선택됨</span>}
        <button className="submit-btn" onClick={handleSubmit} disabled={loading || selectedIds.length === 0}>
          {loading ? "분석 중..." : "결과 보기"}
        </button>
      </div>

      {/* 모달 UI (기존 유지) */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>🤖 AI 분석 결과</h2>
            <p className="modal-desc">확인된 증상 중 해당하는 항목을 선택해 주세요.</p>
            <div className="result-list">
              {aiDetectedSymptoms.map((sym) => (
                <div
                  key={sym.symptomId}
                  className={`result-card ${tempSelectedIds.includes(sym.symptomId) ? "selected" : ""}`}
                  onClick={() => handleTempCheck(sym.symptomId)}
                >
                  <span className="rank-badge">{sym.categoryName}</span>
                  <span className="dept-name">{sym.symptomName}</span>
                  <input type="checkbox" checked={tempSelectedIds.includes(sym.symptomId)} readOnly />
                </div>
              ))}
            </div>
              <div className="modal-actions">
                <button 
                  className="modal-close-btn" 
                  onClick={() => setIsModalOpen(false)}
                >
                  취소
                </button>
                <button 
                  className="modal-submit-btn" 
                  onClick={confirmAiSelection}
                >
                  선택 완료 ({tempSelectedIds.length}개)
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}