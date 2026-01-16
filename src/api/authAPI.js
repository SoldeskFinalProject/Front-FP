import { api, AUTH_ENDPOINTS, ADMIN_ENDPOINTS } from "../config";

// 회원가입 (주소 정보 포함된 최신 버전 유지)
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

// 이메일 인증 관련
export const sendVerificationEmail = async (email) => {
  const response = await api.post(AUTH_ENDPOINTS.SEND_EMAIL, { email });
  return response.data;
};

export const verifyEmailCode = async (email, code) => {
  const response = await api.post(AUTH_ENDPOINTS.VERIFY_EMAIL, { email, code });
  return response.data;
};

// 토큰 관리
export const refreshToken = async (refreshToken) => {
  const response = await api.post(AUTH_ENDPOINTS.REFRESH, { refreshToken });
  return response.data; // { accessToken, refreshToken }
};

export const logout = async (refreshToken) => {
  const response = await api.post(AUTH_ENDPOINTS.LOGOUT, { refreshToken });
  return response.data;
};

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

/**
 * ✅ 카카오 로그인 (최종형태)
 * - KakaoCallbackPage에서 받은 "인가 코드(code)"를 백엔드로 전달
 * - 백엔드가 code → 카카오 토큰 교환 + 사용자 조회/가입 + 우리 JWT 발급
 */
export const kakaoLogin = async (code) => {
  console.log("KAKAO_LOGIN =", AUTH_ENDPOINTS.KAKAO_LOGIN);
  if (!code) throw new Error("인가 코드(code)가 없습니다.");

  const { data } = await api.post(AUTH_ENDPOINTS.KAKAO_LOGIN, { code });
  return data;
};
