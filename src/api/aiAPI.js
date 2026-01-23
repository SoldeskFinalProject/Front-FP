// src/api/aiApi.js

// AI 서버 Base URL
const AI_BASE_URL = "http://192.168.4.14:8000";

/**
 * 1. 약물 검색 챗봇 (RAG)
 * POST /chat
 */
export const chatWithAiPharmacist = async (query) => {
  try {
    const response = await fetch(`${AI_BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data = await response.json();
    return data; // { status: "success", response: "..." }
  } catch (error) {
    console.error("AI 챗봇 통신 오류:", error);
    throw error;
  }
};

/**
 * 2. 증상 키워드 자동 감지 (Semantic Search)
 * POST /predict
 */
export const predictSymptom = async (query) => {
  try {
    const response = await fetch(`${AI_BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data = await response.json();
    return data; // { status: "success", symptom_ids: [1, 21], ... }
  } catch (error) {
    console.error("AI 증상 감지 오류:", error);
    return { status: "error", symptom_ids: [] }; // 에러 시 빈 배열 반환
  }
};