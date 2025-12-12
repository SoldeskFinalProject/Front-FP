import { useState } from "react";
import "./DrugSearch.css";

export default function DrugSearch({ onSearch }) {
  const [keyword, setKeyword] = useState("");

  const handleSearchClick = () => {
    // 검색어가 없거나 공백만 있을 경우 무시
    if (!keyword.trim()) {
        alert("검색어를 입력해주세요.");
        return;
    }
    
    // 부모 컴포넌트(Dictionary.jsx)에게 검색어 전달
    if (onSearch) {
        onSearch(keyword.trim());
    }
  };

  // 엔터키 입력 시 검색 실행
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        handleSearchClick();
    }
  };

  return (
    <div className="drug-search"> 
      <div className="search-bar">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="검색하실 약품명을 입력하세요."
        />
        <button onClick={handleSearchClick}>검색</button>
      </div>
    </div>
  );
}