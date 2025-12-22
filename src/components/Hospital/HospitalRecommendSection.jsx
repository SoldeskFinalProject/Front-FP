// src/components/HospitalRecommendSection.jsx
"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getRecommendedHospitals,
  addHospitalFavorite,
  removeHospitalFavorite,
} from "../../api/hospitalApi";
import "../../pages/SymptomResultPage.css"; // 카드 스타일 그대로 활용

// 거리 포맷
function formatDistance(distance) {
  if (distance == null) return "-";
  const km = Number(distance);
  if (Number.isNaN(km)) return "-";
  if (km < 1) return `${(km * 1000).toFixed(0)} m`;
  return `${km.toFixed(1)} km`;
}

// 평점 포맷
function formatRating(rating) {
  if (rating == null) return "0.0";
  const n = Number(rating);
  if (Number.isNaN(n)) return "0.0";
  return n.toFixed(1);
}

// 즐겨찾기 우선 + 거리순 정렬
function sortHospitalsByFavorite(hospitals, favoriteIds) {
  return [...hospitals].sort((a, b) => {
    const idA = a.hospitalId ?? a.id;
    const idB = b.hospitalId ?? b.id;

    const favA = favoriteIds.has(idA);
    const favB = favoriteIds.has(idB);

    if (favA !== favB) {
      return favA ? -1 : 1; // 즐겨찾기 앞으로
    }

    const dA = Number(a.distanceKm ?? a.distance ?? 0);
    const dB = Number(b.distanceKm ?? b.distance ?? 0);
    return dA - dB;
  });
}

/**
 * props:
 *   - resultData: SymptomResultPage 에서 받은 전체 state (selectedSymptoms 등)
 */
export default function HospitalRecommendSection({ resultData }) {
  const navigate = useNavigate();

  const [userPos, setUserPos] = useState({ lat: null, lng: null });
  const [hospitals, setHospitals] = useState([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [favoriteLoadingId, setFavoriteLoadingId] = useState(null);

  /* ========= 네이버 길찾기 ========= */
  const handleOpenDirections = (hospital) => {
    const destLatRaw =
      hospital.lat ?? hospital.yPos ?? hospital.y_pos ?? hospital.latitude;
    const destLngRaw =
      hospital.lng ?? hospital.xPos ?? hospital.x_pos ?? hospital.longitude;

    const destLat = Number(destLatRaw);
    const destLng = Number(destLngRaw);

    if (Number.isNaN(destLat) || Number.isNaN(destLng)) {
      alert("병원 좌표 정보가 없어 길찾기를 실행할 수 없습니다.");
      return;
    }

    const sName = "현재 위치";
    const dName = hospital.yadmNm || hospital.name || "도착지";

    const url = `https://map.naver.com/index.nhn?slng=${userPos.lng}&slat=${
      userPos.lat
    }&stext=${encodeURIComponent(sName)}&elng=${destLng}&elat=${destLat}&etext=${encodeURIComponent(
      dName,
    )}&menu=route`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  /* ========= 즐겨찾기 토글 ========= */
  const handleToggleFavorite = async (hospital) => {
    const id = hospital.hospitalId ?? hospital.id;
    if (!id) {
      alert("병원 ID 정보가 없습니다.");
      return;
    }

    try {
      setFavoriteLoadingId(id);

      if (favoriteIds.has(id)) {
        await removeHospitalFavorite(id);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          setHospitals((prevList) => sortHospitalsByFavorite(prevList, next));
          return next;
        });
      } else {
        await addHospitalFavorite(id);
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

  /* ========= 리뷰 페이지 이동 ========= */
  const handleOpenReviewPage = (hospital) => {
    const id = hospital.hospitalId ?? hospital.id;
    if (!id) {
      alert("병원 ID 정보가 없습니다.");
      return;
    }

    navigate(`/hospitals/${id}/review/new`, {
      state: {
        hospital: {
          id,
          name: hospital.name || hospital.yadmNm || "이름 정보 없음",
          addr:
            hospital.roadAddress ||
            hospital.jibunAddress ||
            hospital.addr ||
            "",
          tel: hospital.tel || hospital.telno || "",
        },
        selectedSymptoms: resultData?.selectedSymptoms ?? [],
      },
    });
  };

  /* ========= 예약 페이지 이동 ========= */
  const handleReserveHospital = (hospital) => {
    const id = hospital.hospitalId ?? hospital.id;
    if (!id) {
      alert("병원 ID 정보가 없습니다.");
      return;
    }

    navigate(`/hospitals/${id}/reservation`, {
      state: {
        hospital,
        selectedSymptoms: resultData?.selectedSymptoms ?? [],
      },
    });
  };

  /* ========= 1. 현재 위치 ========= */
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
        if (err.code === err.PERMISSION_DENIED) {
          msg =
            "위치 권한이 거부되었습니다. 브라우저 / OS 설정에서 위치 권한을 허용해 주세요.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg =
            "위치 정보를 사용할 수 없습니다. Wi-Fi 또는 GPS 상태를 확인해 주세요.";
        } else if (err.code === err.TIMEOUT) {
          msg = "위치 조회 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.";
        }
        setErrorMsg(msg);
        setGeoLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 0,
      },
    );
  }, [resultData]);

  /* ========= 2. 추천 병원 조회 ========= */
  useEffect(() => {
    if (!resultData) return;
    if (userPos.lat == null || userPos.lng == null) return;

    const mainSymptom =
      resultData.selectedSymptoms && resultData.selectedSymptoms[0];
    const symptomCode = mainSymptom?.symptomCode ?? null;

    const fetchHospitals = async () => {
      try {
        setHospitalsLoading(true);
        setErrorMsg(null);

        const data = await getRecommendedHospitals({
          symptomCode,
          lat: userPos.lat,
          lng: userPos.lng,
          size: 20,
          sort: "distance_rating",
        });

        const list = Array.isArray(data) ? data : [];

        const favSet = new Set();
        (list || []).forEach((h) => {
          if (h.isFavorite && (h.hospitalId || h.id)) {
            favSet.add(h.hospitalId ?? h.id);
          }
        });
        setFavoriteIds(favSet);
        setHospitals(sortHospitalsByFavorite(list, favSet));
      } catch (e) {
        console.error(e);
        setErrorMsg("병원 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setHospitalsLoading(false);
      }
    };

    fetchHospitals();
  }, [resultData, userPos.lat, userPos.lng]);

  return (
    <section className="result-section">
      <h3 className="result-section-title">추천 병원</h3>

      {geoLoading && (
        <p className="info-text">내 위치를 불러오는 중입니다…</p>
      )}
      {errorMsg && <p className="error-text">{errorMsg}</p>}
      {hospitalsLoading && !errorMsg && (
        <p className="info-text">병원 정보를 불러오는 중입니다…</p>
      )}
      {!hospitalsLoading &&
        !geoLoading &&
        !errorMsg &&
        hospitals.length === 0 && (
          <p className="no-data">
            조건에 맞는 병원을 찾지 못했습니다.
          </p>
      )}

      <div className="hospital-list">
        {hospitals.map((h) => {
          const id = h.hospitalId ?? h.id;
          const isFav = favoriteIds.has(id);

          return (
            <div key={id ?? h.ykiho} className="hospital-card">
              {/* 1. 상단: 이름 / 평점+거리 */}
              <div className="hospital-row-top">
                <div className="hospital-top-left">
                  <h4 className="hospital-name">
                    {h.name || h.yadmNm || "이름 정보 없음"}
                  </h4>
                  {h.clCdNm && (
                    <span className="hospital-type">{h.clCdNm}</span>
                  )}
                </div>

                <div className="hospital-top-right">
                  <div className="rating-box">
                    <span className="rating-label">평점</span>
                    <span className="rating-value">
                      {formatRating(h.ratingAvg)}
                    </span>
                    <span className="rating-count">
                      리뷰 {h.reviewCount ?? 0}개
                    </span>
                  </div>
                  {(h.distanceKm != null || h.distance != null) && (
                    <div className="distance-pill">
                      거리{" "}
                      <span className="distance-value">
                        {formatDistance(h.distanceKm ?? h.distance)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. 주소 + 전화번호(오른쪽) */}
              <div className="hospital-row-middle">
                <p className="hospital-address">
                  {h.roadAddress ||
                    h.jibunAddress ||
                    h.addr ||
                    "주소 정보 없음"}
                </p>
                {(h.tel || h.telno) && (
                  <span className="hospital-tel-right">
                    ☎ {h.tel || h.telno}
                  </span>
                )}
              </div>

              {/* 3. 버튼들만 한 줄 */}
              <div className="hospital-row-bottom">
                <div className="hospital-bottom-right">
                  <button
                    type="button"
                    className={`favorite-button ${
                      isFav ? "favorite-on" : ""
                    }`}
                    disabled={favoriteLoadingId === id}
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
