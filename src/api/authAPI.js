import { api, AUTH_ENDPOINTS, ADMIN_ENDPOINTS } from "../config"

// 회원가입
export const signup = async (userType, formData) => {
    let endpoint = ""
    let requestData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
    }

    if (userType === "USER") {
        endpoint = AUTH_ENDPOINTS.SIGNUP_USER
        requestData = {
        ...requestData,
        zipcode: formData.zipcode,
        address: formData.address,
        addressDetail: formData.addressDetail,
        }
    } else if (userType === "DOCTOR") {
        endpoint = AUTH_ENDPOINTS.SIGNUP_DOCTOR
        requestData = {
        ...requestData,
        licenseNumber: formData.licenseNumber,
        specialty: formData.specialty,
        hospitalId: Number(formData.hospitalId),
        bio: formData.bio,
        }
    } else if (userType === "HOSPITAL") {
        endpoint = AUTH_ENDPOINTS.SIGNUP_HOSPITAL
        requestData = {
        ...requestData,
        businessNumber: formData.businessNumber,
        hospitalId: Number(formData.hospitalId),
        }
    }

    const response = await api.post(endpoint, requestData)
    return response.data
}

// 로그인
export const login = async (credentials) => {
    const response = await api.post(AUTH_ENDPOINTS.LOGIN, credentials)
    return response.data
}

// 병원 목록 조회
export const getAllHospitals = async () => {
    const response = await api.get(AUTH_ENDPOINTS.HOSPITALS)
    return response.data
}

// 관리자: 승인 대기 목록 조회
export const getApprovalList = async () => {
    const response = await api.get(ADMIN_ENDPOINTS.APPROVAL_LIST)
    return response.data
}

// 관리자: 승인 대기 의사 목록 조회
export const getPendingDoctors = async () => {
    const response = await api.get(ADMIN_ENDPOINTS.PENDING_DOCTORS)
    return response.data
}

// 관리자: 승인 대기 병원 목록 조회
export const getPendingHospitals = async () => {
    const response = await api.get(ADMIN_ENDPOINTS.PENDING_HOSPITALS)
    return response.data
}

// 관리자: 승인
export const approveUser = async (userId) => {
    const response = await api.post(ADMIN_ENDPOINTS.APPROVE(userId))
    return response.data
}

// 관리자: 의사 승인
export const approveDoctor = async (doctorId) => {
    const response = await api.post(ADMIN_ENDPOINTS.APPROVE_DOCTOR(doctorId))
    return response.data
}

// 관리자: 병원 승인
export const approveHospital = async (hospitalId) => {
    const response = await api.post(ADMIN_ENDPOINTS.APPROVE_HOSPITAL(hospitalId))
    return response.data
}

// 관리자: 거부
export const rejectUser = async (userId) => {
    const response = await api.post(ADMIN_ENDPOINTS.REJECT(userId))
    return response.data
}
