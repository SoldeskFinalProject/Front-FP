"use client"

import { useState, useEffect } from "react"
import { getCommentsByAnswer, createComment, updateComment, deleteComment } from "../../api/qnaAPI"
import "./AnswerComments.css"

const AnswerComments = ({ answerId }) => {
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState("")
    const [replyingTo, setReplyingTo] = useState(null)
    const [replyContent, setReplyContent] = useState("")
    const [editingCommentId, setEditingCommentId] = useState(null)
    const [editContent, setEditContent] = useState("")
    const [expandedGroups, setExpandedGroups] = useState({})

    // 임시 사용자 ID (로그인 기능 없을 때)
    const TEMP_USER_ID = 1

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

    const handleCreateComment = async () => {
        if (!newComment.trim()) return

        try {
        await createComment({
            answerId,
            userId: TEMP_USER_ID,
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

    const handleCreateReply = async (parentCommentId) => {
        if (!replyContent.trim()) return

        try {
        await createComment({
            answerId,
            userId: TEMP_USER_ID,
            content: replyContent,
            parentCommentId,
        })
        setReplyingTo(null)
        setReplyContent("")
        loadComments()
        } catch (err) {
            console.error("대댓글 작성 실패:", err)
            alert("대댓글 작성에 실패했습니다.")
        }
    }

    const handleUpdateComment = async (commentId) => {
        console.log("PUT", commentId, TEMP_USER_ID, editContent)
        
        if (!editContent.trim()) return
        try {
        await updateComment(commentId, TEMP_USER_ID, { content: editContent })
        setEditingCommentId(null)
        setEditContent("")
        loadComments()
        } catch (err) {
        console.error("댓글 수정 실패:", err)
        alert("댓글 수정에 실패했습니다.")
        }
    }

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("댓글을 삭제하시겠습니까?")) return

        try {
        await deleteComment(commentId, TEMP_USER_ID)
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


    const renderCommentGroup = (parentComment) => {
        const flatComments = flattenCommentTree(parentComment)

        const parentId = parentComment.commentId
        const isExpanded = !!expandedGroups[parentId]

        const parentOnly = flatComments.slice(0, 1)           // ✅ 부모 1개
        const rest = flatComments.slice(1)                     // ✅ 나머지(대댓글 등)
        const restCount = rest.length

        // ✅ 화면에 보여줄 리스트: 펼치면 전체, 아니면 부모만
        const visibleComments = isExpanded ? flatComments : parentOnly

        return (
            <div key={parentId} className="comment-group">
            {visibleComments.map((comment, index) => {
                const isParent = index === 0

                return (
                <div
                    key={comment.commentId}
                    className={`comment-item ${!isParent ? "reply-item" : ""}`}
                >
                    {editingCommentId === comment.commentId ? (
                    <div className="comment-edit-box">
                        <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="댓글을 입력하세요..."
                        rows={2}
                        />
                        <div className="comment-edit-actions">
                        <button
                            className="save-btn"
                            onClick={() => handleUpdateComment(comment.commentId)}
                        >
                            저장
                        </button>
                        <button className="cancel-btn" onClick={() => setEditingCommentId(null)}>
                            취소
                        </button>
                        </div>
                    </div>
                    ) : (
                    <>
                        <div className="comment-header">
                        <span className="comment-author">{comment.userName}</span>
                        <span className="comment-date">
                            {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                        </div>

                        <p className="comment-content">{comment.content}</p>

                        <div className="comment-actions">
                        <button onClick={() => setReplyingTo(parentId)}>답글</button>
                        <button onClick={() => startEditing(comment)}>수정</button>
                        <button onClick={() => handleDeleteComment(comment.commentId)}>삭제</button>
                        </div>
                    </>
                    )}

                    {/* ✅ 답글 입력은: 접혀있으면 부모 바로 아래, 펼쳐있으면 '마지막 댓글 아래' */}
                    {replyingTo === parentId && (
                    (!isExpanded && isParent) ||
                    (isExpanded && index === visibleComments.length - 1)
                    ) && (
                    <div className="reply-box">
                        <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="답글을 입력하세요..."
                        rows={2}
                        />
                        <div className="reply-actions">
                        <button
                            className="submit-btn"
                            onClick={() => handleCreateReply(parentId)}
                        >
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

            {/* ✅ 더보기/접기 버튼 (부모 댓글 1개 외 나머지가 있을 때만) */}
            {restCount > 0 && (
                <button
                type="button"
                className="comment-toggle-btn"
                onClick={() => toggleGroup(parentId)}
                >
                {isExpanded ? "댓글 접기" : `댓글 ${restCount}개 더보기`}
                </button>
            )}
            </div>
        )
    }


    const topLevelComments = comments.filter((comment) => !comment.parentCommentId)

    return (
        <div className="answer-comments">
        <div className="comment-input-section">
            <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="개인정보를 공유 및 요청하거나, 명예 훼손, 무단 광고, 불법 정보 유포시 모니터링 후 삭제될 수 있으며, 이에 대한 민형사상 책임은 게시자에게 있습니다."
            rows={3}
            maxLength={1000}
            />
            <div className="comment-input-footer">
            <span className="char-count">{newComment.length} / 1000</span>
            <button className="submit-comment-btn" onClick={handleCreateComment}>
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
