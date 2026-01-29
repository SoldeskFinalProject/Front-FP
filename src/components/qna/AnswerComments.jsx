"use client"

import { useState, useEffect, useCallback } from "react"
import { getCommentsByAnswer, createComment, updateComment, deleteComment } from "../../api/qnaAPI"
import { useAuth } from "../../contexts/AuthContext"
import { createReport } from "../../api/reportAPI"
import ReportModal from "../common/ReportModal"
import "./AnswerComments.css"

// 트리 구조 변환 함수 (백엔드가 1차원 리스트로 줄 때)
const buildCommentTree = (flatComments) => {
    const commentMap = {};
    const roots = [];
    flatComments.forEach(c => {
        commentMap[c.commentId] = { ...c, children: [] };
    });
    flatComments.forEach(c => {
        if (c.parentCommentId) {
            if (commentMap[c.parentCommentId]) {
                commentMap[c.parentCommentId].children.push(commentMap[c.commentId]);
            }
        } else {
            roots.push(commentMap[c.commentId]);
        }
    });
    return roots;
};

const AnswerComments = ({ answerId }) => {
    const { user } = useAuth()
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState("")

    // 답글/수정/더보기 상태
    const [replyingTo, setReplyingTo] = useState(null)
    const [replyContent, setReplyContent] = useState("")
    const [editingCommentId, setEditingCommentId] = useState(null)
    const [editContent, setEditContent] = useState("")
    const [expandedGroups, setExpandedGroups] = useState({})

    // ✅ 신고 모달 상태 (댓글 전용)
    const [reportModal, setReportModal] = useState({ open: false, type: null, id: null });

    const loadComments = useCallback(async () => {
        if (!answerId) return;
        try {
            const data = await getCommentsByAnswer(answerId)
            const treeData = buildCommentTree(data) // 트리 구조로 변환
            setComments(treeData)
        } catch (err) {
            console.error("댓글 로드 실패:", err)
        }
    }, [answerId])

    useEffect(() => {
        loadComments()
    }, [loadComments])

    // --- 핸들러들 ---
    const handleCreateComment = async () => {
        if (!user) return alert("로그인이 필요합니다.")
        if (!newComment.trim()) return
        try {
            await createComment({ answerId, content: newComment, parentCommentId: null })
            setNewComment("")
            loadComments()
        } catch (err) {
            console.error(err); alert("댓글 작성 실패")
        }
    }

    const handleCreateReply = async (parentCommentId) => {
        if (!user) return alert("로그인이 필요합니다.")
        if (!replyContent.trim()) return
        try {
            await createComment({ answerId, content: replyContent, parentCommentId })
            setReplyingTo(null)
            setReplyContent("")
            await loadComments()
            setExpandedGroups(prev => ({ ...prev, [parentCommentId]: true }))
        } catch (err) {
            console.error(err); alert("대댓글 작성 실패")
        }
    }

    const handleUpdateComment = async (commentId) => {
        if (!editContent.trim()) return
        try {
            await updateComment(commentId, { content: editContent })
            setEditingCommentId(null)
            setEditContent("")
            loadComments()
        } catch (err) {
            console.error(err); alert("댓글 수정 실패")
        }
    }

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("댓글을 삭제하시겠습니까?")) return
        try {
            await deleteComment(commentId)
            loadComments()
        } catch (err) {
            console.error(err); alert("댓글 삭제 실패")
        }
    }

    // 신고 열기
    const openReport = (type, id) => {
        if (!user) return alert("로그인이 필요합니다.");
        setReportModal({ open: true, type, id });
    };

    const handleReportSubmit = async (reason) => {
        try {
            await createReport({ targetType: reportModal.type, targetId: reportModal.id, reason });
            alert("신고가 접수되었습니다.");
            setReportModal({ open: false, type: null, id: null });
        } catch (err) {
            console.error("", err)
            alert("신고 처리 중 오류가 발생했습니다.");
        }
    };

    // --- 렌더링 ---
    const renderCommentGroup = (parentComment) => {
        // (트리 평탄화 함수 필요 시 컴포넌트 내부나 외부에 정의)
        const flatten = (node) => {
            let res = [node];
            if (node.children) node.children.forEach(c => res.push(...flatten(c)));
            return res;
        }
        const flatComments = flatten(parentComment);
        const parentId = parentComment.commentId
        const isExpanded = !!expandedGroups[parentId]
        const visibleComments = isExpanded ? flatComments : flatComments.slice(0, 1)
        const restCount = flatComments.length - 1

        return (
            <div key={parentId} className="comment-group">
                {visibleComments.map((comment, index) => {
                    const isParent = index === 0
                    const isMyComment = user && String(user.userId) === String(comment.userId)

                    return (
                        <div key={comment.commentId} className={`comment-item ${!isParent ? "reply-item" : ""}`}>
                            {editingCommentId === comment.commentId ? (
                                <div className="comment-edit-box">
                                    <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={2} />
                                    <div className="comment-edit-actions">
                                        <button className="save-btn" onClick={() => handleUpdateComment(comment.commentId)}>저장</button>
                                        <button className="cancel-btn" onClick={() => setEditingCommentId(null)}>취소</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* ✅ 댓글 헤더: 작성자/날짜 (왼쪽) vs 신고/삭제 (오른쪽) */}
                                    <div className="comment-header-row">
                                        <div className="comment-info">
                                            <span className="comment-author">{comment.userName}</span>
                                            <span className="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        
                                        {/* ✅ 우측 상단 버튼들 */}
                                        <div className="comment-top-actions">
                                            {isMyComment ? (
                                                <>
                                                    <span onClick={() => { setEditingCommentId(comment.commentId); setEditContent(comment.content); }}>수정</span>
                                                    <span onClick={() => handleDeleteComment(comment.commentId)}>삭제</span>
                                                </>
                                            ) : (
                                                <span className="report-link" onClick={() => openReport("COMMENT", comment.commentId)}>
                                                    🚨 신고
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <p className="comment-content">{comment.content}</p>

                                    {/* 하단 답글 달기 버튼 */}
                                    <div className="comment-bottom-actions">
                                        <button className="reply-btn" onClick={() => {
                                            if (!user) return alert("로그인이 필요합니다.");
                                            setReplyingTo(parentId);
                                        }}>답글 달기</button>
                                    </div>
                                </>
                            )}

                            {/* 답글 입력창 */}
                            {replyingTo === parentId &&
                                ((!isExpanded && isParent) || (isExpanded && index === visibleComments.length - 1)) && (
                                    <div className="reply-box">
                                        <textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="답글 입력..." rows={2} />
                                        <div className="reply-actions">
                                            <button className="submit-btn" onClick={() => handleCreateReply(parentId)}>등록</button>
                                            <button className="cancel-btn" onClick={() => setReplyingTo(null)}>취소</button>
                                        </div>
                                    </div>
                                )}
                        </div>
                    )
                })}
                {restCount > 0 && (
                    <button className="comment-toggle-btn" onClick={() => setExpandedGroups(prev => ({ ...prev, [parentId]: !prev[parentId] }))}>
                        {isExpanded ? "접기" : `댓글 ${restCount}개 더보기`}
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className="answer-comments">
            <div className="comment-input-section">
                <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder={user ? "댓글을 입력하세요." : "로그인 필요"} disabled={!user} />
                <button className="submit-comment-btn" onClick={handleCreateComment} disabled={!user || !newComment.trim()}>등록</button>
            </div>
            <div className="comments-list">
                {comments.length === 0 ? <p className="no-comments">댓글이 없습니다.</p> : comments.map(renderCommentGroup)}
            </div>
            <ReportModal isOpen={reportModal.open} onClose={() => setReportModal({ ...reportModal, open: false })} onSubmit={handleReportSubmit} targetType={reportModal.type} />
        </div>
    )
}

export default AnswerComments