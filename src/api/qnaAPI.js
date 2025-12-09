import { api, QNA_ENDPOINTS } from "../config"

// 질문 목록 조회
export const getQuestionList = async (status = "PUBLIC", page = 0, size = 10, sort = null, hasAnswer = null) => {
  const params = { status, page, size }
  if (sort) params.sort = sort
  if (hasAnswer !== null) params.hasAnswer = hasAnswer

  const response = await api.get(QNA_ENDPOINTS.QUESTIONS, { params })
  return response.data
}

// 질문 상세 조회
export const getQuestionDetail = async (questionId) => {
  const response = await api.get(QNA_ENDPOINTS.QUESTION_DETAIL(questionId))
  return response.data
}

// 질문 생성
export const createQuestion = async (questionData) => {
  const response = await api.post(QNA_ENDPOINTS.QUESTION_CREATE, questionData)
  return response.data
}

// 질문 수정
export const updateQuestion = async (questionId, updateData) => {
  const response = await api.patch(QNA_ENDPOINTS.Question_UPDATE(questionId), updateData)
  return response.data
}

// 질문 삭제
export const deleteQuestion = async (questionId) => {
  const response = await api.delete(QNA_ENDPOINTS.QUESTION_DELETE(questionId))
  return response.data
}

// 질문 상태 변경
export const updateQuestionStatus = async (questionId, status) => {
  const response = await api.patch(QNA_ENDPOINTS.QUESTION_STATUS(questionId), null, {
    params: { status },
  })
  return response.data
}

// 답변 목록 조회
export const getAnswerList = async (questionId) => {
  const response = await api.get(QNA_ENDPOINTS.ANSWERS, {
    params: { questionId },
  })
  return response.data
}

// 답변 등록
export const createAnswer = async (questionId, answerData) => {
  const response = await api.post(`/api/answer?questionId=${questionId}`, answerData)
  return response.data
}

// 답변 수정
export const updateAnswer = async (answerId, updateData) => {
  const response = await api.patch(QNA_ENDPOINTS.ANSWER_UPDATE(answerId), updateData)
  return response.data
}

// 답변 삭제
export const deleteAnswer = async (answerId) => {
  const response = await api.delete(QNA_ENDPOINTS.ANSWER_DELETE(answerId))
  return response.data
}

// 답변 채택
export const acceptAnswer = async (questionId, answerId) => {
  const response = await api.patch(QNA_ENDPOINTS.QUESTION_ACCEPT(questionId, answerId))
  return response.data
}

// 댓글 목록 조회 (특정 답변의 댓글)
export const getCommentsByAnswer = async (answerId) => {
  const response = await api.get(QNA_ENDPOINTS.COMMENTS_BY_ANSWER(answerId))
  return response.data
}

// 댓글 또는 대댓글 생성
export const createComment = async (commentData) => {
  const response = await api.post(QNA_ENDPOINTS.COMMENTS, commentData)
  return response.data
}

// 댓글 수정
export const updateComment = async (commentId, userId, updateData) => {
  const response = await api.put(QNA_ENDPOINTS.COMMENT_UPDATE(commentId), updateData, {
    params: { userId },
  })
  return response.data
}

// 댓글 삭제
export const deleteComment = async (commentId, userId) => {
  const response = await api.delete(QNA_ENDPOINTS.COMMENT_DELETE(commentId), {
    params: { userId },
  })
  return response.data
}
