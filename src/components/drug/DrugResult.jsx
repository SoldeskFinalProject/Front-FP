import { Link } from 'react-router-dom';
import "./DrugResult.css";

export default function DrugResult({ drugData, currentPage, onPageChange }) {
  
  // (1) 검색 전 (null)
  if (!drugData) {
    return <p className="result-info-text">검색어를 입력하고 검색 버튼을 눌러주세요.</p>;
  }
  
  // (2) 검색 결과 없음 (빈 배열 또는 content가 비었을 때)
  // drugData가 배열일 수도 있고 객체(content 포함)일 수도 있는 상황 모두 고려
  const drugs = Array.isArray(drugData) ? drugData : (drugData.content || []);
  
  if (drugs.length === 0) {
    return <p className="result-info-text">검색 결과가 없습니다.</p>;
  }

  // (3) 페이지네이션 로직
  // totalPages가 없으면 0으로 처리하여 버튼이 안 나오게 함
  const totalPages = drugData.totalPages || 0;
  const pageGroupSize = 5; // 한 번에 보여줄 페이지 번호 개수 (1~5, 6~10 ...)
  
  // 현재 페이지가 속한 그룹 계산 (0~4 -> 0번 그룹, 5~9 -> 1번 그룹)
  const currentGroup = Math.floor(currentPage / pageGroupSize);
  
  // 현재 그룹의 시작 페이지 번호와 끝 페이지 번호 계산
  const startPage = currentGroup * pageGroupSize;
  const endPage = Math.min(startPage + pageGroupSize, totalPages);

  return (
    <div className="drug-result-container">
      {/* --- 약품 목록 --- */}
      <div className="drug-result-list">
        {drugs.map(drug => (
          <Link 
            to={`/drug/${drug.id || drug.itemSeq}`} 
            key={drug.id || drug.itemSeq} 
            className="drug-list-item"
          >
            <div className="drug-item-image-container">
              {drug.itemImage ? (
                <img src={drug.itemImage} alt={drug.itemName} className="drug-item-image" />
              ) : (
                <div className="drug-item-placeholder"><span>이미지 없음</span></div>
              )}
            </div>
            <div className="drug-item-info">
              <h2 className="drug-item-name">{drug.itemName}</h2>
              <p className="drug-item-entp">{drug.entpName}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* --- 페이지네이션 버튼 --- */}
      {totalPages > 0 && (
        <div className="pagination">
          {/* [<<] 맨 처음으로 */}
          <button 
            className="page-btn move-btn"
            disabled={currentPage === 0}
            onClick={() => onPageChange(0)}
            title="맨 처음"
          >
            &lt;&lt;
          </button>

          {/* [<] 이전 그룹으로 (또는 이전 페이지로) */}
          <button 
            className="page-btn move-btn"
            disabled={currentPage === 0}
            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
            title="이전"
          >
            &lt;
          </button>

          {/* [1] [2] [3] [4] [5] 숫자 버튼 */}
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

          {/* [>] 다음 그룹으로 (또는 다음 페이지로) */}
          <button 
            className="page-btn move-btn"
            disabled={currentPage === totalPages - 1}
            onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
            title="다음"
          >
            &gt;
          </button>

          {/* [>>] 맨 끝으로 */}
          <button 
            className="page-btn move-btn"
            disabled={currentPage === totalPages - 1}
            onClick={() => onPageChange(totalPages - 1)}
            title="맨 끝"
          >
            &gt;&gt;
          </button>
        </div>
      )}
    </div>
  );
}