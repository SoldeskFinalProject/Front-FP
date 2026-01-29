import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  getHospitalDetail, 
  addHospitalFavorite, 
  removeHospitalFavorite 
} from "../api/hospitalApi";
import "./HospitalDetailPage.css";

export default function HospitalDetailPage() {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const [myLocation, setMyLocation] = useState({ lat: null, lng: null });
  
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const currentUserId = user?.userId || user?.id;

  const todayIndex = new Date().getDay(); 
  const dayMap = ["일", "월", "화", "수", "목", "금", "토"];
  const currentDayStr = dayMap[todayIndex];

  // 1. 내 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMyLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => console.error("위치 정보 확보 실패:", err)
      );
    }
  }, []);

  // 2. 병원 정보 로드
  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        const data = await getHospitalDetail(hospitalId);
        
        if (location.state?.hospital?.isFavorite) {
            data.isFavorite = true;
        }
        
        setHospital(data);
      } catch (error) {
        console.error("실패:", error);
        alert("병원 정보를 불러올 수 없습니다.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [hospitalId, navigate, location.state]);

  // 길찾기
  const handleRouteClick = () => {
    if (!myLocation.lat || !myLocation.lng) {
      alert("현재 위치 정보를 가져오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const params = new URLSearchParams({
      slat: myLocation.lat,
      slng: myLocation.lng,
      stext: "내 위치",
      elat: hospital.wgs84Lat,
      elng: hospital.wgs84Lon,
      etext: hospital.dutyName,
      menu: "route",
      pathType: "0" 
    });

    const url = `https://map.naver.com/index.nhn?${params.toString()}`;
    window.open(url, "_blank");
  };

  // 즐겨찾기 토글
  const handleToggleFavorite = async () => {
    if (!currentUserId) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }
    try {
      if (hospital.isFavorite) {
        await removeHospitalFavorite(hospitalId, currentUserId);
        setHospital(prev => ({ ...prev, isFavorite: false }));
        alert("즐겨찾기가 해제되었습니다.");
      } else {
        await addHospitalFavorite(hospitalId, currentUserId);
        setHospital(prev => ({ ...prev, isFavorite: true }));
        alert("즐겨찾기에 추가되었습니다.");
      }
    } catch (error) {
      console.error("즐겨찾기 실패:", error);
    }
  };

  if (loading) return <div className="loading-container">병원 정보를 불러오는 중...</div>;
  if (!hospital) return null;

  return (
    <div className="detail-page-wrapper">
      <div className="detail-container">
        
        {/* === [왼쪽] 메인 컨텐츠 === */}
        <div className="detail-main">
          
          {/* 히어로 이미지 */}
          {hospital.images && hospital.images.length > 0 && (
            <div className="hero-image-box">
               <img src={hospital.images[0]} alt={hospital.dutyName} />
            </div>
          )}

          {/* 헤더 정보 */}
          <header className="main-header">
            <div className="header-top">
              <div className="title-section">
                <span className="hospital-category">{hospital.dutyDivNam}</span>
                <h1 className="hospital-title">{hospital.dutyName}</h1>
              </div>
              
              {/* ✅ [수정] 하트 아이콘 -> 확실한 버튼으로 변경 */}
              <button 
                className={`favorite-header-btn ${hospital.isFavorite ? "active" : ""}`}
                onClick={handleToggleFavorite}
              >
                {hospital.isFavorite ? "★ 즐겨찾기 해제" : "☆ 즐겨찾기 추가"}
              </button>
            </div>
            
            <div className="header-meta">
                <span className="rating-score">⭐ {hospital.ratingAvg ? hospital.ratingAvg.toFixed(1) : "0.0"}</span>
                <span className="review-count">방문자 리뷰 {hospital.reviewCount}개</span>
            </div>

            {/* 진료과 태그 */}
            {hospital.departments && hospital.departments.length > 0 && (
              <div className="dept-tags-row">
                {hospital.departments.map((dept, idx) => (
                  <span key={idx} className="dept-tag">{dept}</span>
                ))}
              </div>
            )}
          </header>

          {/* 탭 메뉴 */}
          <div className="tabs-container">
            <button 
              className={`tab-btn ${activeTab === "info" ? "active" : ""}`}
              onClick={() => setActiveTab("info")}
            >
              병원 정보
            </button>
            <button 
              className={`tab-btn ${activeTab === "review" ? "active" : ""}`}
              onClick={() => setActiveTab("review")}
            >
              리뷰 ({hospital.reviewCount || 0})
            </button>
          </div>
          
          <div className="tab-content-area">
             {activeTab === "info" ? (
               <div className="info-content">
                 
                 {/* 진료 시간표 */}
                 {hospital.operatingTimes && hospital.operatingTimes.length > 0 && (
                   <section className="info-block">
                     <h3 className="section-title">⏰ 진료 시간</h3>
                     <div className="time-table-wrapper">
                       <table className="time-table">
                         <tbody>
                           {hospital.operatingTimes.map((time, idx) => (
                             <tr key={idx} className={time.dayOfWeek === currentDayStr ? "today-row" : ""}>
                               <th className={time.open ? "" : "closed-day"}>
                                 {time.dayOfWeek}
                                 {time.dayOfWeek === currentDayStr && <span className="today-badge">오늘</span>}
                               </th>
                               <td className={time.open ? "" : "closed-text"}>
                                 {time.timeInfo}
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                   </section>
                 )}

                 {/* 의료진 소개 */}
                 {hospital.doctors && hospital.doctors.length > 0 && (
                   <section className="info-block">
                     <h3 className="section-title">👨‍⚕️ 의료진 소개</h3>
                     <div className="doctor-grid">
                       {hospital.doctors.map((doc) => (
                         <div key={doc.doctorId} className="doctor-card">
                           <div className="doctor-img">
                             <img src={doc.profileImageUrl || "https://via.placeholder.com/150?text=Doctor"} alt={doc.name} />
                           </div>
                           <div className="doctor-details">
                             <div className="doctor-name">{doc.name}</div>
                             <div className="doctor-spec">{doc.specialty}</div>
                             <div className="doctor-bio">{doc.bio}</div>
                           </div>
                         </div>
                       ))}
                     </div>
                   </section>
                 )}

                 {/* ✅ [수정] 위치 안내: 주소만 남기고 지도 그림 삭제 */}
                 <section className="info-block">
                   <h3 className="section-title">📍 위치 안내</h3>
                   <div className="address-container">
                      <p className="address-text">{hospital.dutyAddr}</p>
                   </div>
                 </section>
               </div>
             ) : (
               <div className="review-content">
                  <div className="empty-review-box">
                    <p>등록된 리뷰가 없습니다.</p>
                    <p className="sub-text">첫 번째 리뷰를 남겨보세요!</p>
                  </div>
               </div>
             )}
          </div>
        </div>

        {/* === [오른쪽] 사이드바 === */}
        <aside className="detail-sidebar">
          <div className="reservation-card">
            <h3 className="card-title">진료 예약</h3>
            <p className="card-desc">원하는 시간에 간편하게 예약하세요.</p>
            
            <div className="card-actions">
              <button 
                className="action-btn reserve"
                onClick={() => navigate(`/hospitals/${hospitalId}/reservation`)}
              >
                📅 바로 예약하기
              </button>
              <button className="action-btn route" onClick={handleRouteClick}>
                🚗 길찾기 (네비게이션)
              </button>
            </div>
            
            <div className="divider"></div>
            
            <div className="card-contact">
               <span className="contact-label">전화 문의</span>
               <strong className="contact-number">{hospital.dutyTel1}</strong>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}