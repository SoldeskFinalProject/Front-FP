// src/api/drugAPI.js
import { api } from "../config"; 

// [일반 검색] 이름으로 약품 검색
export const fetchDrugs = async (itemName, page = 0, size = 10) => {
  try {
    const response = await api.get("/api/drugs/search", {
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
        // condition: { shape, color, formulation, line, print ... }
        const response = await api.get("/api/drugs/appearances/search", {
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
        const response = await api.get(`/api/drugs/item/${itemSeq}`);
        return response.data;
    } catch (error) {
        console.error("상세 정보 조회 실패", error);
        throw error;
    }
};