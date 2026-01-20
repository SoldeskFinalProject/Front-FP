// src/components/Hospital/HospitalRecommendSection.jsx
"use client";

import { useEffect, useState } from "react";
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
  const latRaw = h?.wgs84Lat ?? h?.lat ?? h?.yPos ?? h?.y_pos ?? h?.latitude ?? null;
  const lngRaw = h?.wgs84Lon ?? h?.lng ?? h?.xPos ?? h?.x_pos ?? h?.longitude ?? null;
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
// ✅ [수정] searchKeyword(단일) -> searchKeywords(배열) Props 변경
export default function HospitalRecommendSection({ resultData, searchKeywords }) {
  const navigate = useNavigate();

  const [userPos, setUserPos] = useState({ lat: null, lng: null });
  const [hospitals, setHospitals] = useState([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [favoriteLoadingId, setFavoriteLoadingId] = useState(null);

  /* ========= 네이버 길찾기  ========= */
  const handleOpenDirections = (hospital) => {
    if (userPos.lat == null || userPos.lng == null) {
      alert("현재 위치 정보가 없어 길찾기를 실행할 수 없습니다.");
      return;
    }
    const { lat: destLat, lng: destLng } = getLatLng(hospital);
    if (Number.isNaN(destLat) || Number.isNaN(destLng)) {
      alert("병원 좌표 정보가 없어 길찾기를 실행할 수 없습니다.");
      return;
    }
    const sName = "현재 위치";
    const dName = getHospitalName(hospital);
    const url = `https://map.naver.com/index.nhn?slng=${userPos.lng}&slat=${userPos.lat}&stext=${encodeURIComponent(
      sName,
    )}&elng=${destLng}&elat=${destLat}&etext=${encodeURIComponent(
      dName,
    )}&menu=route`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  /* ========= 즐겨찾기 토글  ========= */
  const handleToggleFavorite = async (hospital) => {
    const rawId = getHospitalId(hospital);
    if (!rawId) {
      alert("병원 ID 정보가 없습니다.");
      return;
    }
    const id = String(rawId);
    try {
      setFavoriteLoadingId(id);
      if (favoriteIds.has(id)) {
        await removeHospitalFavorite(rawId);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          setHospitals((prevList) => sortHospitalsByFavorite(prevList, next));
          return next;
        });
      } else {
        await addHospitalFavorite(rawId);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.add(id);
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

  /* ========= 리뷰/예약 페이지 이동  ========= */
  const handleOpenReviewPage = (hospital) => {
    const id = getHospitalId(hospital);
    if (!id) return alert("병원 ID 정보가 없습니다.");
    navigate(`/hospitals/${id}/review/new`, {
      state: {
        hospital: {
          id,
          name: getHospitalName(hospital),
          addr: getHospitalAddr(hospital),
          tel: getHospitalTel(hospital),
        },
        selectedSymptoms: resultData?.selectedSymptoms ?? [],
      },
    });
  };

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

  /* ========= 1. 현재 위치 가져오기 (기존 유지) ========= */
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
        setUserPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGeoLoading(false);
      },
      (err) => {
        console.error("[Geo] 실패:", err);
        let msg = "위치 정보를 가져오지 못했습니다.";
        if (err.code === err.PERMISSION_DENIED) msg = "위치 권한이 거부되었습니다.";
        else if (err.code === err.POSITION_UNAVAILABLE) msg = "위치 정보를 사용할 수 없습니다.";
        else if (err.code === err.TIMEOUT) msg = "위치 조회 시간이 초과되었습니다.";
        setErrorMsg(msg);
        setGeoLoading(false);
      },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 0 },
    );
  }, [resultData]);

  /* ========= 2. 추천 병원 조회 (다중 검색 병합 수정) ========= */
  useEffect(() => {
    // 위치 정보나 결과 데이터가 없으면 중단
    if (!resultData || userPos.lat == null || userPos.lng == null) return;
    
    // ✅ 배열이 비어있으면 목록 비우고 중단
    if (!searchKeywords || searchKeywords.length === 0) {
      setHospitals([]);
      return;
    }

    const fetchHospitals = async () => {
      try {
        setHospitalsLoading(true);
        setErrorMsg(null);

        console.log(`🏥 병원 다중 검색 요청: [${searchKeywords.join(", ")}], 좌표(${userPos.lat}, ${userPos.lng})`);

        // ✅ 선택된 진료과 개수만큼 병렬 API 호출 생성
        const promises = searchKeywords.map(dept => 
          getRecommendedHospitals({
            deptName: dept,
            lat: userPos.lat,
            lng: userPos.lng,
          })
        );

        // ✅ 모든 API 호출 병렬 실행
        const results = await Promise.all(promises);
        
        // ✅ 결과 평탄화 및 중복 제거
        const allHospitals = results.flat();
        const uniqueHospitals = Array.from(
          new Map(allHospitals.map(h => [getHospitalId(h), h])).values()
        );

        const favSet = new Set();
        uniqueHospitals.forEach((h) => {
          const rawId = getHospitalId(h);
          if (h?.isFavorite && rawId != null) {
            favSet.add(String(rawId));
          }
        });

        setFavoriteIds(favSet);
        setHospitals(sortHospitalsByFavorite(uniqueHospitals, favSet));
      } catch (e) {
        console.error(e);
        setErrorMsg("병원 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setHospitalsLoading(false);
      }
    };

    fetchHospitals();
    // ✅ 의존성 배열에 searchKeywords의 변화 감지 (문자열 결합 방식)
  }, [resultData, userPos.lat, userPos.lng, searchKeywords?.join(",")]);

  return (
    <section className="result-section">
      {/* ✅ 제목에 선택된 모든 진료과 표시 */}
      <h3 className="result-section-title">
        내 주변 <span style={{ color: "#228be6" }}>{searchKeywords?.join(", ") || "추천"}</span> 병원
      </h3>

      {geoLoading && <p className="info-text">내 위치를 불러오는 중입니다…</p>}
      {errorMsg && <p className="error-text">{errorMsg}</p>}
      {hospitalsLoading && !errorMsg && (
        <p className="info-text">병원 정보를 불러오는 중입니다…</p>
      )}
      {!hospitalsLoading && !geoLoading && !errorMsg && hospitals.length === 0 && (
        <p className="no-data">
          근처에 <b>{searchKeywords?.join(", ")}</b> 관련 병원이 없습니다.
        </p>
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
                    className="review-button"
                    onClick={() => handleOpenReviewPage(h)}
                  >
                    리뷰 쓰기
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