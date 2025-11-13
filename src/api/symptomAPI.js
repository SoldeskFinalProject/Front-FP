import { api, CATEGORY_ENDPOINTS } from "../config"

// ✅ 전체 카테고리 조회
// GET /category
export const getAllCategories = async () => {
  try {
    const response = await api.get(CATEGORY_ENDPOINTS.LIST)
    return response.data
  } catch (error) {
    console.error("❌ 카테고리 전체 조회 오류:", error.response?.data || error.message)
    throw error
  }
}

// ✅ 특정 카테고리의 그룹 목록 조회
// GET /category/{categoryId}/groups
export const getGroupsByCategory = async (categoryId) => {
  try {
    const response = await api.get(CATEGORY_ENDPOINTS.GROUPS(categoryId))
    return response.data
  } catch (error) {
    console.error(`❌ ${categoryId}번 카테고리의 그룹 조회 오류:`, error.response?.data || error.message)
    throw error
  }
}

// ✅ 특정 그룹의 증상 목록 조회
// GET /category/{categoryId}/groups/{groupId}/symptoms
export const getSymptomsByGroup = async (categoryId, groupId) => {
  try {
    const response = await api.get(CATEGORY_ENDPOINTS.SYMPTOMS_BY_GROUP(categoryId, groupId))
    return response.data
  } catch (error) {
    console.error(
      `❌ 카테고리(${categoryId}) 그룹(${groupId})의 증상 조회 오류:`,
      error.response?.data || error.message,
    )
    throw error
  }
}

// ✅ 키워드로 증상 검색
// GET /category/search?keyword=기침
export const searchSymptoms = async (keyword) => {
  try {
    const response = await api.get(CATEGORY_ENDPOINTS.SEARCH, {
      params: { keyword },
    })
    return response.data
  } catch (error) {
    console.error("❌ 증상 키워드 검색 오류:", error.response?.data || error.message)
    throw error
  }
}

// ✅ 사용자 증상 입력 로그 저장 (symptom_log)
// POST /category/custom
export const addUserInput = async (data) => {
  try {
    const response = await api.post(CATEGORY_ENDPOINTS.CUSTOM_LOG, data)
    return response.data
  } catch (error) {
    console.error("❌ 사용자 입력 로그 저장 오류:", error.response?.data || error.message)
    throw error
  }
}
