// src/api/hospitalApi.js

// 백엔드 기본 URL
const BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

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

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `추천 병원 조회 실패: ${res.status} ${res.statusText} ${text}`,
    );
  }

  return res.json();
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

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `병원 즐겨찾기 추가 실패: ${res.status} ${res.statusText} ${text}`,
    );
  }

  return res.json().catch(() => ({})); // 바디 없어도 에러 안 나게
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

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `병원 즐겨찾기 해제 실패: ${res.status} ${res.statusText} ${text}`,
    );
  }

  return res.json().catch(() => ({}));
}

/**
 * 병원 예약 생성
 * payload: { reservedAt, memo, symptomCodes, symptomNames … }
 */
export async function createHospitalReservation(hospitalId, payload) {
  const url = `${BASE_URL}/api/hospitals/${hospitalId}/reservations`;

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload ?? {}),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `병원 예약 실패: ${res.status} ${res.statusText} ${text}`,
    );
  }

  return res.json().catch(() => ({}));
}
