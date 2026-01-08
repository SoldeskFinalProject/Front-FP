import { api, USER_ENDPOINTS, VERIFICATION_ENDPOINTS, HOSPITAL_ENDPOINTS } from "../config";

// 내 정보 조회
export const getMyInfo = async (userId) => {
    const response = await api.get(USER_ENDPOINTS.ME, {
        params: { userId },
    });
    return response.data;
}

// 정보 수정
export const updateUserInfo = async (userId, data) => {
    const response = await api.put(USER_ENDPOINTS.UPDATE(userId), data);
    return response.data;
}

// 내 인증 상태 조회
export const getMyVerificationInfo = async (userId) => {
    const response = await api.get(VERIFICATION_ENDPOINTS.MY_STATUS, {
        params: { userId },
    });
    return response.data;
}

// (병원) 국세청 사업자 진위 확인
export const verifyBusinessLicense = async (data) => {
    // requireValidate=true: 상태+진위여부 모두 확인
    const response = await api.post(`${VERIFICATION_ENDPOINTS.NTS_VERIFY}?requireValidate=true`, data);
    return response.data;
};

// (병원) 관계자 인증 요청 (최종 저장)
export const requestHospitalVerification = async (data) => {
    const response = await api.post(VERIFICATION_ENDPOINTS.REQUEST_HOSPITAL, data);
    return response.data;
}

// (의사) 인증 요청
export const requestDoctorVerification = async (data) => {
    const response = await api.post(VERIFICATION_ENDPOINTS.REQUEST_DOCTOR, data);
    return response.data;
}

// 병원 찾기(검색)
export const searchHospitals = async (keyword, page = 0, size = 10) => {
    const response = await api.get(HOSPITAL_ENDPOINTS.SEARCH_HOSPITAL, { params: { keyword, page, size } })
    return response.data;
}