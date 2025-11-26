import { api, QNA_ENDPOINTS } from "../config"

// 질문 목록 조회
export const getQuestionList = async (status = "PUBLIC", page = 0, size = 10) => {
  const response = await api.get(QNA_ENDPOINTS.QUESTIONS, {
    params: { status, page, size },
  })
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

// 답변 생성
export const createAnswer = async (answerData) => {
  const response = await api.post(QNA_ENDPOINTS.ANSWER_CREATE, answerData)
  return response.data
}

// 답변 채택
export const acceptAnswer = async (questionId, answerId) => {
  const response = await api.patch(QNA_ENDPOINTS.QUESTION_ACCEPT(questionId, answerId))
  return response.data
}