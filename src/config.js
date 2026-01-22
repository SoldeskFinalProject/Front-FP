import axios from "axios";

// API 기본 URL
const BASE_URL = "http://localhost:8080";

// axios 인스턴스 생성
export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * 요청 인터셉터: 모든 요청에 accessToken 자동 첨부
 */
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * 응답 인터셉터: 401(토큰 만료), 403(권한 없음) 처리
 */
api.interceptors.response.use(
    (response) => {
        // 정상 응답이면 그대로 통과
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // 1. 401 Unauthorized: 액세스 토큰 만료 시 재발급 시도
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // 무한 루프 방지

            try {
                const refreshToken = localStorage.getItem("refreshToken");
                if (!refreshToken) throw new Error("No refresh token available");

                // 토큰 재발급 요청 (순수 axios 사용)
                // 백엔드 엔드포인트: /api/auth/refresh (AUTH_ENDPOINTS 참고)
                const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {
                    refreshToken,
                });

                // 백엔드 응답 구조에 맞춰 디스트럭처링 (data 내부 확인 필요)
                const { accessToken, refreshToken: newRefreshToken } = response.data;

                // 1. 새 토큰 저장
                localStorage.setItem("accessToken", accessToken);
                if (newRefreshToken) {
                    localStorage.setItem("refreshToken", newRefreshToken);
                }

                // 2. 실패했던 요청의 헤더를 새 토큰으로 교체
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                // 3. api 인스턴스의 기본 헤더도 변경 (이후 요청을 위해)
                api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

                // 4. 실패했던 요청 재전송
                return api(originalRequest);

            } catch (refreshError) {
                // Refresh 실패 시 로그아웃 처리 및 이동
                console.error("토큰 갱신 실패:", refreshError);
                
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");
                
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        // 2. 403 Forbidden: 권한 부족 처리
        if (error.response?.status === 403) {
            alert("해당 메뉴에 대한 접근 권한이 없습니다.");
            window.location.href = "/";
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

/* ==========================================================================
   API Endpoints 정의
   ========================================================================== */

// 증상 및 카테고리 관련
export const CATEGORY_ENDPOINTS = {
    LIST: "/category",
    RECOMMEND: "/category/recommend",
    GROUPS: (categoryId) => `/category/${categoryId}/groups`,
    SYMPTOMS_BY_GROUP: (categoryId, groupId) => `/category/${categoryId}/groups/${groupId}/symptoms`,
    SEARCH: "/category/search",
    CUSTOM_LOG: "/category/custom",
};

// 의약품 관련
export const DRUG_ENDPOINTS = {
    SEARCH: "/api/drugs/search",
    PILL_SEARCH: "/api/drugs/appearances/search",
    DETAIL: (itemSeq) => `/api/drugs/item/${itemSeq}`,
};

// 질병 사전 관련
export const DISEASE_ENDPOINTS = {
    LIST: "/api/diseases",
    DETAIL: (id) => `/api/diseases/${id}`,
    CATEGORIES: "/api/diseases/categories",
};

// Q&A 커뮤니티 관련
export const QNA_ENDPOINTS = {
    QUESTIONS: "/api/question",
    QUESTION_DETAIL: (id) => `/api/question/${id}`,
    QUESTION_CREATE: "/api/question/create",
    QUESTION_UPDATE: (questionId) => `/api/question/${questionId}/update`,
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
};

// 인증 및 소셜 로그인
export const AUTH_ENDPOINTS = {
    SEND_EMAIL: "/api/auth/email/send",
    VERIFY_EMAIL: "/api/auth/email/verify",
    SIGNUP_USER: "/api/auth/signup/general",
    LOGIN: "/api/auth/login",
    KAKAO_LOGIN: "/api/social/kakao", // 소셜 로그인 엔드포인트 통합
    NAVER_LOGIN: "/api/social/naver",
    REFRESH: "/api/auth/refresh",
    LOGOUT: "/api/auth/logout",
};

// 사용자 정보
export const USER_ENDPOINTS = {
    ME: "/api/users/me",
    DETAIL: (id) => `/api/users/${id}`,
    UPDATE: (id) => `/api/users/${id}`,
    DELETE: (id) => `/api/users/${id}`,
};

// 전문 인력 인증/검증
export const VERIFICATION_ENDPOINTS = {
    NTS_VERIFY: "/api/verification/nts/verify",
    REQUEST_DOCTOR: "/api/verification/doctor/requests",
    REQUEST_HOSPITAL: "/api/verification/hospital/requests",
    MY_STATUS: "/api/verification/me",
};

// 관리자 전용
export const ADMIN_ENDPOINTS = {
    REQUESTS: "/api/admin/verification/requests",
    APPROVE: (requestId) => `/api/admin/verification/requests/${requestId}/approve`,
    REJECT: (requestId) => `/api/admin/verification/requests/${requestId}/reject`,
};

// 의사 및 병원 프로필
export const DOCTOR_ENDPOINTS = {
    BY_HOSPITAL: (hospitalId) => `/api/doctors/hospital/${hospitalId}`,
    PROFILE: (userId) => `/api/doctors/profile/${userId}`,
};

export const HOSPITAL_ENDPOINTS = {
    LIST: `/api/hospital-members`,
    SEARCH_HOSPITAL: "/api/hospitals/search",
    DETAIL: (hospitalMemberId) => `/api/hospital-members/${hospitalMemberId}`,
    MY_PROFILE: (userId) => `/api/hospital-members/profile/${userId}`,
};