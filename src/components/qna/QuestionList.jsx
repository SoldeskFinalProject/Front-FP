"use client"

import { useNavigate } from "react-router-dom"
import PropTypes from "prop-types"
import "./QuestionList.css"

const QuestionList = ({ questions }) => {
  const navigate = useNavigate()

  const handleQuestionClick = (questionId) => {
    navigate(`/qna/${questionId}`)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return "방금 전"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`

    return date.toLocaleDateString("ko-KR")
  }

  const getStatusBadge = (status) => {
    const badges = {
      PUBLIC: { text: "공개", class: "status-public" },
      PRIVATE: { text: "비공개", class: "status-private" },
      RESOLVED: { text: "해결됨", class: "status-resolved" },
    }
    return badges[status] || badges.PUBLIC
  }

  if (questions.length === 0) {
    return <div className="empty-list">질문이 없습니다. 첫 질문을 남겨보세요!</div>
  }

  return (
    <div className="question-list">
      {questions.map((question) => {
        const badge = getStatusBadge(question.status)
        return (
          <div
            key={question.questionId}
            className="question-item"
            onClick={() => handleQuestionClick(question.questionId)}
          >
            <div className="question-main">
              <div className="question-header">
                <h3 className="question-title">{question.title}</h3>
                <span className={`status-badge ${badge.class}`}>{badge.text}</span>
              </div>
              <p className="question-preview">{question.content.substring(0, 100)}...</p>
              <div className="question-meta">
                <span className="author">{question.userName || "익명"}</span>
                <span className="separator">·</span>
                <span className="date">{formatDate(question.createdAt)}</span>
                <span className="separator">·</span>
                <span className="views">조회 {question.viewCount}</span>
                {question.answerCount > 0 && (
                  <>
                    <span className="separator">·</span>
                    <span className="answers">답변 {question.answerCount}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

QuestionList.propTypes = {
  questions: PropTypes.arrayOf(
    PropTypes.shape({
      questionId: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      viewCount: PropTypes.number,
      answerCount: PropTypes.number,
      userName: PropTypes.string,
      createdAt: PropTypes.string.isRequired,
    }),
  ).isRequired,
}

export default QuestionList
