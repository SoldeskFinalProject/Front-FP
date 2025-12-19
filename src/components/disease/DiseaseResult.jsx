import { Link } from 'react-router-dom';
import "./DiseaseResult.css"; 

export default function DiseaseResult({ diseaseData, currentPage, onPageChange }) {
  
  if (!diseaseData) return null;

  const diseases = diseaseData.content || [];
  const totalPages = diseaseData.totalPages || 0;

  if (diseases.length === 0) {
    return (
      <div className="no-result-box" style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
        <p>검색 결과가 없습니다.</p>
      </div>
    );
  }

  const pageGroupSize = 5;
  const currentGroup = Math.floor(currentPage / pageGroupSize);
  const startPage = currentGroup * pageGroupSize;
  const endPage = Math.min(startPage + pageGroupSize, totalPages);

  return (
    <div className="disease-result-container">
      
      <div className="disease-card-grid">
        {diseases.map((disease) => {
          const realId = disease.diseaseId || disease.id;
          
          // 증상 태그 (최대 3개)
          const tags = disease.symptomTags 
            ? disease.symptomTags.split(',').slice(0, 3) 
            : [];

          return (
            <Link 
              to={realId ? `/disease/${realId}` : "#"} 
              key={realId} 
              className="disease-card"
            >
              {/* 상단: 아이콘 삭제됨 -> 바로 정보 표시 */}
              <div className="card-header">
                <span className="category-badge">{disease.category}</span>
                <h3 className="disease-name">{disease.diseaseName}</h3>
                <div className="disease-dept">{disease.department}</div>
              </div>

              {/* 중단: 정의 (요약) */}
              <p className="disease-desc">
                {disease.definition || "상세 정보가 없습니다."}
              </p>

              {/* 하단: 증상 태그 */}
              {tags.length > 0 && (
                <div className="card-tags">
                  {tags.map((tag, idx) => (
                    <span key={idx} className="tag-badge">#{tag.trim()}</span>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 0 && (
        <div className="pagination">
          <button 
            className="page-btn move-btn"
            disabled={currentPage === 0}
            onClick={() => onPageChange(currentPage - 1)}
          >
            &lt;
          </button>
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