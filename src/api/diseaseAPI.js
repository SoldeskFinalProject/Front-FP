// src/api/diseaseAPI.js
import { api } from "../config";

// 1. 질병 목록 검색 (키워드 + 카테고리)
export const fetchDiseases = async (keyword, category, page = 0, size = 10) => {
  try {
    const params = { page, size };
    if (keyword) params.keyword = keyword;
    if (category && category !== "전체") params.category = category;

    const response = await api.get("/api/diseases", { params });
    return response.data; // PageResponseDto
  } catch (error) {
    console.error("질병 검색 실패:", error);
    throw error;
  }
};

// 2. 질병 상세 정보 조회
export const fetchDiseaseDetail = async (diseaseId) => {
  try {
    const response = await api.get(`/api/diseases/${diseaseId}`);
    return response.data;
  } catch (error) {
    console.error("질병 상세 조회 실패:", error);
    throw error;
  }
};

// 3. 카테고리 목록 조회 (검색 필터용)
export const fetchCategories = async () => {
  try {
    const response = await api.get("/api/diseases/categories");
    return response.data; // List<String>
  } catch (error) {
    console.error("카테고리 조회 실패:", error);
    return [];
  }
};