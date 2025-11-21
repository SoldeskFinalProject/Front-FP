// src/api/drugAPI.js
import { api } from "../config"; 

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

export const fetchDrugDetail = async (id) => {
    try {
        const response = await api.get(`/api/drugs/${id}`);
        return response.data;
    } catch (error) {
        console.error("상세 정보 조회 실패", error);
        throw error;
    }
}