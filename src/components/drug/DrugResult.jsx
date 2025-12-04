import { Link } from 'react-router-dom';
import "./DrugResult.css";

export default function DrugResult({ drugData, currentPage, onPageChange }) {
  
  // 1. 데이터 로딩 전/검색 전 체크
  if (!drugData) return null;

  // 2. 데이터 구조 분해 (PageResponseDto 대응)
  // 백엔드가 비어있을 때 content가 null일 수도 있으므로 안전하게 처리
  const content = drugData.content || [];
  const totalPages = drugData.totalPages || 0;

  // 결과 없음 처리
  if (content.length === 0) {
    return (
      <div className="no-result">
        <p>검색 결과가 없습니다.</p>
        <span>철자를 확인하거나 다른 검색어를 입력해보세요.</span>
      </div>
    );
  }

  // --- 페이지네이션 계산 로직 ---
  const pageGroupSize = 5; // 한 번에 보여줄 페이지 개수 (1~5, 6~10)
  const currentGroup = Math.floor(currentPage / pageGroupSize);
  const startPage = currentGroup * pageGroupSize;
  const endPage = Math.min(startPage + pageGroupSize, totalPages);

  return (
    <div className="drug-result-container">
      
      {/* 리스트 영역 */}
      <div className="drug-result-list">
        {content.map((drug) => (
          <Link 
            // [핵심] 요청하신 경로: /dictionary/detail/{itemSeq}
            to={`/dictionary/detail/${drug.itemSeq}`} 
            key={drug.itemSeq} 
            className="drug-list-item"
          >
            <div className="drug-item-image-container">
              {drug.itemImage ? (
                <img src={drug.itemImage} alt={drug.itemName} className="drug-item-image" />
              ) : (
                <div className="drug-item-placeholder"><span>No Image</span></div>
              )}
            </div>
            <div className="drug-item-info">
              {/* 낱알 정보(DrugAppearance)와 기본 정보(Drug) 모두 itemName, entpName 필드를 가짐 */}
              <h4 className="drug-item-name">{drug.itemName}</h4>
              <p className="drug-item-entp">{drug.entpName}</p>
              
              {/* 낱알 검색 결과일 경우 식별 문자 등 추가 정보를 보여줄 수도 있음 (선택 사항) */}
              {drug.printFront && (
                 <span className="drug-print-info">식별: {drug.printFront}</span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* 페이지네이션 버튼 영역 */}
      {totalPages > 0 && (
        <div className="pagination">
          {/* 이전 그룹(<) 버튼: 첫 그룹(0~4페이지)이 아닐 때만 노출 */}
          <button 
            className="page-btn move-btn"
            disabled={currentPage === 0}
            onClick={() => onPageChange(currentPage - 1)}
          >
            &lt;
          </button>

          {/* 페이지 번호 버튼 */}
          {Array.from({ length: endPage - startPage }, (_, i) => {
            const pageNum = startPage + i;
            return (
              <button
                key={pageNum}
                className={`page-btn number-btn ${pageNum === currentPage ? "active" : ""}`}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum + 1}
              </button>
            );
          })}

          {/* 다음 그룹(>) 버튼: 마지막 페이지가 아닐 때만 노출 */}
          <button 
            className="page-btn move-btn"
            disabled={currentPage === totalPages - 1}
            onClick={() => onPageChange(currentPage + 1)}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
}