"use client"

import { useEffect, useState, useCallback } from "react"
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
import { useAuth } from "../../contexts/AuthContext"
import AnswerComments from "./AnswerComments"
import "./QnaDetail.css"
import { createReport } from "../../api/reportAPI"
import ReportModal from "../common/ReportModal"

const QnaDetail = () => {
    const { questionId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [question, setQuestion] = useState(null)
    const [answers, setAnswers] = useState([])
    const [loading, setLoading] = useState(true)
    const [newAnswer, setNewAnswer] = useState("")

    // 질문 수정 상태
    const [isEditingQuestion, setIsEditingQuestion] = useState(false)
    const [editedTitle, setEditedTitle] = useState("")
    const [editedContent, setEditedContent] = useState("")

    // 답변 수정 상태
    const [editingAnswerId, setEditingAnswerId] = useState(null)
    const [editedAnswerContent, setEditedAnswerContent] = useState("")

    // 신고 모달 상태
    const [reportModal, setReportModal] = useState({ open: false, type: null, id: null });

    const openReport = (type, id) => {
        if (!user) return alert("로그인이 필요합니다.");
        setReportModal({ open: true, type, id });
    };

    const handleReportSubmit = async (reason) => {
        try {
            await createReport({
                targetType: reportModal.type,
                targetId: reportModal.id,
                reason
            });
            alert("신고가 정상적으로 접수되었습니다.");
            setReportModal({ open: false, type: null, id: null });
        } catch (error) {
            console.error("신고 실패:", error)
            alert("신고 처리 중 오류가 발생했습니다.");
        }
    };

    const loadDetail = useCallback(async () => {
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
    }, [questionId])

    useEffect(() => {
        loadDetail()
    }, [loadDetail])

    // --- 핸들러 함수들 ---

    const handleCreateAnswer = async () => {
        if (!user) return alert("로그인이 필요합니다.")
        if (user.role !== "DOCTOR") return alert("답변은 의사 선생님만 작성할 수 있습니다.")
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
            alert("삭제 권한이 없거나 오류가 발생했습니다.")
        }
    }

    const handleUpdateQuestion = async () => {
        try {
            await updateQuestion(questionId, { title: editedTitle, content: editedContent })
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
    if (!question) return <div className="error">질문을 찾을 수 없습니다.</div>

    // 권한 확인 변수
    const isMyQuestion = user && String(question.userId) === String(user.userId);
    const isDoctor = user?.role === "DOCTOR";

    return (
        <div className="qna-detail-page">
            {/* --- 1. 질문 영역 --- */}
            <div className="question-section">
                {isEditingQuestion ? (
                    /* [질문 수정 모드] */
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
                            <button className="save-btn" onClick={handleUpdateQuestion}>저장</button>
                            <button className="cancel-btn" onClick={() => setIsEditingQuestion(false)}>취소</button>
                        </div>
                    </div>
                ) : (
                    /* [질문 조회 모드] */
                    <>
                        <div className="question-header">
                            <h2 className="detail-title">{question.title}</h2>
                            <div className="detail-meta">
                                <span className="author">작성자: {question.userName || "익명"}</span>
                                <span className="divider">|</span>
                                <span className="date">{new Date(question.createdAt).toLocaleDateString()}</span>
                                <span className="divider">|</span>
                                <span className="views">조회 {question.viewCount}</span>
                            </div>
                        </div>

                        <div className="question-body">
                            <p className="detail-content">{question.content}</p>
                        </div>

                        {/* ✅ [복구 완료] 질문 하단 버튼 영역 */}
                        <div className="detail-actions">
                            {isMyQuestion ? (
                                // 내 글이면: 수정/삭제 버튼 노출
                                <div className="owner-buttons">
                                    <button className="action-btn edit" onClick={() => setIsEditingQuestion(true)}>수정</button>
                                    <button className="action-btn delete" onClick={handleDeleteQuestion}>삭제</button>
                                </div>
                            ) : (
                                // 남의 글이면: 신고 버튼 노출
                                <button className="report-btn-small" onClick={() => openReport("QUESTION", questionId)}>
                                    🚨 신고
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* --- 2. 답변 목록 영역 --- */}
            <div className="answers-header">
                <h3>답변 {answers.length}개</h3>
            </div>

            <div className="answer-list">
                {answers.length === 0 ? (
                    <div className="no-answers">아직 등록된 전문가 답변이 없습니다.</div>
                ) : (
                    answers.map((answer) => {
                        const isMyAnswer = user && String(answer.userId) === String(user.userId);

                        return (
                            <div key={answer.answerId} className={`answer-item ${answer.accepted ? "accepted-answer" : ""}`}>
                                {editingAnswerId === answer.answerId ? (
                                    /* [답변 수정 모드] */
                                    <div className="edit-answer-box">
                                        <textarea
                                            className="edit-answer-textarea"
                                            value={editedAnswerContent}
                                            onChange={(e) => setEditedAnswerContent(e.target.value)}
                                            rows={5}
                                        />
                                        <div className="edit-actions">
                                            <button className="save-btn" onClick={() => handleUpdateAnswer(answer.answerId)}>저장</button>
                                            <button className="cancel-btn" onClick={() => setEditingAnswerId(null)}>취소</button>
                                        </div>
                                    </div>
                                ) : (
                                    /* [답변 조회 모드] */
                                    <>
                                        <div className="answer-header">
                                            {answer.doctorInfo && (
                                                <div className="doctor-info-badge">
                                                    <span className="doctor-badge">의사</span>
                                                    <span className="doctor-dept">{answer.doctorInfo.department}</span>
                                                    <span className="doctor-hosp">{answer.doctorInfo.hospital}</span>
                                                </div>
                                            )}
                                        </div>

                                        <p className="answer-content">{answer.content}</p>

                                        <div className="answer-meta">
                                            <span>{answer.displayName || answer.userName || "전문가"}</span>
                                            <span className="divider">|</span>
                                            <span className="answer-date">{new Date(answer.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        {/* ✅ [복구 완료] 답변 하단 액션 버튼 */}
                                        <div className="answer-actions">
                                            {/* 1. 채택 버튼 (질문 작성자만 보임 & 아직 채택 안 된 경우) */}
                                            {!answer.accepted && isMyQuestion && !question.isAccepted && (
                                                <button className="accept-btn" onClick={() => handleAcceptAnswer(answer.answerId)}>
                                                    답변 채택하기
                                                </button>
                                            )}

                                            {/* 2. 채택 완료 표시 */}
                                            {answer.accepted && <span className="accepted-badge">✔ 채택된 답변</span>}

                                            {/* 3. 수정/삭제 vs 신고 */}
                                            {isMyAnswer ? (
                                                <div className="my-actions">
                                                    <button className="action-btn edit" onClick={() => startEditingAnswer(answer)}>수정</button>
                                                    <button className="action-btn delete" onClick={() => handleDeleteAnswer(answer.answerId)}>삭제</button>
                                                </div>
                                            ) : (
                                                <button className="report-btn-small" onClick={() => openReport("ANSWER", answer.answerId)}>
                                                    🚨 신고
                                                </button>
                                            )}
                                        </div>

                                        {/* 댓글 컴포넌트 */}
                                        <AnswerComments answerId={answer.answerId} />
                                    </>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            {/* --- 3. 답변 작성 영역 (의사 전용) --- */}
            <div className="create-answer-section">
                {isDoctor ? (
                    <div className="answer-create-box">
                        <textarea
                            value={newAnswer}
                            onChange={(e) => setNewAnswer(e.target.value)}
                            placeholder="정확하고 친절한 의학 지식을 공유해 주세요."
                            rows={5}
                        />
                        <button
                            className="submit-answer-btn"
                            onClick={handleCreateAnswer}
                            disabled={!newAnswer.trim()}
                        >
                            답변 등록하기
                        </button>
                    </div>
                ) : (
                    <div className="answer-permission-notice">
                        <p>🔒 질문에 대한 답변은 인증된 의사 회원만 가능합니다.</p>
                    </div>
                )}
            </div>

            {/* --- 4. 신고 모달 (질문/답변 공용) --- */}
            <ReportModal
                isOpen={reportModal.open}
                onClose={() => setReportModal({ ...reportModal, open: false })}
                onSubmit={handleReportSubmit}
                targetType={reportModal.type}
            />
        </div>
    )
}

export default QnaDetail