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
import { useAuth } from "../../contexts/AuthContext" // ✅ [추가] 인증 정보 가져오기
import AnswerComments from "./AnswerComments"
import "./QnaDetail.css"

const QnaDetail = () => {
    const { questionId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth() // ✅ [추가] 현재 로그인 유저 정보

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
        if (!user) return alert("로그인이 필요합니다.") // ✅ 로그인 체크
        if (user.role !== "DOCTOR") {
            return alert("답변은 의사 선생님만 작성할 수 있습니다.")
        }
        
        if (!newAnswer.trim()) return alert("답변을 입력하세요.")

        try {
            // userId 안 보냄 (백엔드가 토큰으로 처리)
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
            await deleteQuestion(questionId) // ✅ userId 파라미터 없음
            alert("질문이 삭제되었습니다.")
            navigate("/qna")
        } catch (err) {
            console.error("삭제 실패:", err)
            alert("삭제 권한이 없거나 오류가 발생했습니다.")
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
    if (!question) return <div className="error">질문을 찾을 수 없습니다.</div>

    // 타입 불일치(String vs Number) 방지를 위해 String()으로 감싸서 비교
    const isMyQuestion = user && String(question.userId) === String(user.userId);
    
    const isQuestioner = isMyQuestion;
    
    // ✅ [추가] 렌더링 때 써야 하므로 여기서 변수 선언
    const isDoctor = user?.role === "DOCTOR";

    return (
        <div className="qna-detail-page">
            {/* --- 질문 영역 --- */}
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
                        <button className="save-btn" onClick={handleUpdateQuestion}>저장</button>
                        <button className="cancel-btn" onClick={() => setIsEditingQuestion(false)}>취소</button>
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

                    {/* ✅ [권한] 내 질문일 때만 수정/삭제 버튼 표시 */}
                    {isMyQuestion && (
                        <div className="detail-actions">
                            <button onClick={() => setIsEditingQuestion(true)}>수정</button>
                            <button onClick={handleDeleteQuestion} className="delete-btn">삭제</button>
                        </div>
                    )}
                </>
            )}

            <h3>답변 {answers.length}개</h3>

            {/* --- 답변 리스트 영역 --- */}
            <div className="answer-list">
                {answers.length === 0 ? (
                    <div className="no-answers">아직 답변이 없습니다.</div>
                ) : (
                    answers.map((answer) => {
                        // ✅ [권한] 내 답변인지 확인
                        const isMyAnswer = user && answer.userId === user.userId;

                        return (
                            <div key={answer.answerId} className={`answer-item ${answer.accepted ? "accepted-answer" : ""}`}>
                                {editingAnswerId === answer.answerId ? (
                                    // 답변 수정 모드
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
                                    // 답변 읽기 모드
                                    <>
                                        <p className="answer-content">{answer.content}</p>

                                        {/* 의사 정보 배지 (백엔드에서 doctorInfo DTO를 준다고 가정) */}
                                        {answer.doctorInfo && (
                                            <div className="doctor-info">
                                                <span className="doctor-badge">의사</span>
                                                <span className="doctor-department">{answer.doctorInfo.department}</span>
                                                <span className="doctor-hospital">{answer.doctorInfo.hospital}</span>
                                            </div>
                                        )}

                                        <div className="answer-meta">
                                            <span>{answer.displayName || answer.userName || "전문가"}</span>
                                            <span className="answer-date">{new Date(answer.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        <div className="answer-actions">
                                            {/* ✅ [권한] 채택 버튼: 질문자 본인만 + 아직 채택된 답변이 없을 때만 보임 */}
                                            {!answer.accepted && isQuestioner && !question.isAccepted && (
                                                <button className="accept-btn" onClick={() => handleAcceptAnswer(answer.answerId)}>
                                                    답변 채택
                                                </button>
                                            )}
                                            
                                            {answer.accepted && (
                                                <span className="accepted-badge">✔ 채택됨</span>
                                            )}

                                            {/* ✅ [권한] 내 답변일 때만 수정/삭제 버튼 표시 */}
                                            {isMyAnswer && (
                                                <>
                                                    <button className="edit-answer-btn" onClick={() => startEditingAnswer(answer)}>수정</button>
                                                    <button className="delete-answer-btn" onClick={() => handleDeleteAnswer(answer.answerId)}>삭제</button>
                                                </>
                                            )}
                                        </div>

                                        {/* 댓글 컴포넌트 */}
                                        <AnswerComments answerId={answer.answerId} />
                                    </>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* --- 답변 작성 영역 (의사만 가능) --- */}
            {isDoctor ? (
                <div className="answer-create-box">
                    <textarea
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                        placeholder="전문의로서 답변을 작성해 주세요..."
                        rows={5}
                    />
                    <button 
                        className="submit-answer" 
                        onClick={handleCreateAnswer}
                        disabled={!newAnswer.trim()}
                    >
                        답변 등록
                    </button>
                </div>
            ) : (
                // 의사가 아니면 작성 불가 안내 (로그인 안 한 경우도 포함)
                <div className="answer-permission-notice" style={{ 
                    textAlign: "center", 
                    padding: "20px", 
                    backgroundColor: "#f8f9fa", 
                    color: "#666", 
                    borderRadius: "8px",
                    marginTop: "20px" 
                }}>
                    <p>🔒 답변은 인증된 의사 선생님만 작성할 수 있습니다.</p>
                </div>
            )}
        </div>
    )
}

export default QnaDetail