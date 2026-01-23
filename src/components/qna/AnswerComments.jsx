"use client"

import { useState, useEffect } from "react"
import { getCommentsByAnswer, createComment, updateComment, deleteComment } from "../../api/qnaAPI"
import { useAuth } from "../../contexts/AuthContext" // ✅ [추가] 유저 정보 가져오기
import "./AnswerComments.css"

const AnswerComments = ({ answerId }) => {
    const { user } = useAuth() // ✅ 현재 로그인한 유저 정보 (내 ID 확인용)
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState("")
    
    // 답글 관련
    const [replyingTo, setReplyingTo] = useState(null) // 부모 댓글 ID
    const [replyContent, setReplyContent] = useState("")
    
    // 수정 관련
    const [editingCommentId, setEditingCommentId] = useState(null)
    const [editContent, setEditContent] = useState("")
    
    // 더보기(펼치기) 관련
    const [expandedGroups, setExpandedGroups] = useState({})

    useEffect(() => {
        loadComments()
    }, [answerId])

    const loadComments = async () => {
        try {
        const data = await getCommentsByAnswer(answerId)
        setComments(data)
        } catch (err) {
        console.error("댓글 로드 실패:", err)
        }
    }

    // ✅ 댓글 등록
    const handleCreateComment = async () => {
        if (!user) return alert("로그인이 필요합니다.") // 로그인 체크
        if (!newComment.trim()) return

        try {
        // userId는 보내지 않음 (백엔드가 토큰에서 찾음)
        await createComment({
            answerId,
            content: newComment,
            parentCommentId: null,
        })
        setNewComment("")
        loadComments()
        } catch (err) {
        console.error("댓글 작성 실패:", err)
        alert("댓글 작성에 실패했습니다.")
        }
    }

    // ✅ 대댓글 등록
    const handleCreateReply = async (parentCommentId) => {
        if (!user) return alert("로그인이 필요합니다.")
        if (!replyContent.trim()) return

        try {
        await createComment({
            answerId,
            content: replyContent,
            parentCommentId,
        })
        setReplyingTo(null)
        setReplyContent("")
        loadComments() // 목록 갱신 -> 자동으로 펼쳐진 상태 유지됨
        
        // 답글 단 그룹을 자동으로 펼쳐주기 (UX 향상)
        setExpandedGroups(prev => ({ ...prev, [parentCommentId]: true }))
        } catch (err) {
        console.error("대댓글 작성 실패:", err)
        alert("대댓글 작성에 실패했습니다.")
        }
    }

    // ✅ 댓글 수정
    const handleUpdateComment = async (commentId) => {
        if (!editContent.trim()) return
        try {
            await updateComment(commentId, { content: editContent })
            setEditingCommentId(null)
            setEditContent("")
            loadComments()
        } catch (err) {
            console.error("댓글 수정 실패:", err)
            alert("댓글 수정에 실패했습니다.")
        }
    }

    // ✅ 댓글 삭제
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("댓글을 삭제하시겠습니까?")) return

        try {
        // userId 파라미터 없이 호출 (백엔드가 토큰으로 본인 확인)
        await deleteComment(commentId)
        loadComments()
        } catch (err) {
        console.error("댓글 삭제 실패:", err)
        alert(err.response?.data || "댓글 삭제에 실패했습니다.")
        }
    }

    const startEditing = (comment) => {
        setEditingCommentId(comment.commentId)
        setEditContent(comment.content)
    }

    // 트리 구조 평탄화 (재귀)
    const flattenCommentTree = (comment) => {
        const flattened = [comment]
        if (comment.children && comment.children.length > 0) {
        comment.children.forEach((child) => {
            flattened.push(...flattenCommentTree(child))
        })
        }
        return flattened
    }

    const toggleGroup = (parentId) => {
        setExpandedGroups((prev) => ({
        ...prev,
        [parentId]: !prev[parentId],
        }))
    }

  // 렌더링 헬퍼 함수
    const renderCommentGroup = (parentComment) => {
        const flatComments = flattenCommentTree(parentComment)
        const parentId = parentComment.commentId
        const isExpanded = !!expandedGroups[parentId]

        const visibleComments = isExpanded ? flatComments : flatComments.slice(0, 1)
        const restCount = flatComments.length - 1

    return (
        <div key={parentId} className="comment-group">
            {visibleComments.map((comment, index) => {
            const isParent = index === 0 // 첫 번째 요소가 부모
            
            // ✅ [핵심] 내가 쓴 댓글인지 확인 (user.userId 와 comment.userId 비교)
            // user가 null일 수 있으므로 옵셔널 체이닝(?.) 사용
            const isMyComment = user?.userId === comment.userId

            return (
                <div
                key={comment.commentId}
                className={`comment-item ${!isParent ? "reply-item" : ""}`}
                >
                {editingCommentId === comment.commentId ? (
                    // 수정 모드
                    <div className="comment-edit-box">
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                    />
                    <div className="comment-edit-actions">
                        <button className="save-btn" onClick={() => handleUpdateComment(comment.commentId)}>
                        저장
                        </button>
                        <button className="cancel-btn" onClick={() => setEditingCommentId(null)}>
                        취소
                        </button>
                    </div>
                    </div>
                ) : (
                    // 읽기 모드
                    <>
                    <div className="comment-header">
                        <span className="comment-author">{comment.userName}</span>
                        <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    <p className="comment-content">{comment.content}</p>

                    <div className="comment-actions">
                        {/* 답글 버튼은 로그인한 사람 누구나 가능 */}
                        <button onClick={() => {
                            if(!user) return alert("로그인이 필요합니다.");
                            setReplyingTo(parentId);
                        }}>답글</button>

                        {/* ✅ 수정/삭제 버튼은 '내 댓글'일 때만 보임 */}
                        {isMyComment && (
                            <>
                                <button onClick={() => startEditing(comment)}>수정</button>
                                <button onClick={() => handleDeleteComment(comment.commentId)}>삭제</button>
                            </>
                        )}
                    </div>
                    </>
                )}

                {/* 답글 입력창 위치 계산 로직 (기존 유지) */}
                {replyingTo === parentId &&
                    ((!isExpanded && isParent) || (isExpanded && index === visibleComments.length - 1)) && (
                    <div className="reply-box">
                        <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="답글을 입력하세요..."
                        rows={2}
                        />
                        <div className="reply-actions">
                        <button className="submit-btn" onClick={() => handleCreateReply(parentId)}>
                            답글 등록
                        </button>
                        <button className="cancel-btn" onClick={() => setReplyingTo(null)}>
                            취소
                        </button>
                        </div>
                    </div>
                    )}
                </div>
            )
            })}

            {/* 더보기 버튼 */}
            {restCount > 0 && (
            <button type="button" className="comment-toggle-btn" onClick={() => toggleGroup(parentId)}>
                {isExpanded ? "댓글 접기" : `댓글 ${restCount}개 더보기`}
            </button>
            )}
        </div>
        )
    }

    // 최상위 댓글(부모가 null인 것)만 필터링해서 렌더링 시작
    const topLevelComments = comments.filter((comment) => !comment.parentCommentId)

    return (
        <div className="answer-comments">
        {/* 최상단 댓글 입력창 */}
        <div className="comment-input-section">
            <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? "댓글을 입력하세요." : "로그인 후 댓글을 작성할 수 있습니다."}
            rows={3}
            maxLength={1000}
            disabled={!user} // 로그인 안 하면 입력 불가
            />
            <div className="comment-input-footer">
            <span className="char-count">{newComment.length} / 1000</span>
            <button 
                className="submit-comment-btn" 
                onClick={handleCreateComment}
                disabled={!user || !newComment.trim()} // 로그인 안 했거나 빈 내용이면 버튼 비활성
            >
                등록
            </button>
            </div>
        </div>

        <div className="comments-list">
            {comments.length === 0 ? (
            <p className="no-comments">아직 댓글이 없습니다.</p>
            ) : (
            topLevelComments.map((comment) => renderCommentGroup(comment))
            )}
        </div>
        </div>
    )
}

export default AnswerComments