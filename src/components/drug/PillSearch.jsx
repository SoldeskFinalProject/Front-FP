import { useState } from "react";
import "./PillSearch.css";

// 필터 옵션 상수 데이터
const SHAPES = ["원형", "타원형", "장방형", "반원형", "삼각형", "사각형", "마름모", "오각형", "육각형", "팔각형"];
const COLORS = ["하양", "노랑", "주황", "분홍", "빨강", "갈색", "연두", "초록", "청록", "파랑", "남색", "자주", "보라", "회색", "검정"];
const FORMULATIONS = ["정제", "경질캡슐", "연질캡슐"];
const LINES = ["없음", "-", "+", "기타"];

export default function PillSearch({ onSearch }) {
  // 검색 조건 상태
  const [filters, setFilters] = useState({
    shape: "",
    color: "",
    formulation: "",
    line: "",
    print: "" // 식별문자
  });

  // 버튼 클릭 핸들러 (토글 방식: 이미 선택된거 누르면 해제)
  const handleFilterClick = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? "" : value
    }));
  };

  const handleInputChange = (e) => {
    setFilters(prev => ({ ...prev, print: e.target.value }));
  };

  const handleSearchClick = () => {
    // 모든 값이 비어있으면 경고
    const isAllEmpty = Object.values(filters).every(val => val === "");
    if (isAllEmpty) {
        alert("적어도 하나의 조건을 선택하거나 입력해주세요.");
        return;
    }
    onSearch(filters);
  };

  // 필터 섹션 렌더링 헬퍼
  const renderFilterSection = (title, key, options) => (
    <div className="filter-section">
      <h4 className="filter-title">{title}</h4>
      <div className="filter-options">
        {options.map(option => (
          <button
            key={option}
            className={`filter-btn ${filters[key] === option ? "active" : ""}`}
            onClick={() => handleFilterClick(key, option)}
          >
            {/* 색상 버튼일 경우 동그라미 아이콘 표시 (선택사항) */}
            {key === 'color' && <span className={`color-dot ${option}`} />} 
            {option}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="pill-search-container">
      <div className="pill-search-filters">
        {renderFilterSection("모양", "shape", SHAPES)}
        {renderFilterSection("색상", "color", COLORS)}
        {renderFilterSection("제형", "formulation", FORMULATIONS)}
        {renderFilterSection("분할선", "line", LINES)}
        
        <div className="filter-section">
            <h4 className="filter-title">식별 문자</h4>
            <input 
                type="text" 
                className="print-input"
                placeholder="약에 적힌 문자 입력 (예: LOX)"
                value={filters.print}
                onChange={handleInputChange}
            />
        </div>
      </div>
      
      <div className="search-action">
        <button className="search-btn-large" onClick={handleSearchClick}>
            🔍 조건으로 검색하기
        </button>
      </div>
    </div>
  );
}