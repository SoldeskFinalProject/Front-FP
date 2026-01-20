// src/api/hospitalApi.js

// 백엔드 기본 URL
const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

// 로컬 스토리지에 저장된 토큰 키 이름 (실제 저장되는 키 이름으로 확인 필요)
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
 */
export async function getRecommendedHospitals(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.lat != null) searchParams.append("lat", params.lat);
  if (params.lng != null) searchParams.append("lng", params.lng);
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
      ...getAuthHeaders(), // 토큰 추가
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
      ...getAuthHeaders(), // 토큰 추가
    },
  });

  return ensureOk(res, "병원 즐겨찾기 해제 실패");
}

/**
 * 병원 예약 생성
 */
export async function createHospitalReservation(hospitalId, payload = {}) {
  const url = `${BASE_URL}/api/hospitals/${hospitalId}/reservations`;

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(), // 토큰 추가
    },
    body: JSON.stringify(payload),
  });

  return ensureOk(res, "병원 예약 실패");
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
      ...getAuthHeaders(), // 토큰 추가
    },
    body: JSON.stringify(payload),
  });

  return ensureOk(res, "병원 리뷰 작성 실패");
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
      ...getAuthHeaders(), // 토큰 추가
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `예약 슬롯 조회 실패: ${res.status} ${res.statusText} ${text}`,
    );
  }

  return res.json();
}