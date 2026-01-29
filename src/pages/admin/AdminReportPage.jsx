"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { getAdminReportList, deleteReportedContent } from "../../api/reportAPI"
import "./AdminReportPage.css"

const AdminReportPage = () => {
    // ✅ 1. loading 상태 가져오기
    const { user, isAdmin, loading: authLoading } = useAuth() 
    const navigate = useNavigate()
    
    const [reports, setReports] = useState([])
    const [pageLoading, setPageLoading] = useState(true)

    useEffect(() => {
        // ✅ 2. 인증 정보를 복구하는 중이라면 아무것도 하지 않고 기다림
        if (authLoading) return 

        // 3. 로딩이 끝났는데도 유저가 없거나 관리자가 아니면 그때 쫓아냄
        if (!user || !isAdmin) {
        alert("관리자 권한이 필요합니다.")
        navigate("/")
        return
        }

        // 4. 권한이 확인되면 데이터 가져오기
        fetchReports()
    }, [user, isAdmin, authLoading, navigate])

    const fetchReports = async () => {
        try {
            setPageLoading(true)
            const data = await getAdminReportList()
            setReports(data)
        } catch (error) {
            console.error("신고 목록 로드 실패:", error)
        } finally {
            setPageLoading(false)
        }
    }

    // 2. 삭제 핸들러
    const handleDelete = async (targetType, targetId) => {
        if (!window.confirm("정말 삭제하시겠습니까? 해당 콘텐츠와 신고 기록이 모두 영구 삭제됩니다.")) {
        return
        }

        try {
        await deleteReportedContent(targetType, targetId)
        alert("삭제되었습니다.")
        // 목록 갱신 (삭제된 항목 제외)
        setReports((prev) => prev.filter(
            (r) => !(r.targetType === targetType && r.targetId === targetId)
        ))
        } catch (error) {
        console.error("삭제 실패:", error)
        alert("삭제 중 오류가 발생했습니다.")
        }
    }

    // 3. 타입별 배지 스타일
    const getTypeBadgeClass = (type) => {
        switch (type) {
        case "QUESTION": return "badge-question"
        case "ANSWER": return "badge-answer"
        case "COMMENT": return "badge-comment"
        default: return "badge-default"
        }
    }

    if (authLoading) return <div className="loading-container">인증 정보를 확인 중...</div>

    if (pageLoading) return <div className="loading-container">데이터를 불러오는 중...</div>

    return (
        <div className="admin-page-container">
        <h1 className="admin-title">🚨 신고 접수 현황</h1>
        <p className="admin-subtitle">사용자로부터 접수된 신고 내역을 검토하고 처리합니다.</p>

        <div className="report-table-wrapper">
            <table className="report-table">
            <thead>
                <tr>
                <th width="5%">ID</th>
                <th width="10%">유형</th>
                <th width="15%">신고 사유</th>
                <th width="40%">신고된 원문 내용</th>
                <th width="15%">신고자 / 일시</th>
                <th width="10%">관리</th>
                </tr>
            </thead>
            <tbody>
                {reports.length === 0 ? (
                <tr>
                    <td colSpan="6" className="no-data">접수된 신고 내역이 없습니다.</td>
                </tr>
                ) : (
                reports.map((report) => (
                    <tr key={report.id}>
                    <td>{report.id}</td>
                    <td>
                        <span className={`type-badge ${getTypeBadgeClass(report.targetType)}`}>
                        {report.targetType}
                        </span>
                    </td>
                    <td className="reason-cell">{report.reason}</td>
                    <td className="content-cell">
                        <div className="content-box">
                        {report.content}
                        </div>
                    </td>
                    <td className="reporter-cell">
                        <div>{report.reporterEmail}</div>
                        <div className="date-text">
                        {new Date(report.createdAt).toLocaleDateString()}
                        </div>
                    </td>
                    <td>
                        <button 
                        className="delete-btn"
                        onClick={() => handleDelete(report.targetType, report.targetId)}
                        >
                        삭제 처리
                        </button>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
        </div>
    )
}

export default AdminReportPage