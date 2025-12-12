"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { getQuestionList } from "../api/qnaAPI"
import QuestionList from "../components/qna/QuestionList"
import PopularQuestions from "../components/qna/PopularQuestions"
import QuestionTabs from "../components/qna/QuestionTabs"
import "./QnaPage.css"

const QnaPage = () => {
    const navigate = useNavigate()
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [selectedStatus, setSelectedStatus] = useState("PUBLIC")

    const fetchQuestions = useCallback(async () => {
        try {
        setLoading(true)
        const response = await getQuestionList(selectedStatus, currentPage, 10)
        setQuestions(response.content)
        setTotalPages(response.totalPages)
        } catch (error) {
        console.error("질문 목록 조회 실패:", error)
        } finally {
        setLoading(false)
        }
    }, [currentPage, selectedStatus])

    useEffect(() => {
        fetchQuestions()
    }, [fetchQuestions])

    const handleCreateQuestion = () => {
        navigate("/qna/create")
    }

    const handleStatusChange = (status) => {
        setSelectedStatus(status)
        setCurrentPage(0)
    }

    return (
        <div className="qna-page">
        <div className="qna-header">
            <h1>Q&A 게시판</h1>
            <p>의료 전문가와 함께 궁금증을 해결하세요</p>
            <button className="create-question-btn" onClick={handleCreateQuestion}>
            질문하기
            </button>
        </div>

        <PopularQuestions />

        <QuestionTabs />

        <div className="qna-toolbar">
            <div className="status-filters">
            <button
                className={`filter-btn ${selectedStatus === "PUBLIC" ? "active" : ""}`}
                onClick={() => handleStatusChange("PUBLIC")}
            >
                공개 질문
            </button>
            <button
                className={`filter-btn ${selectedStatus === "PRIVATE" ? "active" : ""}`}
                onClick={() => handleStatusChange("PRIVATE")}
            >
                비공개 질문
            </button>
            <button
                className={`filter-btn ${selectedStatus === "RESOLVED" ? "active" : ""}`}
                onClick={() => handleStatusChange("RESOLVED")}
            >
                해결됨
            </button>
            </div>
        </div>

        {loading ? (
            <div className="loading">로딩 중...</div>
        ) : (
            <>
            <QuestionList questions={questions} />

            {totalPages > 1 && (
                <div className="pagination">
                <button
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="pagination-btn"
                >
                    이전
                </button>
                <span className="page-info">
                    {currentPage + 1} / {totalPages}
                </span>
                <button
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="pagination-btn"
                >
                    다음
                </button>
                </div>
            )}
            </>
        )}
        </div>
    )
}

export default QnaPage
