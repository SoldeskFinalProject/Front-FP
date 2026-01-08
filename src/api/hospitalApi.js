// src/api/hospitalApi.js

// 백엔드 기본 URL
const BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

/** 공통 에러 처리 헬퍼 */
async function ensureOk(res, defaultErrorMessage) {
  if (res.ok) {
    // body 가 없을 수도 있어서 안전하게 처리
    try {
      return await res.json();
    } catch (e) {
      console.error("JSON 파싱 오류:", e);
      return {};
    }
  }

  const text = await res.text().catch(() => "");
  throw new Error(
    `${defaultErrorMessage}: ${res.status} ${res.statusText} ${text}`,
  );
}

/**
 * 추천 병원 조회 API
 *
 * @param {{ lat?: number, lng?: number, symptomCode?: string }} params
 * @returns {Promise<Array>}
 */
export async function getRecommendedHospitals(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.lat != null) searchParams.append("lat", params.lat);
  if (params.lng != null) searchParams.append("lng", params.lng);
  if (params.symptomCode)
    searchParams.append("symptomCode", params.symptomCode);

  const url = `${BASE_URL}/api/hospitals/recommend?${searchParams.toString()}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  return ensureOk(res, "추천 병원 조회 실패");
}

/**
 * 병원 즐겨찾기 추가
 */
export async function addHospitalFavorite(hospitalId) {
  const url = `${BASE_URL}/api/hospitals/${hospitalId}/favorite`;

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return ensureOk(res, "병원 즐겨찾기 추가 실패");
}

/**
 * 병원 즐겨찾기 해제
 */
export async function removeHospitalFavorite(hospitalId) {
  const url = `${BASE_URL}/api/hospitals/${hospitalId}/favorite`;

  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });

  return ensureOk(res, "병원 즐겨찾기 해제 실패");
}

/**
 * 병원 예약 생성
 *
 * @param {number|string} hospitalId
 * @param {{
 *   userId?: number,
 *   patientName?: string,
 *   phone?: string,
 *   memo?: string,
 *   reservedAt?: string,
 *   symptomCodes?: string[],
 *   symptomNames?: string[]
 * }} payload
 */
export async function createHospitalReservation(hospitalId, payload = {}) {
  const url = `${BASE_URL}/api/hospitals/${hospitalId}/reservations`;

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return ensureOk(res, "병원 예약 실패");
}

/**
 * 병원 리뷰 작성
 *
 * @param {number|string} hospitalId
 * @param {{
 *   rating: number,
 *   content: string,
 *   userId?: number
 * }} payload
 */
export async function createHospitalReview(hospitalId, payload = {}) {
  const url = `${BASE_URL}/api/hospitals/${hospitalId}/reviews`;

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return ensureOk(res, "병원 리뷰 작성 실패");
}


