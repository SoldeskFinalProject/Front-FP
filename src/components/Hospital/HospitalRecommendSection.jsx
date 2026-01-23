"use client";

import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getRecommendedHospitals,
  addHospitalFavorite,
  removeHospitalFavorite,
} from "../../api/hospitalApi";
import "../../pages/SymptomResultPage.css";

// ---------------------------
// 공통 유틸 함수들
// ---------------------------
function formatDistance(distance) {
  if (distance == null) return "-";
  const km = Number(distance);
  if (Number.isNaN(km)) return "-";
  if (km < 1) return `${(km * 1000).toFixed(0)} m`;
  return `${km.toFixed(1)} km`;
}

function formatRating(rating) {
  if (rating == null) return "0.0";
  const n = Number(rating);
  if (Number.isNaN(n)) return "0.0";
  return n.toFixed(1);
}

function getHospitalId(h) {
  return h?.hospitalId ?? h?.id ?? h?.externalId ?? null;
}

function getHospitalName(h) {
  return h?.dutyName ?? h?.name ?? h?.yadmNm ?? "이름 정보 없음";
}

function getHospitalAddr(h) {
  return (
    h?.dutyAddr ??
    h?.roadAddress ??
    h?.jibunAddress ??
    h?.addr ??
    "주소 정보 없음"
  );
}

function getHospitalTel(h) {
  return h?.dutyTel1 ?? h?.tel ?? h?.telno ?? "";
}

function getHospitalTypeName(h) {
  return h?.dutyDivNam ?? h?.clCdNm ?? "";
}

function getLatLng(h) {
  const latRaw = h?.wgs84Lat ?? h?.wgs84_lat ?? h?.lat ?? h?.yPos ?? h?.y_pos ?? h?.latitude ?? null;
  const lngRaw = h?.wgs84Lon ?? h?.wgs84_lon ?? h?.lng ?? h?.xPos ?? h?.x_pos ?? h?.longitude ?? null;
  const lat = latRaw == null ? NaN : Number(latRaw);
  const lng = lngRaw == null ? NaN : Number(lngRaw);
  return { lat, lng };
}

function sortHospitalsByFavorite(hospitals, favoriteIds) {
  return [...hospitals].sort((a, b) => {
    const idA = String(getHospitalId(a) ?? "");
    const idB = String(getHospitalId(b) ?? "");
    const favA = favoriteIds.has(idA);
    const favB = favoriteIds.has(idB);
    if (favA !== favB) return favA ? -1 : 1;
    const dA = Number(a?.distanceKm ?? a?.distance ?? 0);
    const dB = Number(b?.distanceKm ?? b?.distance ?? 0);
    return dA - dB;
  });
}

// ---------------------------
// 메인 컴포넌트
// ---------------------------
export default function HospitalRecommendSection({ resultData, searchKeywords }) {
  const navigate = useNavigate();
  
  // ✅ 1. 로그인 유저 ID 추출 (userId 또는 id 필드 대응)
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const currentUserId = user?.userId || user?.id;

  const [userPos, setUserPos] = useState({ lat: null, lng: null });
  const [hospitals, setHospitals] = useState([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [favoriteLoadingId, setFavoriteLoadingId] = useState(null);

  // 증상 ID 추출
  const symptomId = useMemo(
    () => resultData?.selectedSymptoms?.[0]?.symptomId ?? null,
    [resultData]
  );

  /* ========= 네이버 길찾기 ========= */
  const handleOpenDirections = (hospital) => {
    // 1. 사용자 위치 확인
    if (userPos.lat == null || userPos.lng == null) {
      alert("현재 위치 정보가 없어 길찾기를 실행할 수 없습니다.");
      return;
    }

    // 2. 병원 목적지 좌표 확인 (getLatLng 유틸 사용)
    const { lat: destLat, lng: destLng } = getLatLng(hospital);

    if (Number.isNaN(destLat) || Number.isNaN(destLng)) {
      alert("병원 좌표 정보가 없어 길찾기를 실행할 수 없습니다.");
      return;
    }

    // 3. 네이버 지도 파라미터 구성
    const params = new URLSearchParams({
      slng: userPos.lng,      // 출발지 경도
      slat: userPos.lat,      // 출발지 위도
      stext: "내 위치",        // 출발지 텍스트
      elng: destLng,          // 목적지 경도
      elat: destLat,          // 목적지 위도
      etext: getHospitalName(hospital), // 목적지 이름 (자동 인코딩됨)
      menu: "route",          // 길찾기 모드
      pathType: "0"           // 경로 타입 (0: 최적)
    });

    // 4. URL 생성 및 새 창 열기
    const url = `https://map.naver.com/index.nhn?${params.toString()}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  /* ========= 즐겨찾기 토글 ========= */
  const handleToggleFavorite = async (hospital) => {
      if (!currentUserId) {
          alert("로그인이 필요한 서비스입니다.");
          return;
      }

      const rawId = getHospitalId(hospital);
      if (!rawId) {
          alert("병원 ID 정보가 없습니다.");
          return;
      }

      const idStr = String(rawId);
      try {
          setFavoriteLoadingId(idStr);
          
          if (favoriteIds.has(idStr)) {
              await removeHospitalFavorite(rawId, currentUserId); 
              setFavoriteIds((prev) => {
                  const next = new Set(prev);
                  next.delete(idStr);
                  // 리스트 순서 업데이트 (즐겨찾기 해제 시 하단으로 이동할 수 있게)
                  setHospitals((prevList) => sortHospitalsByFavorite(prevList, next));
                  return next;
              });
          } else {
              await addHospitalFavorite(rawId, currentUserId); 
              setFavoriteIds((prev) => {
                  const next = new Set(prev);
                  next.add(idStr);
                  // 리스트 순서 업데이트 (즐겨찾기 설정 시 상단으로 이동)
                  setHospitals((prevList) => sortHospitalsByFavorite(prevList, next));
                  return next;
              });
          }
      } catch (e) {
          console.error(e);
          alert("즐겨찾기 처리 중 오류가 발생했습니다.");
      } finally {
          setFavoriteLoadingId(null);
      }
  };

  /* ========= 예약 페이지 이동 ========= */
  const handleReserveHospital = (hospital) => {
    const id = getHospitalId(hospital);
    if (!id) return alert("병원 ID 정보가 없습니다.");
    navigate(`/hospitals/${id}/reservation`, {
      state: {
        hospital,
        selectedSymptoms: resultData?.selectedSymptoms ?? [],
      },
    });
  };

  /* ========= 1. 현재 위치 가져오기 ========= */
  useEffect(() => {
    if (!resultData) return;
    if (!("geolocation" in navigator)) {
      setErrorMsg("브라우저에서 위치 정보를 지원하지 않습니다.");
      return;
    }
    setGeoLoading(true);
    setErrorMsg(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoLoading(false);
      },
      (err) => {
        console.error("[Geo] 실패:", err);
        setErrorMsg("위치 정보를 가져오지 못했습니다.");
        setGeoLoading(false);
      },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 0 }
    );
  }, [resultData]);

  /* ========= 2. 추천 병원 조회 (수정 핵심) ========= */
  useEffect(() => {
    if (!resultData || userPos.lat == null || userPos.lng == null) return;
    
    const keywords = searchKeywords || [];

    const fetchHospitals = async () => {
      try {
        setHospitalsLoading(true);
        setErrorMsg(null);

        let finalUniqueHospitals = [];

        if (keywords.length > 0) {
          // ✅ 진료과 다중 검색 시 userId 전달
          const promises = keywords.map(dept => 
            getRecommendedHospitals({
              deptName: dept,
              lat: userPos.lat,
              lng: userPos.lng,
              userId: currentUserId // <-- 이 부분이 있어야 서버가 즐겨찾기 여부를 알려줌
            })
          );
          const results = await Promise.all(promises);
          const allHospitals = results.flat();
          finalUniqueHospitals = Array.from(
            new Map(allHospitals.map(h => [getHospitalId(h), h])).values()
          );
        } else {
          // ✅ 증상 기반 검색 시 userId 전달
          const data = await getRecommendedHospitals({
            symptomCode: symptomId,
            lat: userPos.lat,
            lng: userPos.lng,
            userId: currentUserId // <-- 이 부분이 있어야 서버가 즐겨찾기 여부를 알려줌
          });
          finalUniqueHospitals = Array.isArray(data) ? data : [];
        }

        // ✅ 3. 서버 응답의 isFavorite 값을 기반으로 상태 초기화
        const favSet = new Set();
        finalUniqueHospitals.forEach((h) => {
          const rawId = getHospitalId(h);
          // 서버 응답 데이터 필드명인 'favorite'을 사용합니다.
          if (h?.favorite === true && rawId != null) { 
            favSet.add(String(rawId));
          }
        });

        setFavoriteIds(favSet);
        setHospitals(sortHospitalsByFavorite(finalUniqueHospitals, favSet));
      } catch (e) {
        console.error(e);
        setErrorMsg("병원 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setHospitalsLoading(false);
      }
    };

    fetchHospitals();
  }, [resultData, userPos.lat, userPos.lng, symptomId, searchKeywords?.join(","), currentUserId]); // currentUserId 의존성 추가
  
  return (
    <section className="result-section">
      <h3 className="result-section-title">
        내 주변 <span style={{ color: "#228be6" }}>{searchKeywords?.join(", ") || "추천"}</span> 병원
      </h3>

      {geoLoading && <p className="info-text">내 위치를 불러오는 중입니다…</p>}
      {errorMsg && <p className="error-text">{errorMsg}</p>}
      {hospitalsLoading && !errorMsg && (
        <p className="info-text">병원 정보를 불러오는 중입니다…</p>
      )}
      {!hospitalsLoading && !geoLoading && !errorMsg && hospitals.length === 0 && (
        <p className="no-data">조건에 맞는 병원을 찾지 못했습니다.</p>
      )}

      <div className="hospital-list">
        {hospitals.map((h) => {
          const rawId = getHospitalId(h);
          const idStr = rawId == null ? null : String(rawId);
          const isFav = idStr ? favoriteIds.has(idStr) : false;
          
          const rating = h?.ratingAvg ?? h?.rating_avg ?? h?.avgRating ?? 0;
          const reviewCnt = h?.reviewCount ?? h?.review_count ?? h?.cnt ?? 0;
          const key = idStr ?? String(h?.externalId ?? Math.random());

          return (
            <div key={key} className="hospital-card">
              <div className="hospital-row-top">
                <div className="hospital-top-left">
                  <h4 className="hospital-name">{getHospitalName(h)}</h4>
                  {getHospitalTypeName(h) && (
                    <span className="hospital-type">{getHospitalTypeName(h)}</span>
                  )}
                </div>

                <div className="hospital-top-right">
                  <div className="rating-box">
                    <span className="rating-label">평점</span>
                    <span className="rating-value">{formatRating(rating)}</span>
                    <span className="rating-count">리뷰 {reviewCnt}개</span>
                  </div>
                  {(h?.distanceKm != null || h?.distance != null) && (
                    <div className="distance-pill">
                      거리 <span className="distance-value">{formatDistance(h?.distanceKm ?? h?.distance)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="hospital-row-middle">
                <p className="hospital-address">{getHospitalAddr(h)}</p>
                {getHospitalTel(h) && (
                  <span className="hospital-tel-right">☎ {getHospitalTel(h)}</span>
                )}
              </div>

              <div className="hospital-row-bottom">
                <div className="hospital-bottom-right">
                  <button
                    type="button"
                    className={`favorite-button ${isFav ? "favorite-on" : ""}`}
                    disabled={favoriteLoadingId === (idStr ?? "")}
                    onClick={() => handleToggleFavorite(h)}
                  >
                    {isFav ? "★ 즐겨찾기" : "☆ 즐겨찾기"}
                  </button>
                  <button
                    type="button"
                    className="reserve-button"
                    onClick={() => handleReserveHospital(h)}
                  >
                    예약하기
                  </button>
                  <button
                    type="button"
                    className="naver-route-button"
                    onClick={() => handleOpenDirections(h)}
                  >
                    네이버 지도 길찾기
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}