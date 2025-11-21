import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"; 
import DrugSearch from "../components/drug/DrugSearch"; 
import DrugResult from "../components/drug/DrugResult";
import { fetchDrugs } from "../api/drugAPI"; 
import "./Dictionary.css"; 

export default function Dictionary() {
  // URL의 ?keyword=...&page=... 값을 관리하는 훅
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [drugData, setDrugData] = useState(null);

  const keyword = searchParams.get("keyword") || "";

  // URL에서 가져올 때: 사용자는 1페이지로 보지만, 우리는 0으로 해석해야 함
  // "page"가 없으면 1로 간주 -> -1 해서 0으로 만듦
  const pageParam = searchParams.get("page") || "1";
  const page = parseInt(pageParam, 10) - 1;

  // URL이 바뀔 때마다 백엔드에 데이터 요청 (useEffect)
  useEffect(() => {
    if (!keyword) return; // 검색어 없으면 요청 안 함

    const fetchData = async () => {
      try {
        const data = await fetchDrugs(keyword, page, 10);
        setDrugData(data);
      } catch (error) {
        console.error(error);
        setDrugData({ content: [], totalPages: 0 });
      }
    };
    fetchData();
  }, [keyword, page]); // keyword나 page가 변하면 실행됨

  // 검색 버튼 클릭 시 -> URL만 변경 (useEffect가 감지해서 API 호출함)
  const handleSearch = (newKeyword) => {
    setSearchParams({ keyword: newKeyword, page: 1 });
  };

  // 페이지 클릭 시 -> URL만 변경
  const handlePageChange = (newPage) => {
    setSearchParams({ keyword, page: newPage +1});
  };

  return (
    <div className="dictionary-container">
      <h1>약품 백과사전</h1>
      <DrugSearch onSearch={handleSearch} />
      <DrugResult 
        drugData={drugData} 
        currentPage={page} // State 대신 URL의 page 값 사용
        onPageChange={handlePageChange}
      />
    </div>
  );
}