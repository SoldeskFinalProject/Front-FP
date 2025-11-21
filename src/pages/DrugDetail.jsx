import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDrugDetail } from '../api/drugAPI'; 
import "./DrugDetail.css"; 

export default function DrugDetail() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [drug, setDrug] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetail = async () => {
      try {
        // 백엔드 GET /api/drugs/{id} 호출
        const data = await fetchDrugDetail(id);
        setDrug(data);
      } catch (error) {
        console.error(error);
        alert("약품 정보를 불러오는데 실패했습니다.");
        navigate('/dictionary'); // 에러 시 목록으로 이동
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [id, navigate]);

  if (loading) return <div className="loading-container">로딩 중...</div>;
  if (!drug) return null;

  return (
    <div className="drug-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← 목록으로 돌아가기</button>
      
      {/* 상단 헤더: 이미지, 이름, 업체명 */}
      <div className="detail-header">
        <div className="detail-img-box">
          {drug.itemImage ? (
            <img src={drug.itemImage} alt={drug.itemName} />
          ) : (
            <div className="no-img">이미지 없음</div>
          )}
        </div>
        <div className="detail-title-box">
            {/* itemSeq는 필요하다면 표시, 아니면 숨김 */}
            <span className="drug-seq">품목코드: {drug.itemSeq}</span>
            <h1 className="drug-name">{drug.itemName}</h1>
            <p className="company-name">{drug.entpName}</p>
        </div>
      </div>

      <hr className="divider" />

      {/* 상세 정보 본문: DB 컬럼과 1:1 매핑 */}
      <div className="detail-body">
        
        {/* 1. 효능/효과 (efcyQesitm) */}
        {drug.efcyQesitm && (
          <section className="info-section">
            <h3>💊 효능 · 효과</h3>
            <p className="info-text">{drug.efcyQesitm}</p>
          </section>
        )}

        {/* 2. 용법/용량 (useMethodQesitm) */}
        {drug.useMethodQesitm && (
          <section className="info-section">
            <h3>📋 용법 · 용량</h3>
            <p className="info-text">{drug.useMethodQesitm}</p>
          </section>
        )}

        {/* 3. 경고 및 주의사항 (atpnWarnQesitm + atpnQesitm) */}
        {(drug.atpnWarnQesitm || drug.atpnQesitm) && (
          <section className="info-section warning-section">
            <h3>⚠️ 주의사항 및 경고</h3>
            {drug.atpnWarnQesitm && (
                <div className="warning-box">
                    <strong>[경고]</strong>
                    <p>{drug.atpnWarnQesitm}</p>
                </div>
            )}
            {drug.atpnQesitm && <p className="info-text">{drug.atpnQesitm}</p>}
          </section>
        )}

        {/* 4. 상호작용 (intrcQesitm) */}
        {drug.intrcQesitm && (
          <section className="info-section">
            <h3>🤝 상호작용</h3>
            <p className="info-text">{drug.intrcQesitm}</p>
          </section>
        )}

        {/* 5. 부작용 (seQesitm) */}
        {drug.seQesitm && (
          <section className="info-section side-effect-section">
            <h3>몸에 이상반응(부작용)이 나타날 경우</h3>
            <p className="info-text">{drug.seQesitm}</p>
          </section>
        )}

        {/* 6. 보관법 (depositMethodQesitm) */}
        {drug.depositMethodQesitm && (
          <section className="info-section">
            <h3>보관 방법</h3>
            <p className="info-text">{drug.depositMethodQesitm}</p>
          </section>
        )}

      </div>
    </div>
  );
}