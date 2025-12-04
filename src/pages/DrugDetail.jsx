// src/pages/DrugDetail.jsx
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDrugDetail } from '../api/drugAPI';
import "./DrugDetail.css";

/**
 * 백엔드에서 오는 HTML을 표 구조 & 스타일링이 잘 되도록 정규화하는 함수
 */
function normalizeHtmlContent(rawHtml) {
  if (!rawHtml) return "";

  let html = rawHtml;

  // 1) 인라인 스타일/width/height 제거 (프론트 CSS로 통일)
  html = html
    .replace(/\swidth="[^"]*"/gi, "")
    .replace(/\sheight="[^"]*"/gi, "")
    .replace(/\sstyle="[^"]*"/gi, "");

  // 2) 각 <tbody>...</tbody> 를 개별 <table>로 감싸기
  //    → 설명 텍스트(문장)와 h4 제목 등은 그대로 바깥에 남고,
  //      테이블 부분만 표로 렌더링됨
  html = html.replace(
    /<tbody[^>]*>([\s\S]*?)<\/tbody>/gi,
    (match, inner) => `<table class="drug-html-table"><tbody>${inner}</tbody></table>`
  );

  // 3) (선택) 필요하면 여기서 \n -> <br> 치환도 가능하지만
  //     이미 CSS에 white-space: pre-line; 을 쓰고 있으므로 생략

  return html;
}

export default function DrugDetail() {
  const { itemSeq } = useParams();
  const navigate = useNavigate();
  const [drug, setDrug] = useState(null);
  const [loading, setLoading] = useState(true);

  // 목차(TOC) 관리를 위한 상태
  const [toc, setToc] = useState([]);
  const [activeId, setActiveId] = useState("");

  // 각 섹션으로 이동하기 위한 Refs (지금은 필요 없어도 확장성 위해 남겨둠)
  const sectionRefs = useRef({});

  useEffect(() => {
    const loadDetail = async () => {
      try {
        const data = await fetchDrugDetail(itemSeq);
        setDrug(data);

        // 데이터가 로드되면 목차 생성
        const newToc = [];
        if (data.efcyQesitm) newToc.push({ id: "efcy", label: "효능·효과" });
        if (data.useMethodQesitm) newToc.push({ id: "usage", label: "용법·용량" });
        if (data.atpnQesitm) newToc.push({ id: "attention", label: "사용상 주의사항" });
        if (data.depositMethodQesitm) newToc.push({ id: "deposit", label: "보관 방법" });

        setToc(newToc);
      } catch (error) {
        console.error(error);
        alert("약품 정보를 불러오는데 실패했습니다.");
        navigate("/dictionary");
      } finally {
        setLoading(false);
      }
    };

    if (itemSeq) loadDetail();
  }, [itemSeq, navigate]);

  // 스크롤 이동 함수
  const scrollToSection = (id) => {
    setActiveId(id);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  if (loading) return <div className="loading-container">로딩 중...</div>;
  if (!drug) return null;

  return (
    <div className="drug-detail-container">
      {/* 1. 상단 헤더 */}
      <div className="detail-header">
        <div className="detail-img-box">
          {drug.itemImage ? (
            <img src={drug.itemImage} alt={drug.itemName} />
          ) : (
            <div className="no-img">이미지 없음</div>
          )}
        </div>
        <div className="detail-title-box">
          <span className="badge-company">{drug.entpName}</span>
          <h1 className="drug-name">{drug.itemName}</h1>
          <p className="drug-code">품목기준코드: {drug.itemSeq}</p>
        </div>
      </div>

      {/* 2. 목차 (네비게이션 바) */}
      {toc.length > 0 && (
        <nav className="drug-toc-nav">
          {toc.map((item) => (
            <button
              key={item.id}
              className={`toc-btn ${activeId === item.id ? "active" : ""}`}
              onClick={() => scrollToSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}

      <div className="detail-body">
        {/* 3. 각 섹션 렌더링 (dangerouslySetInnerHTML 사용) */}

        {drug.efcyQesitm && (
          <section id="efcy" className="info-section">
            <h3 className="section-title">효능 · 효과</h3>
            <div
              className="drug-html-content"
              dangerouslySetInnerHTML={{
                __html: normalizeHtmlContent(drug.efcyQesitm),
              }}
            />
          </section>
        )}

        {drug.useMethodQesitm && (
          <section id="usage" className="info-section">
            <h3 className="section-title">용법 · 용량</h3>
            <div
              className="drug-html-content"
              dangerouslySetInnerHTML={{
                __html: normalizeHtmlContent(drug.useMethodQesitm),
              }}
            />
          </section>
        )}

        {drug.atpnQesitm && (
          <section id="attention" className="info-section">
            <h3 className="section-title">사용상 주의사항</h3>
            <div
              className="drug-html-content"
              dangerouslySetInnerHTML={{
                __html: normalizeHtmlContent(drug.atpnQesitm),
              }}
            />
          </section>
        )}

        {drug.depositMethodQesitm && (
          <section id="deposit" className="info-section">
            <h3 className="section-title">보관 방법</h3>
            <div
              className="drug-html-content"
              dangerouslySetInnerHTML={{
                __html: normalizeHtmlContent(drug.depositMethodQesitm),
              }}
            />
          </section>
        )}
      </div>
    </div>
  );
}
