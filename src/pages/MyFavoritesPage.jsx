import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyFavoriteHospitals, removeHospitalFavorite } from "../api/hospitalApi";
import "./MyFavoritesPage.css";

export default function MyFavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPos, setUserPos] = useState({ lat: null, lng: null }); // ✅ 사용자 위치 상태 추가
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.userId;

  useEffect(() => {
    // 1. 즐겨찾기 목록 가져오기
    const fetchFavorites = async () => {
      if (!userId) return;
      try {
        const data = await getMyFavoriteHospitals(userId);
        setFavorites(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    // 2. 사용자 현재 위치 가져오기 (길찾기용)
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserPos({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          },
          (err) => console.error("위치 정보를 가져올 수 없습니다.", err)
        );
      }
    };

    fetchFavorites();
    getUserLocation();
  }, [userId]);

  // ✅ 네이버 지도 길찾기 연결 함수 수정
  const handleOpenNaverMap = (hospital) => {
    // 백엔드 응답 필드명에 따라 wgs84Lat(카멜) 또는 wgs84_lat(스네이크) 둘 다 체크
    const lat = hospital.wgs84Lat || hospital.wgs84_lat;
    const lng = hospital.wgs84Lon || hospital.wgs84_lon;

    if (!lat || !lng) {
      console.log("병원 데이터 확인:", hospital); // 데이터 구조 확인용 로그
      alert("해당 병원의 좌표 정보가 없습니다.");
      return;
    }

    // 네이버 길찾기 URL 구성
    const baseUrl = "https://map.naver.com/index.nhn";
    const params = new URLSearchParams({
      slng: userPos.lng || "", 
      slat: userPos.lat || "", 
      stext: "내 위치",
      elng: lng, // 추출한 경도 사용
      elat: lat, // 추출한 위도 사용
      etext: hospital.dutyName, 
      menu: "route", 
      pathType: "0", 
    });

    const url = `${baseUrl}?${params.toString()}`;
    window.open(url, "_blank", "noopener,noreferrer"); 
  };

  const handleRemoveFavorite = async (hospitalId) => {
    if (!window.confirm("즐겨찾기를 해제하시겠습니까?")) return;
    try {
      await removeHospitalFavorite(hospitalId, userId);
      setFavorites(prev => prev.filter(h => h.hospitalId !== hospitalId));
      alert("해제되었습니다.");
    } catch (e) {
      alert("해제 실패");
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="favorite-page-wrapper">
      <div className="favorite-header">
        <h2>⭐ 나의 즐겨찾기 병원</h2>
      </div>

      <div className="favorite-list-container">
        {favorites.length === 0 ? (
          <p className="no-favorites">즐겨찾기한 병원이 없습니다.</p>
        ) : (
          favorites.map((hospital) => (
            <div key={hospital.hospitalId} className="hospital-item-card">
              <div className="hospital-info">
                <h3>{hospital.dutyName}</h3>
                <p className="address">{hospital.dutyAddr}</p>
                <p className="tel">☎ {hospital.dutyTel1}</p>
              </div>
              
              <div className="hospital-actions">
                <button 
                  className="btn-fav active" 
                  onClick={() => handleRemoveFavorite(hospital.hospitalId)}
                >
                  ★ 즐겨찾기
                </button>
                <button 
                  className="btn-reserve"
                  onClick={() => navigate(`/hospitals/${hospital.hospitalId}/reservation`)}
                >
                  예약하기
                </button>
                {/* ✅ 네이버 지도 버튼에 이벤트 연결 */}
                <button 
                  className="btn-map" 
                  onClick={() => handleOpenNaverMap(hospital)}
                >
                  네이버 지도
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}