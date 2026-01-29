// src/api/hospitalApi.js
import { api } from "../config";
// 백엔드 기본 URL
const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

// 로컬 스토리지에 저장된 토큰 키 이름
const TOKEN_KEY = "accessToken";

/**
 * 인증 헤더 생성
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken"); 
  
  return token 
    ? { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json" 
      } 
    : { "Content-Type": "application/json" };
};

/**
 * 공통 응답 처리
 */
async function ensureOk(res, defaultErrorMessage) {
  const text = await res.text().catch(() => "");

  if (res.ok) {
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  }

  let detail = text;
  try {
    const parsed = text ? JSON.parse(text) : null;
    if (parsed && typeof parsed === "object") {
      detail = parsed.message || parsed.error || text;
    }
  } catch (_) {}

  throw new Error(
    `${defaultErrorMessage}: ${res.status} ${res.statusText} ${detail || ""}`
  );
}

/* =========================================================================
 * ✅ 1) 병원 추천 / 즐겨찾기
 * ========================================================================= */

/**
 * 추천 병원 조회 (수정됨)
 * GET /api/hospitals/search?lat=&lng=&keyword=&userId=
 * - 기존 /recommend 대신 즐겨찾기 로직이 포함된 /search 를 사용합니다.
 */
export async function getRecommendedHospitals(params = {}) {
  const searchParams = new URLSearchParams();

  // 1. 위치 정보
  if (params.lat != null) searchParams.append("lat", params.lat);
  if (params.lng != null) searchParams.append("lng", params.lng);
  
  // 2. 검색어 (백엔드 HospitalSearchController의 @RequestParam "keyword"에 맞춤)
  const keyword = params.deptName || params.symptomCode || "";
  searchParams.append("keyword", keyword);
  
  // 3. ✅ 핵심: 즐겨찾기 상태 유지를 위해 userId 추가 (백엔드 파라미터명 userId)
  if (params.userId) {
    searchParams.append("userId", String(params.userId));
  }

  // 4. 페이징 (SearchController는 Page 객체를 반환하므로 기본값 설정)
  searchParams.append("page", params.page || 0);
  searchParams.append("size", params.size || 20);

  // ✅ 엔드포인트를 /recommend 에서 /search 로 변경
  const url = `${BASE_URL}/api/hospitals/search?${searchParams.toString()}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      ...getAuthHeaders(),
    },
  });

  const data = await ensureOk(res, "추천 병원 조회 실패");
  
  // ✅ Page 객체의 content 배열을 반환하거나 데이터 그대로 반환
  return data.content || data;
}

/**
 * 병원 즐겨찾기 추가
 * POST /api/hospitals/{hospitalId}/favorite?userId=
 * (현재 백엔드가 @RequestParam userId 요구)
 */
export async function addHospitalFavorite(hospitalId, userId) {
  const url = new URL(`${BASE_URL}/api/hospitals/${hospitalId}/favorite`);
  if (userId != null) url.searchParams.set("userId", String(userId));

  const res = await fetch(url.toString(), {
    method: "POST",
    credentials: "include",
    headers: {
      ...getAuthHeaders(),
    },
  });

  return ensureOk(res, "병원 즐겨찾기 추가 실패");
}

/**
 * 병원 즐겨찾기 해제
 * DELETE /api/hospitals/{hospitalId}/favorite?userId=
 */
export async function removeHospitalFavorite(hospitalId, userId) {
  const url = new URL(`${BASE_URL}/api/hospitals/${hospitalId}/favorite`);
  if (userId != null) url.searchParams.set("userId", String(userId));

  const res = await fetch(url.toString(), {
    method: "DELETE",
    credentials: "include",
    headers: {
      ...getAuthHeaders(),
    },
  });

  return ensureOk(res, "병원 즐겨찾기 해제 실패");
}

/* =========================================================================
 * ✅ 2) 예약
 * ========================================================================= */

/**
 * 내가 즐겨찾기한 병원 목록 조회
 */
export async function getMyFavoriteHospitals(userId) {
  const url = `${BASE_URL}/api/hospitals/user/${userId}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { ...getAuthHeaders() },
  });
  return ensureOk(res, "즐겨찾기 목록 조회 실패");
}

/* =========================================================================
 * ✅ 2) 예약
 * ========================================================================= */

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

/* =========================================================================
 * ✅ 3) 병원 요약 조회
 * ========================================================================= */

export async function getHospitalSummary(hospitalId) {
  const url = `${BASE_URL}/api/hospitals/${hospitalId}/summary`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      ...getAuthHeaders(),
    },
  });

  return ensureOk(res, "병원 요약 정보 조회 실패");
}

/* =========================================================================
 * ✅ 4) 리뷰 관리
 * ========================================================================= */

export async function getReviewContext(reservationId, userId) {
  const url = new URL(
    `${BASE_URL}/api/hospitals/reservations/${reservationId}/review-context`
  );
  if (userId != null) url.searchParams.set("userId", String(userId));

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      ...getAuthHeaders(),
    },
  });

  return ensureOk(res, "리뷰 컨텍스트 조회 실패");
}

export async function createReviewByReservation(payload = {}) {
  const url = `${BASE_URL}/api/hospitals/reviews`;

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return ensureOk(res, "리뷰 작성 실패");
}

export const searchHospitalsForVerification = async ({ keyword = "", page = 0, size = 10 }) => {
  const res = await api.get("/api/hospitals/verification/search", {
    params: { keyword, page, size },
  });
  return res.data; // Spring Page 형태
};
