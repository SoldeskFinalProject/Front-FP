// src/api/hospitalApi.js

// 백엔드 기본 URL
const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

// 로컬 스토리지에 저장된 토큰 키 이름
const TOKEN_KEY = "accessToken";

/**
 * 인증 헤더 생성
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * 공통 응답 처리
 * - JSON이든 빈 바디든 안전하게 처리
 * - 에러 시 body(message/json/text) 최대한 보여주기
 */
async function ensureOk(res, defaultErrorMessage) {
  const text = await res.text().catch(() => "");

  if (res.ok) {
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch (e) {
      // 서버가 JSON이 아닌 text를 줄 수도 있으니 그대로 반환
      return text;
    }
  }

  // 에러 본문 파싱(가능하면 message 추출)
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
 * 추천 병원 조회
 * GET /api/hospitals/recommend?lat=&lng=&deptName=&symptomCode=
 */
export async function getRecommendedHospitals(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.lat != null) searchParams.append("lat", params.lat);
  if (params.lng != null) searchParams.append("lng", params.lng);
  if (params.deptName) searchParams.append("deptName", params.deptName);
  if (params.symptomCode) searchParams.append("symptomCode", params.symptomCode);

  const url = `${BASE_URL}/api/hospitals/recommend?${searchParams.toString()}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      ...getAuthHeaders(),
    },
  });

  return ensureOk(res, "추천 병원 조회 실패");
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
 * 병원 예약 생성
 * POST /api/hospitals/{hospitalId}/reservations
 * body: { userId, patientName, phone, memo, reservedAt }
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
 * 예약 슬롯 조회
 * GET /api/hospitals/{hospitalId}/reservations/slot?date=YYYY-MM-DD
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

/* =========================================================================
 * ✅ 3) (표시용) 병원 요약 조회
 * ========================================================================= */

/**
 * 병원 요약 정보 조회 (예약 페이지 상단 표시용)
 * GET /api/hospitals/{hospitalId}/summary
 *
 * ⚠️ 지금 백엔드에 이 API가 없으면 404가 납니다.
 *    → 백엔드에 컨트롤러/서비스/DTO 추가해야 합니다.
 *
 * Response 권장:
 * {
 *   hospitalId,
 *   dutyName,
 *   dutyAddr,
 *   dutyTel1,
 *   ratingAvg,
 *   reviewCount
 * }
 */
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
 * ✅ 4) B 방식: 리뷰 컨텍스트 + 예약ID 기반 리뷰 작성
 * ========================================================================= */

/**
 * 리뷰 컨텍스트 조회
 * GET /api/hospitals/reservations/{reservationId}/review-context?userId=xx
 *
 * Response 예시:
 * {
 *   reservationId, status, reviewed,
 *   hospitalId, hospitalName,
 *   reservedAt, patientName
 * }
 */
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

/**
 * 리뷰 작성 (예약ID 기반, B 방식)
 * POST /api/hospitals/reviews
 * payload: { userId, reservationId, rating, content }
 */
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
