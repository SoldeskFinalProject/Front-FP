import axios from "axios";

// API 기본 URL
const BASE_URL = "http://localhost:8080";

// axios 인스턴스 생성
export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
})

// 📍 API 엔드포인트 정리
export const CATEGORY_ENDPOINTS = {
    LIST: "/category", // 전체 카테고리 조회
    SYMPTOMS: (categoryId) => `/category/${categoryId}/symptoms`, // 특정 카테고리의 증상 조회
};

export const SYMPTOM_ENDPOINTS = {
    SEARCH: "symptoms/search", // 키워드로 증상 검색
};

export const DRUG_ENDPOINTS = {
    SEARCH: "/api/drugs/search", // 약품 키워드 검색
};