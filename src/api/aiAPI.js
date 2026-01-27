// src/api/aiAPI.js

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
}; // 👈 여기서 predictSymptom 함수를 닫아줘야 합니다! (이 부분이 누락되었었습니다)

/**
 * 3. [NEW] 증상 이미지 분석 (Vision AI)
 * POST /predict/image
 * Content-Type: multipart/form-data
 */
export const predictImageSymptom = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("file", imageFile); // 백엔드에서 요구한 key 이름 'file'

    const response = await fetch(`${AI_BASE_URL}/predict/image`, {
      method: "POST",
      // fetch 사용 시 FormData는 Content-Type 헤더를 설정하지 않아야 함 (자동 설정)
      body: formData,
    });
    return await response.json();
  } catch (error) {
    console.error("AI 이미지 분석 오류:", error);
    return { status: "error", type: "error", message: "서버 연결에 실패했습니다." };
  }
};