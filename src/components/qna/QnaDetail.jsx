"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
    getQuestionDetail,
    getAnswerList,
    createAnswer,
    deleteQuestion,
    updateQuestion,
    updateAnswer,
    deleteAnswer,
    acceptAnswer,
} from "../../api/qnaAPI"
import "./QnaDetail.css"

const QnaDetail = () => {
    const { questionId } = useParams()
    const navigate = useNavigate()

    const [question, setQuestion] = useState(null)
    const [answers, setAnswers] = useState([])
    const [loading, setLoading] = useState(true)
    const [newAnswer, setNewAnswer] = useState("")

    const [isEditingQuestion, setIsEditingQuestion] = useState(false)
    const [editedTitle, setEditedTitle] = useState("")
    const [editedContent, setEditedContent] = useState("")

    const [editingAnswerId, setEditingAnswerId] = useState(null)
    const [editedAnswerContent, setEditedAnswerContent] = useState("")

    useEffect(() => {
        loadDetail()
    }, [questionId])

    const loadDetail = async () => {
        try {
        setLoading(true)
        const questionData = await getQuestionDetail(questionId)
        const answerData = await getAnswerList(questionId)

        setQuestion(questionData)
        setAnswers(answerData)
        setEditedTitle(questionData.title)
        setEditedContent(questionData.content)
        } catch (err) {
        console.error("질문 상세 조회 실패:", err)
        } finally {
        setLoading(false)
        }
    }

    const handleCreateAnswer = async () => {
        if (!newAnswer.trim()) return alert("답변을 입력하세요.")

        try {
        await createAnswer(questionId, { content: newAnswer })
        setNewAnswer("")
        loadDetail()
        } catch (err) {
        console.error("답변 등록 실패:", err)
        }
    }

    const handleDeleteQuestion = async () => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return
        try {
        await deleteQuestion(questionId)
        alert("질문이 삭제되었습니다.")
        navigate("/qna")
        } catch (err) {
        console.error("삭제 실패:", err)
        }
    }

    const handleUpdateQuestion = async () => {
        try {
        await updateQuestion(questionId, {
            title: editedTitle,
            content: editedContent,
        })
        alert("질문이 수정되었습니다.")
        setIsEditingQuestion(false)
        loadDetail()
        } catch (err) {
        console.error("질문 수정 실패:", err)
        alert("질문 수정에 실패했습니다.")
        }
    }

    const handleUpdateAnswer = async (answerId) => {
        if (!editedAnswerContent.trim()) return alert("답변 내용을 입력하세요.")

        try {
        await updateAnswer(answerId, { content: editedAnswerContent })
        alert("답변이 수정되었습니다.")
        setEditingAnswerId(null)
        setEditedAnswerContent("")
        loadDetail()
        } catch (err) {
        console.error("답변 수정 실패:", err)
        alert("답변 수정에 실패했습니다.")
        }
    }

    const handleDeleteAnswer = async (answerId) => {
        if (!window.confirm("답변을 삭제하시겠습니까?")) return

        try {
        await deleteAnswer(answerId)
        alert("답변이 삭제되었습니다.")
        loadDetail()
        } catch (err) {
        console.error("답변 삭제 실패:", err)
        alert("답변 삭제에 실패했습니다.")
        }
    }

    const handleAcceptAnswer = async (answerId) => {
        if (!window.confirm("이 답변을 채택하시겠습니까?")) return

        try {
        await acceptAnswer(questionId, answerId)
        alert("답변이 채택되었습니다!")
        loadDetail()
        } catch (err) {
        console.error("답변 채택 실패:", err)
        alert("답변 채택에 실패했습니다.")
        }
    }

    const startEditingAnswer = (answer) => {
        setEditingAnswerId(answer.answerId)
        setEditedAnswerContent(answer.content)
    }

    if (loading) return <div className="loading">로딩 중...</div>

    return (
        <div className="qna-detail-page">
        {isEditingQuestion ? (
            <div className="edit-question-box">
            <input
                type="text"
                className="edit-title-input"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="제목을 입력하세요"
            />
            <textarea
                className="edit-content-textarea"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder="내용을 입력하세요"
                rows={10}
            />
            <div className="edit-actions">
                <button className="save-btn" onClick={handleUpdateQuestion}>
                저장
                </button>
                <button className="cancel-btn" onClick={() => setIsEditingQuestion(false)}>
                취소
                </button>
            </div>
            </div>
        ) : (
            <>
            <h2 className="detail-title">{question.title}</h2>
            <div className="detail-meta">
                <span>작성자: {question.userName || "익명"}</span>
                <span> · </span>
                <span>조회 {question.viewCount}</span>
            </div>
            <p className="detail-content">{question.content}</p>

            <div className="detail-actions">
                <button onClick={() => setIsEditingQuestion(true)}>수정</button>
                <button onClick={handleDeleteQuestion} className="delete-btn">
                삭제
                </button>
            </div>
            </>
        )}

        <h3>답변 {answers.length}개</h3>

        <div className="answer-list">
            {answers.length === 0 ? (
            <div className="no-answers">아직 답변이 없습니다.</div>
            ) : (
            answers.map((answer) => (
                <div key={answer.answerId} className={`answer-item ${answer.accepted ? "accepted-answer" : ""}`}>
                {editingAnswerId === answer.answerId ? (
                    <div className="edit-answer-box">
                    <textarea
                        className="edit-answer-textarea"
                        value={editedAnswerContent}
                        onChange={(e) => setEditedAnswerContent(e.target.value)}
                        rows={5}
                    />
                    <div className="edit-actions">
                        <button className="save-btn" onClick={() => handleUpdateAnswer(answer.answerId)}>
                        저장
                        </button>
                        <button className="cancel-btn" onClick={() => setEditingAnswerId(null)}>
                        취소
                        </button>
                    </div>
                    </div>
                ) : (
                    <>
                    <p className="answer-content">{answer.content}</p>

                    {answer.doctorInfo && (
                        <div className="doctor-info">
                        <span className="doctor-badge">의사</span>
                        <span className="doctor-department">{answer.doctorInfo.department}</span>
                        <span className="doctor-hospital">{answer.doctorInfo.hospital}</span>
                        </div>
                    )}

                    <div className="answer-meta">
                        <span>{answer.userName || "익명"}</span>
                        <span className="answer-date">{new Date(answer.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="answer-actions">
                        {answer.accepted ? (
                        <span className="accepted-badge">✔ 채택됨</span>
                        ) : (
                        <button className="accept-btn" onClick={() => handleAcceptAnswer(answer.answerId)}>
                            답변 채택
                        </button>
                        )}

                        <button className="edit-answer-btn" onClick={() => startEditingAnswer(answer)}>
                        수정
                        </button>
                        <button className="delete-answer-btn" onClick={() => handleDeleteAnswer(answer.answerId)}>
                        삭제
                        </button>
                    </div>
                    </>
                )}
                </div>
            ))
            )}
        </div>

        <div className="answer-create-box">
            <textarea
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="답변을 입력하세요..."
            rows={5}
            />
            <button className="submit-answer" onClick={handleCreateAnswer}>
            답변 등록
            </button>
        </div>
        </div>
    )
}

export default QnaDetail
