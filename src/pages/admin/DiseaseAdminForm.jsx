import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createDisease, updateDisease, getAdminDiseaseDetail } from "../../api/diseaseAdminAPI";
import { fetchCategories } from "../../api/diseaseAPI";

// [보완] react-quill-new 라이브러리 및 스타일 적용
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
// [보완] 보안을 위한 DOMPurify 적용
import DOMPurify from "dompurify";

import "./DiseaseAdmin.css";

export default function DiseaseAdminForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    diseaseName: "",
    category: "기타",
    department: "",
    synonyms: "",
    definition: "",
    cause: "",
    clinicalSymptoms: "",
    diagnosis: "",
    treatment: "",
    course: "",
    precautions: "",
    symptomTags: "",
  });

  const [faqList, setFaqList] = useState([{ q: "", a: "" }]);

  // 에디터 툴바 구성 설정
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  }), []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error("카테고리 로드 실패", error);
      }
    };
    loadCategories();

    if (isEditMode) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const data = await getAdminDiseaseDetail(id);
      setFormData({
        diseaseName: data.diseaseName || "",
        category: data.category || "기타",
        department: data.department || "",
        synonyms: data.synonyms || "",
        definition: data.definition || "",
        cause: data.cause || "",
        clinicalSymptoms: data.clinicalSymptoms || "",
        diagnosis: data.diagnosis || "",
        treatment: data.treatment || "",
        course: data.course || "",
        precautions: data.precautions || "",
        symptomTags: data.symptomTags || "",
      });

      if (data.faq) {
        try {
          const parsedFaq = JSON.parse(data.faq);
          setFaqList(Array.isArray(parsedFaq) ? parsedFaq : []);
        } catch (e) {
          console.error("FAQ 파싱 에러", e);
          setFaqList([]);
        }
      }
    } catch (error) {
      console.error("상세 조회 에러:", error);
      alert("데이터 로드 실패");
      navigate("/admin/diseases");
    }
  };

  // 일반 입력 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // [보완] 에디터 전용 핸들러
  const handleEditorChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFaqChange = (index, field, value) => {
    const newFaq = [...faqList];
    newFaq[index][field] = value;
    setFaqList(newFaq);
  };

  const addFaq = () => setFaqList([...faqList, { q: "", a: "" }]);
  const removeFaq = (index) => setFaqList(faqList.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // [중요] 저장 전 HTML 태그 살균 처리 (XSS 방지)
    const sanitizedData = { 
      ...formData, 
      clinicalSymptoms: DOMPurify.sanitize(formData.clinicalSymptoms),
      diagnosis: DOMPurify.sanitize(formData.diagnosis),
      treatment: DOMPurify.sanitize(formData.treatment),
      course: DOMPurify.sanitize(formData.course),
      precautions: DOMPurify.sanitize(formData.precautions),
      faq: JSON.stringify(faqList) 
    };

    try {
      if (isEditMode) {
        await updateDisease(id, sanitizedData);
        alert("수정되었습니다.");
      } else {
        await createDisease(sanitizedData);
        alert("등록되었습니다.");
      }
      navigate("/admin/diseases");
    } catch (error) {
      alert("저장 실패: " + error.message);
    }
  };

  return (
    <div className="admin-container">
      <h1>{isEditMode ? "질병 수정" : "질병 등록"}</h1>
      
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-section">
          <h3>기본 정보</h3>
          <div className="form-group">
            <label>질병명 *</label>
            <input name="diseaseName" value={formData.diseaseName} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>카테고리 *</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="기타">선택하세요</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>진료과</label>
              <input name="department" value={formData.department} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>유의어 (쉼표 구분)</label>
            <input name="synonyms" value={formData.synonyms} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>증상 태그 (검색용)</label>
            <input name="symptomTags" value={formData.symptomTags} onChange={handleChange} />
          </div>
        </div>

        <div className="form-section">
          <h3>상세 내용</h3>
          
          <div className="form-group">
            <label>정의</label>
            <textarea name="definition" value={formData.definition} onChange={handleChange} rows={3} />
          </div>
          
          <div className="form-group">
            <label>원인</label>
            <textarea name="cause" value={formData.cause} onChange={handleChange} rows={3} />
          </div>

          {/* 에디터 적용 필드들 */}
          <div className="form-group editor-group">
            <label>임상 증상</label>
            <ReactQuill 
              theme="snow"
              modules={modules}
              value={formData.clinicalSymptoms} 
              onChange={(val) => handleEditorChange("clinicalSymptoms", val)} 
            />
          </div>

          <div className="form-group editor-group">
            <label>진단 방법</label>
            <ReactQuill 
              theme="snow"
              modules={modules}
              value={formData.diagnosis} 
              onChange={(val) => handleEditorChange("diagnosis", val)} 
            />
          </div>

          <div className="form-group editor-group">
            <label>치료 방법</label>
            <ReactQuill 
              theme="snow"
              modules={modules}
              value={formData.treatment} 
              onChange={(val) => handleEditorChange("treatment", val)} 
            />
          </div>

          <div className="form-group editor-group">
            <label>경과 및 합병증</label>
            <ReactQuill 
              theme="snow"
              modules={modules}
              value={formData.course} 
              onChange={(val) => handleEditorChange("course", val)} 
            />
          </div>

          {/* 👇 [추가] 예방 및 주의사항 입력창 */}
          <div className="form-group editor-group">
            <label>예방 및 주의사항</label>
            <ReactQuill 
              theme="snow"
              modules={modules}
              value={formData.precautions} 
              onChange={(val) => handleEditorChange("precautions", val)} 
            />
          </div>
        </div>

        <div className="form-section">
          <h3>자주 묻는 질문 (FAQ)</h3>
          {faqList.map((faq, index) => (
            <div key={index} className="faq-input-group">
              <div className="faq-header">
                <span>질문 {index + 1}</span>
                <button type="button" onClick={() => removeFaq(index)} className="btn-remove">삭제</button>
              </div>
              <input 
                placeholder="질문(Q)" 
                value={faq.q} 
                onChange={(e) => handleFaqChange(index, "q", e.target.value)} 
              />
              <textarea 
                placeholder="답변(A)" 
                value={faq.a} 
                onChange={(e) => handleFaqChange(index, "a", e.target.value)} 
                rows={2}
              />
            </div>
          ))}
          <button type="button" onClick={addFaq} className="btn-add-faq">+ 질문 추가하기</button>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate("/admin/diseases")} className="admin-btn">취소</button>
          <button type="submit" className="admin-btn primary submit-btn">저장하기</button>
        </div>
      </form>
    </div>
  );
}