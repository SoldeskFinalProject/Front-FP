"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { getVerificationRequests, approveRequest, rejectRequest } from "/src/api/authAPI"
import "./VerificationList.css"

const HospitalVerificationList = () => {
    const navigate = useNavigate()
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterDecision, setFilterDecision] = useState("PENDING")
    const [selectedRequest, setSelectedRequest] = useState(null)
    const [rejectReason, setRejectReason] = useState("")
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [processing, setProcessing] = useState(false)

    // 목록 조회
    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true)
            // 백엔드에서 hospitalName, userName, businessNumber가 포함된 데이터를 받아옵니다.
            const data = await getVerificationRequests("HOSPITAL", filterDecision)
            setRequests(data)
        } catch (error) {
            console.error("병원 승인 요청 목록 조회 실패:", error)
        } finally {
            setLoading(false)
        }
    }, [filterDecision])

    useEffect(() => {
        fetchRequests()
    }, [fetchRequests])

    // 승인 처리
    const handleApprove = async (requestId) => {
        if (!confirm("이 요청을 승인하시겠습니까?")) return

        try {
        setProcessing(true)
        await approveRequest(requestId)
        alert("승인이 완료되었습니다.")
        fetchRequests() // 목록 갱신
        } catch (error) {
        console.error("승인 실패", error)
        alert("승인 처리에 실패했습니다.")
        } finally {
        setProcessing(false)
        }
    }

    // 거절 모달 열기
    const handleRejectClick = (request) => {
        setSelectedRequest(request)
        setRejectReason("")
        setShowRejectModal(true)
    }

    // 거절 확정
    const handleRejectConfirm = async () => {
        if (!rejectReason.trim()) {
        alert("거절 사유를 입력해주세요.")
        return
        }

        try {
            setProcessing(true)
            await rejectRequest(selectedRequest.requestId, rejectReason)
            alert("거절 처리가 완료되었습니다.")
            setShowRejectModal(false)
            setSelectedRequest(null)
            setRejectReason("")
            fetchRequests() // 목록 갱신
        } catch (error) {
            console.error("거절 실패", error)
            alert("거절 처리에 실패했습니다.")
        } finally {
            setProcessing(false)
        }
    }

    if (loading) {
        return <div className="loading">로딩 중...</div>
    }

    return (
        <div className="admin-container">
        <div className="admin-header">
            <h1 className="admin-title">🏥 병원 관계자 인증 요청 관리</h1>
            <button className="back-btn" onClick={() => navigate("/admin/verification")}>
            목록으로
            </button>
        </div>

        {/* 필터 버튼 영역 */}
        <div className="filter-section">
            <div className="filter-group">
            <label className="filter-label">승인 상태</label>
            <div className="filter-buttons">
                <button
                className={`filter-btn ${filterDecision === "PENDING" ? "active" : ""}`}
                onClick={() => setFilterDecision("PENDING")}
                >
                대기 중
                </button>
                <button
                className={`filter-btn ${filterDecision === "APPROVED" ? "active" : ""}`}
                onClick={() => setFilterDecision("APPROVED")}
                >
                승인됨
                </button>
                <button
                className={`filter-btn ${filterDecision === "REJECTED" ? "active" : ""}`}
                onClick={() => setFilterDecision("REJECTED")}
                >
                거절됨
                </button>
            </div>
            </div>
        </div>

        {/* 요청 목록 리스트 */}
        <div className="requests-list">
            {requests.length === 0 ? (
            <div className="no-data">요청이 없습니다.</div>
            ) : (
            requests.map((request) => (
                <div key={request.requestId} className="request-card">
                <div className="request-header">
                    <div className="request-info">
                    {/* ✅ 수정됨: 병원 ID 대신 병원 이름 출력 */}
                    <h3 className="hospital-name">{request.hospitalName || "병원명 미상"}</h3>
                    <span className="request-id">#{request.requestId}</span>
                    </div>
                    <span className={`status-badge status-${request.adminDecision.toLowerCase()}`}>
                    {request.adminDecision === "PENDING"
                        ? "대기 중"
                        : request.adminDecision === "APPROVED"
                        ? "승인됨"
                        : "거절됨"}
                    </span>
                </div>

                <div className="request-body">
                    {/* ✅ 수정됨: 사용자 ID 대신 실명 및 사업자 정보 출력 */}
                    <div className="request-detail">
                        <span className="detail-label">신청자명:</span>
                        <span className="detail-value">{request.userName}</span>
                        {/* (선택사항) 필요하다면 ID도 작게 표시 */}
                        <span className="detail-sub-text" style={{ fontSize: "0.85em", color: "#888", marginLeft: "6px" }}>
                            (ID: {request.userId})
                        </span>
                    </div>

                    <div className="request-detail">
                        <span className="detail-label">대표자명:</span>
                        <span className="detail-value">{request.ownerName || "-"}</span>
                    </div>

                    <div className="request-detail">
                        <span className="detail-label">사업자번호:</span>
                        <span className="detail-value">{request.businessNumber || "-"}</span>
                    </div>

                    <div className="request-detail">
                    <span className="detail-label">요청 일시:</span>
                    <span className="detail-value">
                        {new Date(request.createdAt).toLocaleString("ko-KR")}
                    </span>
                    </div>

                    {request.adminReason && (
                    <div className="request-detail">
                        <span className="detail-label">거절 사유:</span>
                        <span className="detail-value reject-reason">{request.adminReason}</span>
                    </div>
                    )}
                </div>

                {/* 액션 버튼 (대기 상태일 때만 표시) */}
                {request.adminDecision === "PENDING" && (
                    <div className="request-actions">
                    <button
                        className="approve-btn"
                        onClick={() => handleApprove(request.requestId)}
                        disabled={processing}
                    >
                        승인
                    </button>
                    <button
                        className="reject-btn"
                        onClick={() => handleRejectClick(request)}
                        disabled={processing}
                    >
                        거절
                    </button>
                    </div>
                )}
                </div>
            ))
            )}
        </div>

        {/* 거절 사유 입력 모달 */}
        {showRejectModal && (
            <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">거절 사유 입력</h2>
                <p className="modal-description">요청을 거절하는 이유를 입력해주세요. 사용자에게 전달됩니다.</p>
                <textarea
                className="reject-textarea"
                placeholder="거절 사유를 입력하세요..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                />
                <div className="modal-actions">
                <button className="modal-cancel" onClick={() => setShowRejectModal(false)}>
                    취소
                </button>
                <button className="modal-confirm" onClick={handleRejectConfirm} disabled={processing}>
                    {processing ? "처리 중..." : "거절 확정"}
                </button>
                </div>
            </div>
            </div>
        )}
        </div>
    )
}

export default HospitalVerificationList