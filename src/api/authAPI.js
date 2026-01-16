import { api, AUTH_ENDPOINTS, ADMIN_ENDPOINTS } from "../config";

// 회원가입
export const signup = async (formData) => {
    const requestData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        zipcode: formData.zipcode || null,
        address: formData.address || null,
        addressDetail: formData.addressDetail || null,
    }

    const response = await api.post(AUTH_ENDPOINTS.SIGNUP_USER, requestData)
    return response.data
}

// 로그인
export const login = async (credentials) => {
    const response = await api.post(AUTH_ENDPOINTS.LOGIN, credentials)
    return response.data // { accessToken, refreshToken }
}

export const sendVerificationEmail = async (email) => {
    const response = await api.post(AUTH_ENDPOINTS.SEND_EMAIL, { email })
    return response.data
}

export const verifyEmailCode = async (email, code) => {
    const response = await api.post(AUTH_ENDPOINTS.VERIFY_EMAIL, { email, code })
    return response.data
}

export const refreshToken = async (refreshToken) => {
    const response = await api.post(AUTH_ENDPOINTS.REFRESH, { refreshToken })
    return response.data // { accessToken, refreshToken }
}

export const logout = async (refreshToken) => {
    const response = await api.post(AUTH_ENDPOINTS.LOGOUT, { refreshToken })
    return response.data
}

// 관리자 승인 대기 목록 조회
export const getVerificationRequests = async (type, decision = "PENDING") => {
    const response = await api.get(ADMIN_ENDPOINTS.REQUESTS, {
        params: { type, decision },
    })
    return response.data
}

// 관리자 인증 요청 승인
export const approveRequest = async (requestId) => {
    const response = await api.post(ADMIN_ENDPOINTS.APPROVE(requestId))
    return response.data
}

// 관리자 인증 요청 거절
export const rejectRequest = async (requestId, reason) => {
    const response = await api.post(ADMIN_ENDPOINTS.REJECT(requestId), {
        adminReason: reason,
    })
    return response.data;
}
