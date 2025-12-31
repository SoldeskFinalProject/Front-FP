import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDiseaseDetail } from '../api/diseaseAPI';
import "./DiseaseDetail.css"; 

export default function DiseaseDetail() {
  const { diseaseId } = useParams();
  const navigate = useNavigate();
  const [disease, setDisease] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [toc, setToc] = useState([]);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const loadDetail = async () => {
      try {
        const data = await fetchDiseaseDetail(diseaseId);
        setDisease(data);

        //목차 생성 로직 
        const newToc = [];
        if (data.definition) newToc.push({ id: "def", label: "정의" });
        if (data.cause) newToc.push({ id: "cause", label: "원인" });
        if (data.clinicalSymptoms) newToc.push({ id: "symptom", label: "증상" });
        if (data.diagnosis) newToc.push({ id: "diag", label: "진단" });
        if (data.treatment) newToc.push({ id: "treat", label: "치료" });
        if (data.faq) newToc.push({ id: "faq", label: "FAQ" });
        setToc(newToc);

      } catch (error) {
        console.error(error);
        alert("질병 정보를 불러오는데 실패했습니다.");
        navigate('/disease');
      } finally {
        setLoading(false);
      }
    };
    if (diseaseId) loadDetail();
  }, [diseaseId, navigate]);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; 
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const getFaqList = (faqData) => {
    if (!faqData) return [];
    if (Array.isArray(faqData)) return faqData;
    try {
      return JSON.parse(faqData);
    } catch (e) {
      console.e("실패", e)
      return [];
    }
    
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>로딩 중...</div>;
  if (!disease) return null;

  const faqList = getFaqList(disease.faq);

  // [추가] 증상 태그 문자열을 배열로 변환 ("두통,발열" -> ["두통", "발열"])
  const tags = disease.symptomTags ? disease.symptomTags.split(',') : [];

  return (
    <div className="disease-container">
      
      {/* 1. 상단 헤더 영역 */}
      <header className="disease-header">
        <span className="disease-category-badge">{disease.category}</span>
        <h1 className="disease-title">{disease.diseaseName}</h1>
        
        <div className="disease-meta-info">
          <div className="disease-meta-item">
            <span className="disease-meta-label">진료과</span>
            <span>{disease.department}</span>
          </div>
          {disease.synonyms && (
             <div className="disease-meta-item">
                <span className="disease-meta-label">관련어</span>
                <span>{disease.synonyms}</span>
             </div>
          )}
        </div>

        {/* [신규 기능] 증상 태그 영역 */}
        {tags.length > 0 && (
          <div className="disease-tags-wrapper">
            {tags.map((tag, index) => (
              <span key={index} className="disease-tag-item">
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* 2. 목차 (기존 동일) */}
      {toc.length > 0 && (
        <nav className="disease-toc-nav">
          {toc.map((item) => (
            <button
              key={item.id}
              className={`toc-chip ${activeSection === item.id ? "active" : ""}`}
              onClick={() => scrollToSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}

      {/* 3. 본문 내용 (기존 동일) */}
      <div className="disease-body">
        {disease.definition && (
          <section id="def" className="disease-section">
            <h3 className="disease-section-title">정의</h3>
            <div className="disease-html-content">{disease.definition}</div>
          </section>
        )}
        
        {/* ... (나머지 섹션들은 기존 코드 그대로 유지) ... */}
        {disease.cause && (
          <section id="cause" className="disease-section">
            <h3 className="disease-section-title">원인</h3>
            <div className="disease-html-content">{disease.cause}</div>
          </section>
        )}

        {disease.clinicalSymptoms && (
          <section id="symptom" className="disease-section">
            <h3 className="disease-section-title">증상</h3>
            <div 
              className="disease-html-content"
              dangerouslySetInnerHTML={{ __html: disease.clinicalSymptoms }} 
            />
          </section>
        )}

        {disease.diagnosis && (
          <section id="diag" className="disease-section">
            <h3 className="disease-section-title">진단</h3>
            <div 
              className="disease-html-content"
              dangerouslySetInnerHTML={{ __html: disease.diagnosis }} 
            />
          </section>
        )}

        {disease.treatment && (
          <section id="treat" className="disease-section">
            <h3 className="disease-section-title">치료</h3>
            <div 
              className="disease-html-content"
              dangerouslySetInnerHTML={{ __html: disease.treatment }} 
            />
          </section>
        )}

        {faqList.length > 0 && (
          <section id="faq" className="disease-section">
            <h3 className="disease-section-title">자주 하는 질문 (FAQ)</h3>
            <div className="disease-html-content">
              {faqList.map((item, index) => (
                <div key={index} className="faq-box">
                  <div className="faq-q">Q. {item.q}</div>
                  <div className="faq-a">A. {item.a}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}