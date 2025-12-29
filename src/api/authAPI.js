import { api, AUTH_ENDPOINTS, ADMIN_ENDPOINTS } from "../config"

// 회원가입
export const signup = async (formData) => {
    const requestData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        // 필요한 경우 nickname, phoneNumber 등 추가
        // address 정보는 이제 선택 사항이거나 회원정보 수정에서 처리
    };

    const response = await api.post(AUTH_ENDPOINTS.SIGNUP_USER, requestData);
    return response.data;
};

// 로그인
export const login = async (credentials) => {
    const response = await api.post(AUTH_ENDPOINTS.LOGIN, credentials);
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

// 관리자. 인증 요청 거절
export const rejectRequest = async (requestId, reason) => {
    const response = await api.post(ADMIN_ENDPOINTS.REJECT(requestId), {
        adminReason: reason,
    })
    return response.data;
}

// 병원 목록 조회
export const getAllHospitals = async () => {
    const response = await api.get(AUTH_ENDPOINTS.HOSPITALS)
    return response.data
}
