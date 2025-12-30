// src/api/diseaseAdminAPI.js
import { api } from "../config";

// --- 질병 백과사전 관리자 기능 (등록/수정/삭제) ---

// 1. 질병 등록
export const createDisease = async (diseaseData) => {
  // 백엔드: POST /api/diseases
  const response = await api.post("/api/diseases", diseaseData);
  return response.data;
};

// 2. 질병 수정
export const updateDisease = async (diseaseId, diseaseData) => {
  // 백엔드: PUT /api/diseases/{id}
  const response = await api.put(`/api/diseases/${diseaseId}`, diseaseData);
  return response.data;
};

// 3. 질병 삭제
export const deleteDisease = async (diseaseId) => {
  // 백엔드: DELETE /api/diseases/{id}
  const response = await api.delete(`/api/diseases/${diseaseId}`);
  return response.data;
};

// 4. 질병 단건 조회 (수정 폼 채우기용)
export const getAdminDiseaseDetail = async (diseaseId) => {
  // 백엔드: GET /api/diseases/{id}
  const response = await api.get(`/api/diseases/${diseaseId}`);
  return response.data;
};