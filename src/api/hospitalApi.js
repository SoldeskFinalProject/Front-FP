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
    } catch (error) {
      console.error("처리 실패", error)
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

// 임시 더미 데이터
export const getAllHospitals = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: "서울대학교병원",
          businessNumber: "123-45-67890",
          address: "서울특별시 종로구",
          phone: "02-1234-5678",
        },
        {
          id: 2,
          name: "연세의료원 세브란스병원",
          businessNumber: "234-56-78901",
          address: "서울특별시 서대문구",
          phone: "02-2345-6789",
        },
        {
          id: 3,
          name: "삼성서울병원",
          businessNumber: "345-67-89012",
          address: "서울특별시 강남구",
          phone: "02-3456-7890",
        },
      ])
    }, 500)
  })
}
