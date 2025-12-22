import axios from "axios"

// API 기본 URL
const BASE_URL = "http://localhost:8080"

// axios 인스턴스 생성
export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

// Category API 엔드포인트
export const CATEGORY_ENDPOINTS = {
    LIST: "/category", // 전체 카테고리 조회
    GROUPS: (categoryId) => `/category/${categoryId}/groups`, // 카테고리별 그룹 조회
    SYMPTOMS_BY_GROUP: (categoryId, groupId) => `/category/${categoryId}/groups/${groupId}/symptoms`, // 그룹별 증상 조회
    SEARCH: "/category/search", // 키워드로 증상 검색
    CUSTOM_LOG: "/category/custom", // 사용자 증상 입력 (symptom_log)
}

// Drug API 엔드포인트
export const DRUG_ENDPOINTS = {
    SEARCH: "/api/drugs/search", // 약품 키워드 검색
}

// Q&A API 엔드포인트
export const QNA_ENDPOINTS = {
    QUESTIONS: "/api/question",
    QUESTION_DETAIL: (id) => `/api/question/${id}`,
    QUESTION_CREATE: "/api/question/create",
    Question_UPDATE: (questionId) => `/api/question/${questionId}/update`,
    QUESTION_DELETE: (id) => `/api/question/${id}`,
    QUESTION_STATUS: (id) => `/api/question/${id}/status`,
    QUESTION_ACCEPT: (questionId, answerId) => `/api/question/${questionId}/accept/${answerId}`,
    ANSWERS: "/api/answer",
    ANSWER_CREATE: (questionId) => `/api/answer?questionId=${questionId}`,
    ANSWER_UPDATE: (answerId) => `/api/answer/${answerId}`,
    ANSWER_DELETE: (answerId) => `/api/answer/${answerId}`,
    COMMENTS: "/api/comments",
    COMMENTS_BY_ANSWER: (answerId) => `/api/comments/answer/${answerId}`,
    COMMENT_UPDATE: (commentId) => `/api/comments/${commentId}`,
    COMMENT_DELETE: (commentId) => `/api/comments/${commentId}`,
}

// 인증 관련 엔드포인트 추가
export const AUTH_ENDPOINTS = {
    SIGNUP_USER: "/api/auth/signup",
    SIGNUP_DOCTOR: "/api/auth/signup/doctor",
    SIGNUP_HOSPITAL: "/api/auth/signup/hospital",
    LOGIN: "/api/auth/login",
    HOSPITALS: "/api/hospitals",
}

// 관리자 관련 엔드포인트 추가
export const ADMIN_ENDPOINTS = {
    PENDING_DOCTORS: "/api/admin/doctors/pending", // 승인 대기 의사 목록
    PENDING_HOSPITALS: "/api/admin/hospitals/pending", // 승인 대기 병원 목록
    APPROVE_DOCTOR: (doctorId) => `/api/admin/doctors/${doctorId}/approve`, // 의사 승인
    APPROVE_HOSPITAL: (hospitalId) => `/api/admin/hospitals/${hospitalId}/approve`, // 병원 승인
}

// '의사' 관련 엔드포인트 
export const DOCTOR_ENDPOINTS = {
    // 병원 상세 페이지 - 병원별 의사 목록
    BY_HOSPITAL: (hospitalId) => `/api/doctors/hospital/${hospitalId}`,

    // 특정 의사 상세 조회
    DETAIL: (doctorId) => `/api/doctors/${doctorId}`,

    // 내 의사 프로필 조회 (userId 기준)
    PROFILE: (userId) => `/api/doctors/profile/${userId}`,
}

// '병원' 관련 엔드포인트
export const HOSPITAL_ENDPOINTS = {
    // 병원 관계자 전체 목록 (관리 / 테스트용)
    LIST: `/api/hospital-members`,

    // 병원 관계자 상세 조회
    DETAIL: (hospitalMemberId) => `/api/hospital-members/${hospitalMemberId}`,
}