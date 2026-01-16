import { api, CATEGORY_ENDPOINTS } from "../config"

// 1. 카테고리 및 증상 목록 전체 조회
// GET /category
export const fetchCategories = async () => {
  try {
    const response = await api.get(CATEGORY_ENDPOINTS.LIST)
    return response.data; 
    // 예상 응답: [{ categoryId: 1, categoryName: "머리", symptoms: [...] }, ...]
  } catch (error) {
    console.error("❌ 카테고리 로드 실패:", error.response?.data || error.message)
    throw error
  }
}

// 2. 진료과 추천 요청
// POST /category/recommend
export const getRecommendation = async (symptomIds) => {
  try {
    // 백엔드 요구사항: ID 배열 전송 (예: [1, 5, 12])
    const response = await api.post(CATEGORY_ENDPOINTS.RECOMMEND, symptomIds)
    return response.data; 
    // 예상 응답: ["이비인후과", "내과", ...]
  } catch (error) {
    console.error("❌ 추천 요청 실패:", error.response?.data || error.message)
    throw error
  }
}