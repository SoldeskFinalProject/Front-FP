// src/api/drugAPI.js
import { api, DRUG_ENDPOINTS } from "../config"; // 상수 import

// [일반 검색] 이름으로 약품 검색
export const fetchDrugs = async (itemName, page = 0, size = 10) => {
  try {
    // 변경: "/api/drugs/search" -> DRUG_ENDPOINTS.SEARCH
    const response = await api.get(DRUG_ENDPOINTS.SEARCH, {
      params: { itemName, page, size },
    });
    return response.data; 
  } catch (error) {
    console.error("약품 검색 실패:", error);
    throw error;
  }
};

// [낱알 검색] 모양/색상으로 약품 검색
export const searchPills = async (condition, page = 0, size = 10) => {
    try {
        // 변경: "/api/drugs/appearances/search" -> DRUG_ENDPOINTS.PILL_SEARCH
        const response = await api.get(DRUG_ENDPOINTS.PILL_SEARCH, {
            params: { ...condition, page, size }
        });
        return response.data;
    } catch (error) {
        console.error("모양 검색 실패:", error);
        throw error;
    }
};

// [상세 정보] 약품 ID로 상세 정보 조회
export const fetchDrugDetail = async (itemSeq) => {
    try {
        // 변경: `/api/drugs/item/${itemSeq}` -> DRUG_ENDPOINTS.DETAIL(itemSeq)
        const response = await api.get(DRUG_ENDPOINTS.DETAIL(itemSeq));
        return response.data;
    } catch (error) {
        console.error("상세 정보 조회 실패", error);
        throw error;
    }
};