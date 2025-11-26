import axios from "axios"

// 📍 API 기본 URL
const BASE_URL = "http://localhost:8080"

// 📍 axios 인스턴스 생성
export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

// 📍 API 엔드포인트 정리
export const CATEGORY_ENDPOINTS = {
    LIST: "/category", // 전체 카테고리 조회
    GROUPS: (categoryId) => `/category/${categoryId}/groups`, // 카테고리별 그룹 조회
    SYMPTOMS_BY_GROUP: (categoryId, groupId) => `/category/${categoryId}/groups/${groupId}/symptoms`, // 그룹별 증상 조회
    SEARCH: "/category/search", // 키워드로 증상 검색
    CUSTOM_LOG: "/category/custom", // 사용자 증상 입력 (symptom_log)
}

// 📍 Q&A API 엔드포인트
export const QNA_ENDPOINTS = {
    QUESTIONS: "/api/question",
    QUESTION_DETAIL: (id) => `/api/question/${id}`,
    QUESTION_CREATE: "/api/question/create",
    QUESTION_DELETE: (id) => `/api/question/${id}`,
    QUESTION_STATUS: (id) => `/api/question/${id}/status`,
    QUESTION_ACCEPT: (questionId, answerId) => `/api/question/${questionId}/accept/${answerId}`,
    ANSWERS: "/api/answer",
    ANSWER_CREATE: "/api/answer",
}
