import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DrugSearch from "../components/drug/DrugSearch";
import PillSearch from "../components/drug/PillSearch"; // 신규 컴포넌트
import DrugResult from "../components/drug/DrugResult";
import { fetchDrugs, searchPills } from "../api/drugAPI"; // API 둘 다 가져옴
import "./Dictionary.css";

export default function Dictionary() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 탭 상태: 'name' | 'shape'
  // URL에 'tab' 파라미터가 있으면 그걸 쓰고, 없으면 'name'
  const activeTab = searchParams.get("tab") || "name";

  const [drugData, setDrugData] = useState(null);

  // URL 파라미터 읽기
  const page = parseInt(searchParams.get("page") || "1", 10) - 1;
  
  // 1. 이름 검색용 파라미터
  const keyword = searchParams.get("keyword") || "";

  // 2. 모양 검색용 파라미터 (JSON 문자열로 저장하거나, 각각 풀어서 저장)
  // 여기서는 URL 관리를 위해 개별 파라미터로 풉니다.
  const shape = searchParams.get("shape") || "";
  const color = searchParams.get("color") || "";
  const formulation = searchParams.get("formulation") || "";
  const line = searchParams.get("line") || "";
  const print = searchParams.get("print") || "";

  // 통합 데이터 로드 (useEffect)
  useEffect(() => {
    let ignore = false; // (1) 플래그 설정: "이 요청은 유효한가?"

    const fetchData = async () => {
      try {
        let data = null;
        
        if (activeTab === "name" && keyword) {
          data = await fetchDrugs(keyword, page, 10);
        } else if (activeTab === "shape") {
           // 모양 검색 조건이 하나라도 있을 때만 호출
           if (shape || color || formulation || line || print) {
             data = await searchPills({ shape, color, formulation, line, print }, page, 10);
           }
        }
        
        // (2) 요청이 끝났을 때, 컴포넌트가 여전히 이 요청의 결과를 기다리는지 확인
        if (!ignore && data) {
            setDrugData(data);
        }
        
      } catch (error) {
        if (!ignore) {
            setDrugData({ content: [], totalPages: 0 });
        }
      }
    };

    fetchData();

    // (3) 클린업 함수: 의존성 배열의 값이 바뀌어서 useEffect가 다시 실행되기 직전에 호출됨
    // 즉, 탭이 바뀌거나 검색어가 바뀌면 이전 요청을 '무시(ignore = true)' 처리함
    return () => {
        ignore = true;
    };

  }, [activeTab, page, keyword, shape, color, formulation, line, print]);

  // 탭 변경 핸들러
  const handleTabChange = (tabName) => {
    // 탭을 바꾸면 검색 조건 초기화
    setSearchParams({ tab: tabName, page: 1 });
    setDrugData(null);
  };

  // 이름 검색 핸들러
  const handleNameSearch = (newKeyword) => {
    setSearchParams({ tab: 'name', keyword: newKeyword, page: 1 });
  };

  // 모양 검색 핸들러 (PillSearch에서 호출)
  const handleShapeSearch = (filters) => {
    // filters 객체를 쿼리 파라미터로 변환
    setSearchParams({ 
        tab: 'shape', 
        page: 1,
        ...filters // shape, color, formulation, line, print가 들어감
    });
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    // 현재의 모든 검색 조건을 유지하면서 페이지 번호만 변경
    const currentParams = Object.fromEntries(searchParams);
    setSearchParams({ ...currentParams, page: newPage + 1 });
  };

  return (
    <div className="dictionary-container">
      <h1>약품 백과사전</h1>

      {/* 탭 버튼 */}
      <div className="dictionary-tabs">
        <button 
          className={`tab-btn ${activeTab === 'name' ? 'active' : ''}`}
          onClick={() => handleTabChange('name')}
        >
          이름으로 검색
        </button>
        <button 
          className={`tab-btn ${activeTab === 'shape' ? 'active' : ''}`}
          onClick={() => handleTabChange('shape')}
        >
          모양/색상 검색
        </button>
      </div>

      {/* 탭 내용 분기 */}
      <div className="tab-content">
        {activeTab === 'name' ? (
          <DrugSearch onSearch={handleNameSearch} />
        ) : (
          <PillSearch onSearch={handleShapeSearch} />
        )}

        {/* 결과 리스트 (공통 사용) */}
        <DrugResult 
            drugData={drugData} 
            currentPage={page}
            onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}