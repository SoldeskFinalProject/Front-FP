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
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

// 응답 인터셉터: 401 에러 시 자동 토큰 재발급 등
api.interceptors.response.use(
    (response) => {
        // 정상 응답이면 그대로 통과
        return response
    },
    async (error) => {
        const originalRequest = error.config

        // 401 에러(토큰 만료)이고, 아직 재시도하지 않은 요청이라면
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true // 무한 루프 방지용 플래그 설정

        try {
            const refreshToken = localStorage.getItem("refreshToken")

            if (!refreshToken) {
                // 리프레시 토큰도 없으면 진짜 로그아웃
                throw new Error("No refresh token available")
            }

            // 🔥 [중요] 백엔드에 토큰 재발급 요청 (URL 확인 필요!)
            // 백엔드 컨트롤러에 만들어둔 토큰 재발급 주소를 적어야 합니다.
            // 예: /api/auth/reissue 또는 /api/auth/refresh
            const { data } = await axios.post("http://localhost:8080/api/auth/reissue", {
                accessToken: localStorage.getItem("accessToken"),
                refreshToken: refreshToken
            })

            // 백엔드 응답 구조에 맞춰 수정 필요 (예: data.accessToken)
            const newAccessToken = data.accessToken
            const newRefreshToken = data.refreshToken

            // 1. 새 토큰 저장
            localStorage.setItem("accessToken", newAccessToken)
            if (newRefreshToken) {
                localStorage.setItem("refreshToken", newRefreshToken)
            }

            // 2. 실패했던 요청의 헤더를 새 토큰으로 교체
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            
            // 3. api 인스턴스의 기본 헤더도 변경 (이후 요청을 위해)
            api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`

            // 4. 실패했던 요청 재전송 (사용자는 에러 났는지도 모르게 처리됨)
            return api(originalRequest)

        } catch (refreshError) {
            // 재발급 실패 (리프레시 토큰도 만료됨) -> 강제 로그아웃
            console.error("토큰 갱신 실패:", refreshError)
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
            
            // 로그인 페이지로 튕겨내기
            window.location.href = "/login"
            
            return Promise.reject(refreshError)
        }
        }

        return Promise.reject(error)
    },
)

// Category API 엔드포인트 (통합 버전)
export const CATEGORY_ENDPOINTS = {
    LIST: "/category",
    RECOMMEND: "/category/recommend", 
    GROUPS: (categoryId) => `/category/${categoryId}/groups`,
    SYMPTOMS_BY_GROUP: (categoryId, groupId) => `/category/${categoryId}/groups/${groupId}/symptoms`,
    SEARCH: "/category/search",
    CUSTOM_LOG: "/category/custom",
}

// Drug API 엔드포인트
export const DRUG_ENDPOINTS = {
    SEARCH: "/api/drugs/search",
    PILL_SEARCH: "/api/drugs/appearances/search",
    DETAIL: (itemSeq) => `/api/drugs/item/${itemSeq}`,
}

// Disease API 엔드포인트
export const DISEASE_ENDPOINTS = {
    LIST: "/api/diseases",
    DETAIL: (id) => `/api/diseases/${id}`,
    CATEGORIES: "/api/diseases/categories",
}

// Q&A API 엔드포인트
export const QNA_ENDPOINTS = {
    QUESTIONS: "/api/question",
    QUESTION_DETAIL: (id) => `/api/question/${id}`,
    QUESTION_CREATE: "/api/question/create",
    QUESTION_UPDATE: (questionId) => `/api/question/${questionId}/update`, // 대소문자 통일
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

// 인증 관련 엔드포인트
export const AUTH_ENDPOINTS = {
    SEND_EMAIL: "/api/auth/email/send",
    VERIFY_EMAIL: "/api/auth/email/verify",
    SIGNUP_USER: "/api/auth/signup/general",
    LOGIN: "/api/auth/login",

    KAKAO_LOGIN: "/api/social/kakao", // ✅ 카카오 추가
    NAVER_LOGIN: "/api/social/naver",

    REFRESH: "/api/auth/refresh",
    LOGOUT: "/api/auth/logout",
}

// 유저 관련
export const USER_ENDPOINTS = {
    ME: "/api/users/me",
    DETAIL: (id) => `/api/users/${id}`,
    UPDATE: (id) => `/api/users/${id}`,
    DELETE: (id) => `/api/users/${id}`,
}

// 인증/검증 관련
export const VERIFICATION_ENDPOINTS = {
    NTS_VERIFY: "/api/verification/nts/verify",
    REQUEST_DOCTOR: "/api/verification/doctor/requests",
    REQUEST_HOSPITAL: "/api/verification/hospital/requests",
    MY_STATUS: "/api/verification/me",
}

// 관리자 관련
export const ADMIN_ENDPOINTS = {
    REQUESTS: "/api/admin/verification/requests",
    APPROVE: (requestId) => `/api/admin/verification/requests/${requestId}/approve`,
    REJECT: (requestId) => `/api/admin/verification/requests/${requestId}/reject`,
}

// 의사/병원 프로필 관련
export const DOCTOR_ENDPOINTS = {
    BY_HOSPITAL: (hospitalId) => `/api/doctors/hospital/${hospitalId}`,
    PROFILE: (userId) => `/api/doctors/profile/${userId}`,
}

export const HOSPITAL_ENDPOINTS = {
    LIST: `/api/hospital-members`,
    SEARCH_HOSPITAL: "/api/hospitals/search",
    DETAIL: (hospitalMemberId) => `/api/hospital-members/${hospitalMemberId}`,
    MY_PROFILE: (userId) => `/api/hospital-members/profile/${userId}`,
}