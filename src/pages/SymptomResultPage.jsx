"use client";

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import "./SymptomResultPage.css";
import {
  getRecommendedHospitals,
  addHospitalFavorite,
  removeHospitalFavorite,
  createHospitalReservation,
} from "../api/hospitalApi";

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

// 30분 단위 예약 슬롯 생성 (open/close: "HH:mm" 가정)
function generateTimeSlots(openTimeStr, closeTimeStr) {
  if (!openTimeStr || !closeTimeStr) return [];

  const [openH, openM] = openTimeStr.split(":").map(Number);
  const [closeH, closeM] = closeTimeStr.split(":").map(Number);

  if (
    Number.isNaN(openH) ||
    Number.isNaN(openM) ||
    Number.isNaN(closeH) ||
    Number.isNaN(closeM)
  ) {
    return [];
  }

  const slots = [];
  const start = new Date();
  start.setHours(openH, openM, 0, 0);

  const end = new Date();
  end.setHours(closeH, closeM, 0, 0);

  const cursor = new Date(start);
  while (cursor < end) {
    const hh = String(cursor.getHours()).padStart(2, "0");
    const mm = String(cursor.getMinutes()).padStart(2, "0");
    slots.push(`${hh}:${mm}`);
    cursor.setMinutes(cursor.getMinutes() + 30);
  }

  return slots;
}

// 즐겨찾기 우선 + 거리순 정렬
function sortHospitalsByFavorite(hospitals, favoriteIds) {
  return [...hospitals].sort((a, b) => {
    const idA = a.hospitalId ?? a.id;
    const idB = b.hospitalId ?? b.id;

    const favA = favoriteIds.has(idA);
    const favB = favoriteIds.has(idB);

    if (favA !== favB) {
      return favA ? -1 : 1; // 즐겨찾기가 앞으로
    }

    const dA = Number(a.distanceKm ?? a.distance ?? 0);
    const dB = Number(b.distanceKm ?? b.distance ?? 0);
    return dA - dB;
  });
}

export default function SymptomResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [resultData, setResultData] = useState(null);

  // 위치 & 병원 추천 관련
  const [userPos, setUserPos] = useState({ lat: null, lng: null });
  const [hospitals, setHospitals] = useState([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // 즐겨찾기/예약 상태
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [favoriteLoadingId, setFavoriteLoadingId] = useState(null);

  // 예약 모달 상태
  const [reserveLoadingId, setReserveLoadingId] = useState(null); // 버튼 disable 용
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [reservationTarget, setReservationTarget] = useState(null);
  const [reservationDate, setReservationDate] = useState(
    () => new Date().toISOString().slice(0, 10),
  ); // YYYY-MM-DD
  const [reservationSlots, setReservationSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reservationMemo, setReservationMemo] = useState("");
  const [reserveSubmitting, setReserveSubmitting] = useState(false);

  // 선택 증상 이름들 (예약 모달에서 보여주기)
  const selectedSymptomNames = useMemo(
    () =>
      (resultData?.selectedSymptoms ?? [])
        .map((s) => s.symptomName)
        .filter(Boolean),
    [resultData],
  );

  // 네이버 길찾기
  const handleOpenDirections = (hospital) => {
    console.log("[Directions] hospital:", hospital, "userPos:", userPos);

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

    console.log("[Directions] URL:", url);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // 즐겨찾기 토글 (토글 후 리스트 재정렬)
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

  // 리뷰 작성 페이지 이동 (라우트만 연결해두기)
  const handleOpenReviewPage = (hospital) => {
    const id = hospital.hospitalId ?? hospital.id;
    if (!id) {
      alert("병원 ID 정보가 없습니다.");
      return;
    }

    const url = `/hospitals/${id}/reviews/new`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  /* ========= 예약 모달 열기 ========= */
  const handleReserveHospital = (hospital) => {
    const openTime =
      hospital.openTime || hospital.open_time || hospital.openAt || "09:00";
    const closeTime =
      hospital.closeTime || hospital.close_time || hospital.closeAt || "18:00";

    const slots = generateTimeSlots(openTime, closeTime);

    setReservationTarget(hospital);
    setReservationSlots(slots);
    setSelectedSlot(null);
    setReservationDate(new Date().toISOString().slice(0, 10));
    setReservationMemo("");
    setReservationModalOpen(true);
  };

  const handleCloseReservationModal = () => {
    setReservationModalOpen(false);
    setReservationTarget(null);
    setReservationSlots([]);
    setSelectedSlot(null);
    setReserveSubmitting(false);
    setReserveLoadingId(null);
  };

  /* ========= 예약 확정 ========= */
  const handleConfirmReservation = async () => {
    if (!reservationTarget) return;

    const hospitalId = reservationTarget.hospitalId ?? reservationTarget.id;
    if (!hospitalId) {
      alert("병원 ID 정보가 없습니다.");
      return;
    }

    if (!reservationDate || !selectedSlot) {
      alert("예약 날짜와 시간을 선택해 주세요.");
      return;
    }

    const reservedAt = `${reservationDate}T${selectedSlot}:00`;

    // 선택된 증상 정보
    const selectedSymptoms = resultData?.selectedSymptoms ?? [];
    const symptomCodes = selectedSymptoms
      .map((s) => s.symptomCode)
      .filter(Boolean);
    const symptomNames = selectedSymptoms
      .map((s) => s.symptomName)
      .filter(Boolean);

    const payload = {
      reservedAt,
      memo: reservationMemo,
      symptomCodes,
      symptomNames,
    };

    try {
      setReserveSubmitting(true);
      setReserveLoadingId(hospitalId);

      await createHospitalReservation(hospitalId, payload);

      alert("병원 예약(예약 요청)이 완료되었습니다.");
      handleCloseReservationModal();
    } catch (e) {
      console.error(e);
      alert("병원 예약 중 오류가 발생했습니다.");
      setReserveSubmitting(false);
      setReserveLoadingId(null);
    }
  };

  // 0. SymptomPage 에서 넘어온 데이터 세팅
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
    if (!resultData) return;

    if (!("geolocation" in navigator)) {
      setErrorMsg("브라우저에서 위치 정보를 지원하지 않습니다.");
      return;
    }

    setGeoLoading(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("[Geo] 성공:", pos);
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

  // 2. 위치 + 증상 정보로 병원 추천 호출
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

        // 백엔드에서 isFavorite 내려주면 초기 즐겨찾기 세팅
        const favSet = new Set();
        (list || []).forEach((h) => {
          if (h.isFavorite && (h.hospitalId || h.id)) {
            favSet.add(h.hospitalId ?? h.id);
          }
        });
        setFavoriteIds(favSet);

        // 즐겨찾기 우선 정렬
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

      {/* 선택한 증상 */}
      <section className="result-section">
        <h3 className="result-section-title">선택하신 증상</h3>
        <div className="symptom-list">
          {resultData.selectedSymptoms &&
          resultData.selectedSymptoms.length > 0 ? (
            resultData.selectedSymptoms.map((symptom, index) => (
              <div key={index} className="symptom-item">
                <span className="symptom-name">
                  {symptom.symptomName}
                </span>
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

      {/* 진료과 추천 (placeholder) */}
      <section className="result-section">
        <h3 className="result-section-title">추천 진료과</h3>
        <div className="recommendation-placeholder">
          <p>진료과 추천 기능은 준비 중입니다.</p>
          <p className="placeholder-hint">
            향후 AI 분석을 통해 적합한 진료과를 추천해드릴 예정입니다.
          </p>
        </div>
      </section>

      {/* 추천 병원 */}
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
              <div
                key={id ?? h.ykiho}
                className="hospital-card"
              >
                {/* 1. 상단: 이름 / 평점+거리 */}
                <div className="hospital-row-top">
                  <div className="hospital-top-left">
                    <h4 className="hospital-name">
                      {h.name || h.yadmNm || "이름 정보 없음"}
                    </h4>
                    {h.clCdNm && (
                      <span className="hospital-type">
                        {h.clCdNm}
                      </span>
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

                {/* 2. 주소 */}
                <div className="hospital-row-middle">
                  <p className="hospital-address">
                    {h.roadAddress ||
                      h.jibunAddress ||
                      h.addr ||
                      "주소 정보 없음"}
                  </p>
                </div>

                {/* 3. 하단: 전화번호 / 즐겨찾기 + 예약 + 길찾기 버튼 */}
                <div className="hospital-row-bottom">
                  <div className="hospital-bottom-left">
                    {(h.tel || h.telno) && (
                      <span className="hospital-tel">
                        ☎ {h.tel || h.telno}
                      </span>
                    )}
                  </div>

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
                      disabled={reserveLoadingId === id}
                      onClick={() => handleReserveHospital(h)}
                    >
                      {reserveLoadingId === id
                        ? "예약 중..."
                        : "예약하기"}
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

      {/* ===== 예약 모달 ===== */}
      {reservationModalOpen && (
        <div className="reservation-modal-backdrop">
          <div className="reservation-modal">
            <h3 className="reservation-modal-title">
              병원 예약 –{" "}
              {reservationTarget?.name ||
                reservationTarget?.yadmNm ||
                "선택한 병원"}
            </h3>

            {/* 선택 증상 요약 */}
            {selectedSymptomNames.length > 0 && (
              <div className="reservation-symptom-summary">
                <span className="label">선택한 증상</span>
                <span className="value">
                  {selectedSymptomNames.join(", ")}
                </span>
              </div>
            )}

            <div className="reservation-field-row">
              <label className="reservation-label">예약 날짜</label>
              <input
                type="date"
                className="reservation-input"
                value={reservationDate}
                onChange={(e) => setReservationDate(e.target.value)}
              />
            </div>

            <div className="reservation-field-row">
              <label className="reservation-label">예약 시간</label>
              <div className="slot-grid">
                {reservationSlots.length === 0 && (
                  <span className="slot-empty">
                    병원 운영 시간이 설정되지 않아 기본값(09:00~18:00)을
                    사용합니다.
                  </span>
                )}
                {reservationSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`slot-button ${
                      selectedSlot === slot ? "selected" : ""
                    }`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="reservation-field-row">
              <label className="reservation-label">요청 메모(선택)</label>
              <textarea
                className="reservation-textarea"
                rows={3}
                value={reservationMemo}
                onChange={(e) => setReservationMemo(e.target.value)}
                placeholder="예: 최근 3일 동안 발열과 기침이 있습니다."
              />
            </div>

            <div className="reservation-modal-footer">
              <button
                type="button"
                className="reservation-cancel-button"
                onClick={handleCloseReservationModal}
                disabled={reserveSubmitting}
              >
                취소
              </button>
              <button
                type="button"
                className="reservation-ok-button"
                onClick={handleConfirmReservation}
                disabled={reserveSubmitting}
              >
                {reserveSubmitting ? "예약 중..." : "예약 확정"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
