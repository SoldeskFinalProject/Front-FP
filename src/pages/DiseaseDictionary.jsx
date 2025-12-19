import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DiseaseSearch from "../components/disease/DiseaseSearch";
import DiseaseResult from "../components/disease/DiseaseResult";
import { fetchDiseases } from "../api/diseaseAPI";
import "./Dictionary.css"; // 기존 CSS 공유

export default function DiseaseDictionary() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [diseaseData, setDiseaseData] = useState(null);

  // URL 파라미터 읽기
  const page = parseInt(searchParams.get("page") || "1", 10) - 1;
  const keyword = searchParams.get("keyword") || "";
  const category = searchParams.get("category") || "전체";

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchDiseases(keyword, category, page, 10);
        setDiseaseData(data);
      } catch (error) {
        console.error(error);
        setDiseaseData({ content: [], totalPages: 0 });
      }
    };
    loadData();
  }, [page, keyword, category]);

  // 검색 핸들러
  const handleSearch = (newKeyword, newCategory) => {
    setSearchParams({ keyword: newKeyword, category: newCategory, page: 1 });
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    setSearchParams({ keyword, category, page: newPage + 1 });
  };

  return (
    <div className="dictionary-container">
      <h1>질병 백과사전</h1>
      <DiseaseSearch onSearch={handleSearch} />
      <DiseaseResult 
        diseaseData={diseaseData} 
        currentPage={page} 
        onPageChange={handlePageChange} 
      />
    </div>
  );
}