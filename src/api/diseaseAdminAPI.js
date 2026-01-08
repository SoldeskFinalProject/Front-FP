// src/api/diseaseAdminAPI.js
import { api, DISEASE_ENDPOINTS } from "../config";

// --- 질병 백과사전 관리자 기능 (등록/수정/삭제) ---

// 1. 질병 등록
export const createDisease = async (diseaseData) => {
  const response = await api.post(DISEASE_ENDPOINTS.LIST, diseaseData);
  return response.data;
};

// 2. 질병 수정
export const updateDisease = async (diseaseId, diseaseData) => {
  const response = await api.put(DISEASE_ENDPOINTS.DETAIL(diseaseId), diseaseData);
  return response.data;
};

// 3. 질병 삭제
export const deleteDisease = async (diseaseId) => {
  const response = await api.delete(DISEASE_ENDPOINTS.DETAIL(diseaseId));
  return response.data;
};

// 4. 질병 단건 조회 (수정 폼 채우기용)
export const getAdminDiseaseDetail = async (diseaseId) => {
  const response = await api.get(DISEASE_ENDPOINTS.DETAIL(diseaseId));
  return response.data;
};