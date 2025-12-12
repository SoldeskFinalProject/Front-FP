"use client"

import { useState, useEffect } from "react"
import { getQuestionList } from "../../api/qnaAPI"
import QuestionList from "./QuestionList"
import "./QuestionTabs.css"

const QuestionTabs = () => {
    const [activeTab, setActiveTab] = useState("unanswered")
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    useEffect(() => {
        fetchQuestions()
    }, [activeTab, currentPage])

    const fetchQuestions = async () => {
        try {
        setLoading(true)
        // 답변 여부에 따라 필터링 (백엔드에서 hasAnswer 파라미터 지원 필요)
        const hasAnswer = activeTab === "answered"
        const response = await getQuestionList("PUBLIC", currentPage, 10, null, hasAnswer)
        setQuestions(response.content)
        setTotalPages(response.totalPages)
        } catch (error) {
        console.error("질문 목록 조회 실패:", error)
        } finally {
        setLoading(false)
        }
    }

    const handleTabChange = (tab) => {
        setActiveTab(tab)
        setCurrentPage(0)
    }

    return (
        <div className="question-tabs-section">
        <div className="tabs-header">
            <button
            className={`tab-btn ${activeTab === "unanswered" ? "active" : ""}`}
            onClick={() => handleTabChange("unanswered")}
            >
            답변 대기
            </button>
            <button
            className={`tab-btn ${activeTab === "answered" ? "active" : ""}`}
            onClick={() => handleTabChange("answered")}
            >
            답변 완료
            </button>
        </div>

        <div className="tabs-content">
            {loading ? (
            <div className="loading">로딩 중...</div>
            ) : (
            <>
                <QuestionList questions={questions} />

                {totalPages > 1 && (
                <div className="tabs-pagination">
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
        </div>
    )
}

export default QuestionTabs
