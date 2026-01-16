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

// 요청 인터셉터: 모든 요청에 accessToken 자동 첨부
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("accessToken")
        if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

// 응답 인터셉터: 401 에러 시 자동 토큰 재발급, 403 에러 처리
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // 401 Unauthorized: 토큰 만료 -> refresh 시도
        if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
            const refreshToken = localStorage.getItem("refreshToken")
            if (!refreshToken) {
            throw new Error("No refresh token")
            }

            // 토큰 재발급 요청
            const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {
            refreshToken,
            })

            const { accessToken, refreshToken: newRefreshToken } = response.data

            // 새 토큰 저장
            localStorage.setItem("accessToken", accessToken)
            localStorage.setItem("refreshToken", newRefreshToken)

            // 원래 요청 재시도
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return api(originalRequest)
        } catch (refreshError) {
            // refresh 실패 -> 로그아웃 처리
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
            localStorage.removeItem("user")
            window.location.href = "/login"
            return Promise.reject(refreshError)
        }
        }

        // 403 Forbidden: 권한 없음
        if (error.response?.status === 403) {
        alert("접근 권한이 없습니다.")
        window.location.href = "/"
        return Promise.reject(error)
        }

        return Promise.reject(error)
    },
)

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
    SEARCH: "/api/drugs/search",                    // 이름 검색
    PILL_SEARCH: "/api/drugs/appearances/search",   // 낱알(모양) 검색
    DETAIL: (itemSeq) => `/api/drugs/item/${itemSeq}`, // 약품 상세 정보
}

// Disease API 엔드포인트 
export const DISEASE_ENDPOINTS = {
    LIST: "/api/diseases",              // 목록 조회 (GET), 등록 (POST)
    DETAIL: (id) => `/api/diseases/${id}`, // 상세 조회 (GET), 수정 (PUT), 삭제 (DELETE)
    CATEGORIES: "/api/diseases/categories", // 카테고리 목록
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
    // 이메일 인증
    SEND_EMAIL: "/api/auth/email/send",
    VERIFY_EMAIL: "/api/auth/email/verify",

    // 회원가입 및 로그인
    SIGNUP_USER: "/api/auth/signup/general",
    LOGIN: "/api/auth/login",

    // 토큰 관리
    REFRESH: "/api/auth/refresh",
    LOGOUT: "/api/auth/logout",
}

// 유저 공통 - 로그인 후 사용
export const USER_ENDPOINTS = {
    // 내 기본 정보 조회 (params: userId)
    ME: "/api/users/me",

    // 특정 유저 조회 (관리자/테스트용)
    DETAIL: (id) => `/api/users/${id}`,

    // 회원 정보 수정
    UPDATE: (id) => `/api/users/${id}`,

    // 회원 탈퇴
    DELETE: (id) => `/api/users/${id}`,
}

// 인증 요청 및 검증 (Verification)
export const VERIFICATION_ENDPOINTS = {
    NTS_VERIFY: "/api/verification/nts/verify",             // 사업자 진위 확인
    REQUEST_DOCTOR: "/api/verification/doctor/requests",    // 의사 인증 요청 생성
    REQUEST_HOSPITAL: "/api/verification/hospital/requests", // 병원 인증 요청 생성
    MY_STATUS: "/api/verification/me",      // 공통. 내 인증 상태 조회
}

// 관리자 관련 엔드포인트 추가
export const ADMIN_ENDPOINTS = {
    REQUESTS: "/api/admin/verification/requests",
    APPROVE: (requestId) => `/api/admin/verification/requests/${requestId}/approve`,
    REJECT: (requestId) => `/api/admin/verification/requests/${requestId}/reject`,
}

// '의사' 관련 엔드포인트
export const DOCTOR_ENDPOINTS = {
    // 병원 상세 페이지 - 병원별 의사 목록
    BY_HOSPITAL: (hospitalId) => `/api/doctors/hospital/${hospitalId}`,

    // 내 의사 프로필 조회 (userId 기준)
    PROFILE: (userId) => `/api/doctors/profile/${userId}`,
}

// '병원' 관련 엔드포인트
export const HOSPITAL_ENDPOINTS = {
    // 병원 관계자 전체 목록 (관리 / 테스트용)
    LIST: `/api/hospital-members`,
    
    SEARCH_HOSPITAL: "api/hospitals/search",

    // 병원 관계자 상세 조회
    DETAIL: (hospitalMemberId) => `/api/hospital-members/${hospitalMemberId}`,

    // (로그인된) 내 병원 관리자 프로필 조회
    MY_PROFILE: (userId) => `/api/hospital-members/profile/${userId}`,
}