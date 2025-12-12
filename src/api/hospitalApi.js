// src/api/hospitalApi.js

// 백엔드 기본 URL
// 필요하면 VITE_BACKEND_URL 환경변수로 빼서 쓰셔도 됩니다.
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
  if (params.symptomCode) searchParams.append("symptomCode", params.symptomCode);

  const url = `${BASE_URL}/api/hospitals/recommend?${
    searchParams.toString()
  }`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include", // 로그인 쿠키 쓰시면 유지
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `추천 병원 조회 실패: ${res.status} ${res.statusText} ${text}`
    );
  }

  return res.json();
}
