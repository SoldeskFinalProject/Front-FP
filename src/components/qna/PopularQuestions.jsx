"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { getQuestionList } from "../../api/qnaAPI"
import "./PopularQuestions.css"

const PopularQuestions = () => {
    const navigate = useNavigate()
    const [popularQuestions, setPopularQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    const fetchPopularQuestions = useCallback(async () => {
        try {
        setLoading(true)
        // 조회수 순으로 정렬된 질문을 가져옴 (백엔드에서 sort 파라미터 지원 필요)
        const response = await getQuestionList("PUBLIC", currentPage, 6, "viewCount,desc")
        setPopularQuestions(response.content)
        setTotalPages(response.totalPages)
        } catch (error) {
        console.error("인기 질문 조회 실패:", error)
        } finally {
        setLoading(false)
        }
    }, [currentPage])

    useEffect(() => {
        fetchPopularQuestions()
    }, [fetchPopularQuestions])

    const handleQuestionClick = (questionId) => {
        navigate(`/qna/${questionId}`)
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("ko-KR")
    }

    if (loading) return <div className="loading-popular">로딩 중...</div>

    return (
        <div className="popular-questions-section">
        <h2 className="section-title">많이 본 Q&A</h2>

        <div className="popular-grid">
            {popularQuestions.map((question, index) => (
            <div
                key={question.questionId}
                className="popular-card"
                onClick={() => handleQuestionClick(question.questionId)}
            >
                <div className="popular-rank">{currentPage * 6 + index + 1}</div>
                <h3 className="popular-title">
                {question.isAccepted && <span className="accepted-icon">✔ </span>}
                {question.title}
                </h3>
                <p className="popular-preview">{question.content.substring(0, 60)}...</p>
                <div className="popular-meta">
                <span className="view-count">👁 {question.viewCount}</span>
                <span className="answer-count">💬 {question.answerCount}</span>
                <span className="popular-date">{formatDate(question.createdAt)}</span>
                </div>
            </div>
            ))}
        </div>

        {totalPages > 1 && (
            <div className="popular-pagination">
            <button disabled={currentPage === 0} onClick={() => setCurrentPage((prev) => prev - 1)} className="page-btn">
                이전
            </button>
            <span className="page-indicator">
                {currentPage + 1} / {totalPages}
            </span>
            <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="page-btn"
            >
                다음
            </button>
            </div>
        )}
        </div>
    )
}

export default PopularQuestions
