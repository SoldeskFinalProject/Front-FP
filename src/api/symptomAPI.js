import { api, CATEGORY_ENDPOINTS, SYMPTOM_ENDPOINTS } from "../config";

// 전체 카테고리 조회
// GET /category
export const getAllCategories = async () => {
    try {
        const response = await api.get(CATEGORY_ENDPOINTS.LIST);
        return response.data;
    } catch (error) {
        console.error("❌ 카테고리 전체 조회 오류:", error.response?.data || error.message);
        throw error;
    }
}

// 특정 카테고리 증상 조회
// GET /category/{categoryId}/symptoms
export const getSymptomByCategory = async (categoryId) => {
    try {
        const response = await api.get(CATEGORY_ENDPOINTS.SYMPTOMS(categoryId));
        return response.data;
    } catch (error) {
        console.error(`❌ ${categoryId}번 카테고리의 증상 조회 오류:`, error.response?.data || error.message);
        throw error;
    }
}

// 키워드로 증상 조회
//GET /symptoms/search?keyword=기침
export const searchSymptoms = async (keyword) => {
    try {
        const response = await api.get(SYMPTOM_ENDPOINTS.SEARCH, {
            params: { keyword },
        });
        return response.data;
    } catch (error) {
        console.error("증상 키워드 검색 오류 : ", error.response?.data || error.message);
    }
}