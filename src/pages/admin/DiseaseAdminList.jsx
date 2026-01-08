import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchDiseases } from "../../api/diseaseAPI"; // 기존 검색 API 재사용
import { deleteDisease } from "../../api/diseaseAdminAPI";
import "./DiseaseAdmin.css"; 

export default function DiseaseAdminList() {
  const [diseases, setDiseases] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 데이터 로드
  const loadDiseases = async (pageArg) => {
    try {
      // 검색어 없이 전체 목록 조회 (카테고리 전체)
      const data = await fetchDiseases("", "전체", pageArg, 10);
      setDiseases(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("목록 로드 실패", error);
    }
  };

  useEffect(() => {
    loadDiseases(page);
  }, [page]);

  // 삭제 핸들러
  const handleDelete = async (id, name) => {
    if (window.confirm(`정말로 '${name}' 질병 정보를 삭제하시겠습니까?`)) {
      try {
        await deleteDisease(id);
        alert("삭제되었습니다.");
        loadDiseases(page); // 목록 갱신
      } catch (error) {
        alert("삭제 실패: " + error.message);
      }
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>질병 관리 페이지</h1>
        <Link to="/admin/diseases/form" className="admin-btn primary">
          + 신규 질병 등록
        </Link>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th style={{width: '50px'}}>ID</th>
            <th>카테고리</th>
            <th>질병명</th>
            <th>진료과</th>
            <th style={{width: '150px'}}>관리</th>
          </tr>
        </thead>
        <tbody>
          {diseases.map((item) => (
            <tr key={item.diseaseId || item.id}>
              <td>{item.diseaseId || item.id}</td>
              <td><span className="category-badge">{item.category}</span></td>
              <td style={{textAlign: 'left', fontWeight: 'bold'}}>{item.diseaseName}</td>
              <td>{item.department}</td>
              <td>
                <div className="action-buttons">
                  <Link 
                    to={`/admin/diseases/form/${item.diseaseId || item.id}`} 
                    className="admin-btn edit"
                  >
                    수정
                  </Link>
                  <button 
                    onClick={() => handleDelete(item.diseaseId || item.id, item.diseaseName)} 
                    className="admin-btn delete"
                  >
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 페이지네이션 (기존 로직 활용) */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`page-btn ${page === i ? "active" : ""}`}
            onClick={() => setPage(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}