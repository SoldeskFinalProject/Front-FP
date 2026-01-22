// src/api/hospitalApi.js

// 백엔드 기본 URL
const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

// 로컬 스토리지에 저장된 토큰 키 이름
const TOKEN_KEY = "accessToken";

/** * 인증 헤더를 생성하는 헬퍼 함수 
 * 토큰이 있으면 Authorization 헤더를 반환합니다.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

/** 공통 에러 처리 헬퍼 */
async function ensureOk(res, defaultErrorMessage) {
  if (res.ok) {
    try {
      // body가 비어있는 경우를 대비해 text()를 먼저 확인하거나 안전하게 파싱
      const text = await res.text();
      return text ? JSON.parse(text) : {};
    } catch (e) {
      console.error("JSON 파싱 오류:", e);
      return {};
    }
  }

  const errorText = await res.text().catch(() => "");
  throw new Error(
    `${defaultErrorMessage}: ${res.status} ${res.statusText} ${errorText}`,
  );
}

/**
 * 추천 병원 조회 API
 * @param {{ lat?: number, lng?: number, deptName?: string, symptomCode?: string }} params
 */
export async function getRecommendedHospitals(params = {}) {
  const searchParams = new URLSearchParams();

  // 1. 위경도 필수 체크 및 추가
  if (params.lat != null) searchParams.append("lat", params.lat);
  if (params.lng != null) searchParams.append("lng", params.lng);

  // 2. 검색 조건 추가 (deptName 또는 symptomCode)
  if (params.deptName) searchParams.append("deptName", params.deptName);
  if (params.symptomCode) searchParams.append("symptomCode", params.symptomCode);

  const url = `${BASE_URL}/api/hospitals/recommend?${searchParams.toString()}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      ...getAuthHeaders(), // 토큰 추가
    },
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
      ...getAuthHeaders(),
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
    headers: {
      ...getAuthHeaders(),
    },
  });

  return ensureOk(res, "병원 즐겨찾기 해제 실패");
}

/**
 * 병원 예약 생성
 * @param {number|string} hospitalId
 * @param {{
 * userId?: number,
 * patientName?: string,
 * phone?: string,
 * memo?: string,
 * reservedAt?: string,
 * symptomCodes?: string[],
 * symptomNames?: string[]
 * }} payload
 */
export async function createHospitalReservation(hospitalId, payload = {}) {
  const url = `${BASE_URL}/api/hospitals/${hospitalId}/reservations`;

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return ensureOk(res, "병원 예약 실패");
}

/**
 * 특정 병원 / 날짜의 예약 슬롯 조회
 */
export async function getHospitalReservationSlots(hospitalId, date) {
  const url = `${BASE_URL}/api/hospitals/${hospitalId}/reservations/slot?date=${date}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      ...getAuthHeaders(),
    },
  });

  return ensureOk(res, "예약 슬롯 조회 실패");
}

/**
 * 병원 리뷰 작성
 */
export async function createHospitalReview(hospitalId, payload = {}) {
  const url = `${BASE_URL}/api/hospitals/${hospitalId}/reviews`;

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return ensureOk(res, "병원 리뷰 작성 실패");
}