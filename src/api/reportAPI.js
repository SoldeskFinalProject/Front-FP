import { api } from "../config.js";
import { REPORT_ENDPOINTS } from "../config.js";

/**
 * 1. 일반 유저: 콘텐츠(질문, 답변, 댓글 등) 신고하기
 * @param {Object} reportData - { targetType: 'COMMENT'|'QUESTION'|'ANSWER', targetId: Long, reason: String }
 */
export const createReport = async (reportData) => {
    try {
        const response = await api.post(REPORT_ENDPOINTS.CREATE, reportData);
        return response.data;
    } catch (error) {
        console.error("신고 접수 중 오류 발생:", error);
        throw error;
    }
};

/**
 * 2. 관리자: 전체 신고 내역 목록 조회
 * @returns {Promise<Array>} - ReportResponseDTO 리스트
 */
export const getAdminReportList = async () => {
    try {
        const response = await api.get(REPORT_ENDPOINTS.ADMIN_LIST);
        return response.data;
    } catch (error) {
        console.error("신고 목록 조회 실패:", error);
        throw error;
    }
};

/**
 * 3. 관리자: 신고된 콘텐츠 강제 삭제 및 신고 기록 정리
 * @param {string} type - 대상 타입 (예: 'COMMENT')
 * @param {number} id - 대상 PK ID
 */
export const deleteReportedContent = async (type, id) => {
    try {
        const response = await api.delete(REPORT_ENDPOINTS.ADMIN_DELETE(type, id));
        return response.data;
    } catch (error) {
        console.error("콘텐츠 삭제 중 오류 발생:", error);
        throw error;
    }
};