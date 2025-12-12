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

    const renderCommentGroup = (parentComment) => {
        const flatComments = flattenCommentTree(parentComment)

        return (
        <div key={parentComment.commentId} className="comment-group">
            {flatComments.map((comment, index) => {
            const isParent = index === 0
            return (
                <div key={comment.commentId} className={`comment-item ${!isParent ? "reply-item" : ""}`}>
                {editingCommentId === comment.commentId ? (
                    <div className="comment-edit-box">
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="댓글을 입력하세요..."
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
                    <>
                    <div className="comment-header">
                        <span className="comment-author">{comment.userName}</span>
                        <span className="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="comment-content">{comment.content}</p>
                    <div className="comment-actions">
                        <button onClick={() => setReplyingTo(parentComment.commentId)}>답글</button>
                        <button onClick={() => startEditing(comment)}>수정</button>
                        <button onClick={() => handleDeleteComment(comment.commentId)}>삭제</button>
                    </div>
                    </>
                )}

                {replyingTo === parentComment.commentId && index === flatComments.length - 1 && (
                    <div className="reply-box">
                    <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="답글을 입력하세요..."
                        rows={2}
                    />
                    <div className="reply-actions">
                        <button className="submit-btn" onClick={() => handleCreateReply(parentComment.commentId)}>
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
