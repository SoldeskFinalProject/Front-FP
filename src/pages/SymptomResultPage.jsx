"use client";

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./SymptomResultPage.css";
import { getRecommendedHospitals } from "../api/hospitalApi"; // 경로는 구조에 맞게 조정

// 거리 표기용 헬퍼 (km 기준 가정)
function formatDistance(distance) {
  if (distance == null) return "-";
  const km = Number(distance);
  if (Number.isNaN(km)) return "-";
  if (km < 1) return `${(km * 1000).toFixed(0)} m`;
  return `${km.toFixed(1)} km`;
}

// 평점 표기용
function formatRating(rating) {
  if (rating == null) return "0.0";
  const n = Number(rating);
  if (Number.isNaN(n)) return "0.0";
  return n.toFixed(1);
}

export default function SymptomResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [resultData, setResultData] = useState(null);

  // 위치 & 병원 추천 관련 상태
  const [userPos, setUserPos] = useState({ lat: null, lng: null });
  const [hospitals, setHospitals] = useState([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // ✅ 네이버 지도 길찾기 (새 탭에서, 현재 위치 → 병원)
    const handleOpenDirections = (hospital) => {
    console.log("[Directions] hospital:", hospital, "userPos:", userPos);

    // ✅ DB / 백엔드 기준:
    //   - x_pos / xPos = 경도(lng)
    //   - y_pos / yPos = 위도(lat)
    const destLatRaw =
        hospital.yPos ??
        hospital.y_pos ??
        hospital.lat ??
        hospital.latitude;

    const destLngRaw =
        hospital.xPos ??
        hospital.x_pos ??
        hospital.lng ??
        hospital.longitude;

    const destLat = Number(destLatRaw);
    const destLng = Number(destLngRaw);

    // 📌 현재 위치 + 병원 좌표가 모두 있어야 함
    if (
        userPos.lat == null ||
        Number.isNaN(Number(userPos.lat)) ||
        userPos.lng == null ||
        Number.isNaN(Number(userPos.lng)) ||
        Number.isNaN(destLat) ||
        Number.isNaN(destLng)
    ) {
        console.error("[Directions] invalid coords", {
        userPos,
        destLatRaw,
        destLngRaw,
        });
        alert("현재 위치 또는 병원 위치 정보가 없어 길찾기를 실행할 수 없습니다.");
        return;
    }

    const sName = "현재 위치";
    const dName = hospital.yadmNm || hospital.name || "도착지";

    // ✅ 예전부터 잘 먹히는 네이버 지도 웹 길찾기 URL
    //    slng/slat: 출발지, elng/elat: 도착지
    const url =
        "https://map.naver.com/index.nhn" +
        `?slng=${userPos.lng}` +
        `&slat=${userPos.lat}` +
        `&stext=${encodeURIComponent(sName)}` +
        `&elng=${destLng}` +
        `&elat=${destLat}` +
        `&etext=${encodeURIComponent(dName)}` +
        `&menu=route`;

    console.log("[Directions] open url:", url);

    // ✅ 항상 새 탭에서 열리게: a 태그를 만들어 강제로 클릭
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    };


  // 0. SymptomPage에서 넘어온 데이터 세팅
  useEffect(() => {
    if (location.state) {
      setResultData(location.state);
      console.log("[SymptomResultPage] 받은 데이터:", location.state);
    } else {
      alert("증상 분석 데이터가 없습니다.");
      navigate("/");
    }
  }, [location, navigate]);

  // 1. 사용자 현재 위치 가져오기
  useEffect(() => {
    if (!resultData) return; // 데이터 세팅 전에는 실행 X

    if (!("geolocation" in navigator)) {
      setErrorMsg("브라우저에서 위치 정보를 지원하지 않습니다.");
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGeoLoading(false);
      },
      (err) => {
        console.error(err);
        setErrorMsg(
          "위치 정보를 가져오지 못했습니다. 브라우저 위치 권한을 확인해 주세요."
        );
        setGeoLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }, [resultData]);

  // 2. 위치 + 증상 정보로 병원 추천 호출
  useEffect(() => {
    if (!resultData) return;
    if (userPos.lat == null || userPos.lng == null) return;

    const mainSymptom =
      resultData.selectedSymptoms && resultData.selectedSymptoms[0];

    // 백엔드가 증상 코드를 받는 구조라면 symptom.symptomCode 사용
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
          sort: "distance_rating", // 백엔드에서 거리+평점 순으로 정렬한다고 가정
        });

        console.log("[SymptomResultPage] 추천 병원 응답:", data);
        setHospitals(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setErrorMsg("병원 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setHospitalsLoading(false);
      }
    };

    fetchHospitals();
  }, [resultData, userPos.lat, userPos.lng]);

  if (!resultData) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="result-page-container">
      <header className="result-header">
        <h2 className="result-title">증상 분석 결과</h2>
        <button className="back-btn" onClick={() => navigate("/")}>
          다시 검색하기
        </button>
      </header>

      {/* 선택한 증상 목록 */}
      <section className="result-section">
        <h3 className="result-section-title">선택하신 증상</h3>
        <div className="symptom-list">
          {resultData.selectedSymptoms &&
          resultData.selectedSymptoms.length > 0 ? (
            resultData.selectedSymptoms.map((symptom, index) => (
              <div key={index} className="symptom-item">
                <span className="symptom-name">{symptom.symptomName}</span>
                <span className="symptom-category">
                  {symptom.categoryName}
                </span>
              </div>
            ))
          ) : (
            <p className="no-data">선택된 증상이 없습니다.</p>
          )}
        </div>
      </section>

      {/* 업로드한 외상 이미지 */}
      {resultData.uploadedImage && (
        <section className="result-section">
          <h3 className="result-section-title">업로드한 외상 이미지</h3>
          <div className="uploaded-image-container">
            <img
              src={resultData.uploadedImage || "/placeholder.svg"}
              alt="업로드된 외상"
              className="result-image"
            />
          </div>
        </section>
      )}

      {/* 진료과 추천 (추후 확장) */}
      <section className="result-section">
        <h3 className="result-section-title">추천 진료과</h3>
        <div className="recommendation-placeholder">
          <p>진료과 추천 기능은 준비 중입니다.</p>
          <p className="placeholder-hint">
            향후 AI 분석을 통해 적합한 진료과를 추천해드릴 예정입니다.
          </p>
        </div>
      </section>

      {/* 추천 병원 리스트 */}
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
            <p className="no-data">조건에 맞는 병원을 찾지 못했습니다.</p>
          )}

        <div className="hospital-list">
          {hospitals.map((h) => (
            <div
              key={h.hospitalId ?? h.ykiho}
              className="hospital-card"
            >
              {/* 1. 병원 이름 (왼쪽) / 평점+거리 (오른쪽) */}
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
                    {/* 평점 뱃지 (텍스트만) */}
                    <div className="rating-pill">
                        <span className="pill-label">평점</span>
                        <span className="pill-main">{formatRating(h.ratingAvg)}</span>
                        <span className="pill-sub">리뷰 {h.reviewCount ?? 0}개</span>
                    </div>

                    {/* 거리 뱃지 (텍스트만) */}
                    {(h.distanceKm != null || h.distance != null) && (
                        <div className="distance-pill">
                        <span className="pill-label">거리</span>
                        <span className="pill-main">
                            {formatDistance(h.distanceKm ?? h.distance)}
                        </span>
                        </div>
                    )}
                    </div>
              </div>

              {/* 2. 주소 (가운데 한 줄) */}
              <div className="hospital-row-middle">
                <p className="hospital-address">
                  {h.roadAddress || h.jibunAddress || h.addr || "주소 정보 없음"}
                </p>
              </div>

              {/* 3. 전화번호(왼쪽) / 길찾기 버튼(오른쪽) */}
              <div className="hospital-row-bottom">
                <div className="hospital-bottom-left">
                  {(h.tel || h.telno) && (
                    <span className="hospital-tel">☎ {h.tel || h.telno}</span>
                  )}
                </div>

                <div className="hospital-bottom-right">
                  <button
                    className="naver-route-button"
                    onClick={() => handleOpenDirections(h)}
                  >
                    네이버 지도 길찾기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
