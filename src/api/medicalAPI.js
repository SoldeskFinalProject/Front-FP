import { api, DOCTOR_ENDPOINTS, HOSPITAL_ENDPOINTS } from "../config.js"

// 의사 정보 조회

// 특정 병워 소속 의사 조회
export const getDoctorByHospital = async (hospitalId) => {
    const response = await api.get(DOCTOR_ENDPOINTS.BY_HOSPITAL(hospitalId));
    return response.data;
}

// 내 의사 프로필 조회
export const getMyDoctorProfile = async (userId) => {
    const response = await api.get(DOCTOR_ENDPOINTS.PROFILE(userId));
    return response.data;
}

// 병원 검색

// 병원 관계자 전체 조회
export const searchHospitalMember = async (keyword, page = 0, size = 10) => {
    const response = await api.get(`/api/hospitals`, {
        params: { keyword, page, size }
    });
    return response.data;
};

// 등록된 병원관계자 전체 조회
export const getAllHospitalMember = async () => {
    const response = await api.get(HOSPITAL_ENDPOINTS.LIST);
    return response.data;
}

// 병원 관계자 상세 조회
export const getHospitalDetail = async (HospitalMemberId) => {
    const response = await api.get(HOSPITAL_ENDPOINTS.DETAIL(HospitalMemberId));
    return response.data;
}

// 내 병원 관리자 프로필 조회
export const getMyHospitalProfile = async (userId) => {
    const reponse = await api.get(HOSPITAL_ENDPOINTS.MY_PROFILE(userId));
    return reponse.data;
}