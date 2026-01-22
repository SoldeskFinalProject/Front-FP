import { api, AUTH_ENDPOINTS, ADMIN_ENDPOINTS } from "../config";

/**
 * 1. 일반 사용자 인증 (회원가입 / 로그인)
 */

// 회원가입 (주소 정보 포함)
export const signup = async (formData) => {
    const requestData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        zipcode: formData.zipcode || null,
        address: formData.address || null,
        addressDetail: formData.addressDetail || null,
    };

    const response = await api.post(AUTH_ENDPOINTS.SIGNUP_USER, requestData);
    return response.data;
};

// 로그인
export const login = async (credentials) => {
    const response = await api.post(AUTH_ENDPOINTS.LOGIN, credentials);
    return response.data; // { accessToken, refreshToken }
};

// 로그아웃
export const logout = async (refreshToken) => {
    const response = await api.post(AUTH_ENDPOINTS.LOGOUT, { refreshToken });
    return response.data;
};

/**
 * 2. 이메일 인증 관련
 */

// 인증 이메일 발송
export const sendVerificationEmail = async (email) => {
    const response = await api.post(AUTH_ENDPOINTS.SEND_EMAIL, { email });
    return response.data;
};

// 인증 코드 확인
export const verifyEmailCode = async (email, code) => {
    const response = await api.post(AUTH_ENDPOINTS.VERIFY_EMAIL, { email, code });
    return response.data;
};

/**
 * 3. 토큰 관리
 */

// 토큰 재발급
export const refreshToken = async (refreshToken) => {
    const response = await api.post(AUTH_ENDPOINTS.REFRESH, { refreshToken });
    return response.data; // { accessToken, refreshToken }
};

/**
 * 4. 소셜 로그인 (카카오 / 네이버)
 */

// 카카오 로그인
export const kakaoLogin = async (code) => {
    console.log("KAKAO_LOGIN =", AUTH_ENDPOINTS.KAKAO_LOGIN);
    if (!code) throw new Error("인가 코드(code)가 없습니다.");

    const { data } = await api.post(AUTH_ENDPOINTS.KAKAO_LOGIN, { code });
    return data;
};

// 네이버 로그인
export const naverLogin = async (code, state) => {
    if (!code) throw new Error("인가 코드(code)가 없습니다.");
    const response = await api.post(AUTH_ENDPOINTS.NAVER_LOGIN, { code, state });
    return response.data;
};

/**
 * 5. 관리자 기능 (인증 요청 승인/거절)
 */

// 관리자 승인 대기 목록 조회
export const getVerificationRequests = async (type, decision = "PENDING") => {
    const response = await api.get(ADMIN_ENDPOINTS.REQUESTS, {
        params: { type, decision },
    });
    return response.data;
};

// 관리자 인증 요청 승인
export const approveRequest = async (requestId) => {
    const response = await api.post(ADMIN_ENDPOINTS.APPROVE(requestId));
    return response.data;
};

// 관리자 인증 요청 거절
export const rejectRequest = async (requestId, reason) => {
    const response = await api.post(ADMIN_ENDPOINTS.REJECT(requestId), {
        adminReason: reason,
    });
    return response.data;
};