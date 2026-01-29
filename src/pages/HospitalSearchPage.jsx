import { useState, useEffect } from "react";
import { searchHospitals } from "../api/hospitalApi";
import HospitalCard from "../components/hospital/HospitalCard";
import { KOREA_REGIONS } from "../data/koreaRegions";
import "./HospitalSearchPage.css";

const DEPARTMENTS = [
  "전체", "내과", "소아청소년과", "이비인후과", "피부과", 
  "정형외과", "안과", "치과", "가정의학과", "산부인과", "비뇨기과",
  "신경과", "정신건강의학과", "외과", "응급의학과" 
];

export default function HospitalSearchPage() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);

  // 필터 상태
  const [selectedDept, setSelectedDept] = useState("전체");
  const [sido, setSido] = useState("전체");
  const [sigungu, setSigungu] = useState("전체");
  
  // ✅ [NEW] 상세 필터 & 정렬
  const [isSunday, setIsSunday] = useState(false);
  const [isHoliday, setIsHoliday] = useState(false);
  const [sortType, setSortType] = useState("distance"); // distance, review, name

  // 검색어
  const [inputText, setInputText] = useState("");
  const [searchText, setSearchText] = useState("");

  // 모달 & 위치
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [myLocation, setMyLocation] = useState({ lat: null, lng: null });
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  // 1. 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMyLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocationLoading(false);
        },
        (error) => {
          console.log("위치 권한 없음");
          setIsLocationLoading(false);
        }
      );
    } else {
      setIsLocationLoading(false);
    }
  }, []);

  // 2. 데이터 로드 (필터/정렬 변경 시 자동 재조회)
  useEffect(() => {
    if (isLocationLoading) return;

    const loadData = async () => {
      setLoading(true);
      const userId = localStorage.getItem('userId') || 1; 

      // 키워드 조합
      const keywords = [];
      if (sido !== "전체") keywords.push(sido);
      if (sigungu !== "전체") keywords.push(sigungu);
      if (selectedDept !== "전체") keywords.push(selectedDept);
      if (searchText) keywords.push(searchText);
      
      const finalKeyword = keywords.join(" ");

      try {
        const data = await searchHospitals({ 
          deptName: finalKeyword, 
          lat: myLocation.lat,
          lng: myLocation.lng,
          userId: userId,
          page: page,
          size: 9,
          // ✅ 추가된 파라미터 전송
          sunday: isSunday,
          holiday: isHoliday,
          sort: sortType
        });

        // 🚨 프론트엔드 임시 정렬 (백엔드 지원 전까지 "즐겨찾기순" 처리용)
        let content = data.content || [];
        if (sortType === "favorite") {
          content.sort((a, b) => (b.isFavorite === a.isFavorite ? 0 : b.isFavorite ? 1 : -1));
        }

        setHospitals(content);
        setTotalPages(data.totalPages || 0);
        
        if(page === 0) window.scrollTo({ top: 0, behavior: 'smooth' });

      } catch (error) {
        console.error("로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [
    selectedDept, sido, sigungu, searchText, 
    myLocation.lat, myLocation.lng, page, isLocationLoading,
    isSunday, isHoliday, sortType // ✅ 의존성 추가
  ]);

  // 핸들러
  const handleSearch = () => { setSearchText(inputText); setPage(0); };
  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearch(); };
  const handleResetLocation = () => { setSido("전체"); setSigungu("전체"); setPage(0); setIsLocationModalOpen(false); };
  const handleSelectSido = (val) => { setSido(val); setSigungu("전체"); };
  const handleSelectSigungu = (val) => { setSigungu(val); setPage(0); setIsLocationModalOpen(false); };
  const handleSelectDept = (val) => { setSelectedDept(val); setPage(0); setIsDeptModalOpen(false); };

  // 페이징 렌더링
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pageGroupSize = 5;
    const currentGroup = Math.floor(page / pageGroupSize);
    const startPage = currentGroup * pageGroupSize;
    const endPage = Math.min(startPage + pageGroupSize, totalPages);

    return (
      <div className="pagination">
        <button className="page-btn nav-btn" onClick={() => setPage(startPage - 1)} disabled={currentGroup === 0}>&lt;</button>
        {Array.from({ length: endPage - startPage }, (_, i) => (
          <button key={startPage + i} className={`page-btn ${page === startPage + i ? "active" : ""}`} onClick={() => setPage(startPage + i)}>
            {startPage + i + 1}
          </button>
        ))}
        <button className="page-btn nav-btn" onClick={() => setPage(endPage)} disabled={endPage >= totalPages}>&gt;</button>
      </div>
    );
  };

  return (
    <div className="hospital-search-page">
      <div className="search-header-group">
        <h1 className="page-title">병원 찾기</h1>
        
        <div className="search-toolbar">
          <div className="search-bar-container">
            <input 
              type="text" 
              className="search-input"
              placeholder="병원명 또는 지역(예: 강남) 검색"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="search-icon-btn" onClick={handleSearch}>🔍</button>
          </div>

          <div className="filter-group">
            <button className={`filter-trigger-btn ${sido !== "전체" ? "active" : ""}`} onClick={() => setIsLocationModalOpen(true)}>
              📍 {sido === "전체" ? "지역 선택" : `${sido} ${sigungu === "전체" ? "" : sigungu}`} ▾
            </button>
            <button className={`filter-trigger-btn ${selectedDept !== "전체" ? "active" : ""}`} onClick={() => setIsDeptModalOpen(true)}>
              🩺 {selectedDept === "전체" ? "진료과 전체" : selectedDept} ▾
            </button>
          </div>
        </div>

        {/* ✅ [NEW] 상세 필터 & 정렬 바 */}
        <div className="sub-filter-bar">
          <div className="checkbox-group">
            <label className={`filter-checkbox ${isSunday ? "checked" : ""}`}>
              <input type="checkbox" checked={isSunday} onChange={(e) => setIsSunday(e.target.checked)} />
              ☀️ 일요일 진료
            </label>
            <label className={`filter-checkbox ${isHoliday ? "checked" : ""}`}>
              <input type="checkbox" checked={isHoliday} onChange={(e) => setIsHoliday(e.target.checked)} />
              🔴 공휴일 진료
            </label>
          </div>

          <div className="sort-select-wrapper">
            <select 
              className="sort-select" 
              value={sortType} 
              onChange={(e) => setSortType(e.target.value)}
            >
              <option value="distance">📏 거리순</option>
              <option value="review">💬 리뷰 많은순</option>
              <option value="favorite">⭐ 즐겨찾기 우선</option>
            </select>
          </div>
        </div>
      </div>

      <div className="hospital-list">
        {(loading || isLocationLoading) ? (
          <div className="loading-state">
            {isLocationLoading ? "📍 위치 정보를 확인하고 있습니다..." : "데이터를 불러오는 중..."}
          </div>
        ) : hospitals.length > 0 ? (
          hospitals.map((hospital) => (
            <HospitalCard key={hospital.hospitalId} hospital={hospital} />
          ))
        ) : (
          <div className="empty-state">
             <p>조건에 맞는 병원이 없습니다.</p>
             <p className="sub-text">필터 조건을 변경해 보세요.</p>
          </div>
        )}
      </div>

      {!loading && !isLocationLoading && renderPagination()}

      {/* 모달 (기존 동일) */}
      {isLocationModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLocationModalOpen(false)}>
          <div className="modal-content location-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>지역 선택</h3>
              <button className="close-btn" onClick={() => setIsLocationModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <button className="current-location-btn" onClick={handleResetLocation}>🎯 내 주변 (현재 위치 기준)</button>
              <div className="location-split-view">
                <div className="location-col sido-col">
                  {Object.keys(KOREA_REGIONS).map((region) => (
                    <button key={region} className={`location-item ${sido === region ? "selected" : ""}`} onClick={() => handleSelectSido(region)}>{region}</button>
                  ))}
                </div>
                <div className="location-col sigungu-col">
                  {sido === "전체" ? <div className="guide-text">시/도를 먼저 선택해주세요.</div> : (
                    <>
                      <button className={`location-item ${sigungu === "전체" ? "selected" : ""}`} onClick={() => handleSelectSigungu("전체")}>전체</button>
                      {KOREA_REGIONS[sido].map((gu) => (
                        <button key={gu} className={`location-item ${sigungu === gu ? "selected" : ""}`} onClick={() => handleSelectSigungu(gu)}>{gu}</button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDeptModalOpen && (
        <div className="modal-overlay" onClick={() => setIsDeptModalOpen(false)}>
          <div className="modal-content dept-modal" onClick={(e) => e.stopPropagation()}>
             <div className="modal-header">
              <h3>진료과 선택</h3>
              <button className="close-btn" onClick={() => setIsDeptModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="dept-grid">
                {DEPARTMENTS.map((dept) => (
                  <button key={dept} className={`dept-grid-item ${selectedDept === dept ? "selected" : ""}`} onClick={() => handleSelectDept(dept)}>
                    {dept === "소아청소년과" ? "소아과" : dept}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}