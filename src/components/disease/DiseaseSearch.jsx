import { useState, useEffect } from "react";
import { fetchCategories } from "../../api/diseaseAPI";
import "./DiseaseSearch.css";

export default function DiseaseSearch({ onSearch }) {
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체"); // 현재 선택된 카테고리
  const [categories, setCategories] = useState([]);

  // 초기 카테고리 목록 로드
  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchCategories();
      // 백엔드에서 온 목록 앞에 '전체' 추가
      setCategories(["전체", ...data]);
    };
    loadCategories();
  }, []);

  // 1. 검색어 입력 후 엔터/클릭 시 실행
  const handleSearchClick = () => {
    onSearch(keyword, selectedCategory);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearchClick();
  };

  // 2. 카테고리 버튼 클릭 시 실행 (즉시 검색)
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    onSearch(keyword, category); // 버튼 누르면 바로 필터링 적용
  };

  return (
    <div className="disease-search-container">
      
      {/* 상단: 검색바 영역 */}
      <div className="search-bar-wrapper">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="질병명, 증상 등을 입력해 보세요 (예: 감기)"
          className="disease-search-input"
        />
        <button onClick={handleSearchClick} className="disease-search-btn">
          🔍
        </button>
      </div>

      {/* 하단: 카테고리 태그(Chip) 영역 */}
      <div className="category-list-wrapper">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-chip ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => handleCategoryClick(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      
    </div>
  );
}