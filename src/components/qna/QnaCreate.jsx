import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createQuestion } from "../../api/qnaAPI"
import { useAuth } from "../../contexts/AuthContext"
import "./QnaCreate.css"

const QnaCreate = () => {
    const navigate = useNavigate()
    const { user } = useAuth() // 2. 현재 로그인한 유저 정보 가져오기
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [status, setStatus] = useState("PUBLIC")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        // 3. 로그인 체크
        if (!user) {
            alert("로그인이 필요한 서비스입니다.")
            navigate("/login")
            return
        }

        if (!title.trim()) return alert("제목을 입력하세요.")
        if (!content.trim()) return alert("내용을 입력하세요.")

        const questionData = {
            title,
            content,
            status,
        }

        try {
            setLoading(true)
            // 5. API 호출 (이 함수가 내부적으로 헤더에 토큰을 잘 넣어서 보내는지 확인 필요)
            await createQuestion(questionData)
            
            alert("질문이 등록되었습니다.")
            navigate("/qna")
        } catch (err) {
            console.error("질문 등록 실패:", err)
            alert("질문 등록 중 오류가 발생했습니다.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="qna-create-page">
            <h2>새 질문 작성</h2>

            <form onSubmit={handleSubmit} className="qna-create-form">
                <label>제목</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="질문 제목"
                />

                <label>내용</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="궁금한 점을 자세히 작성해주세요"
                ></textarea>

                <label>공개 여부</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="PUBLIC">공개</option>
                    <option value="PRIVATE">비공개</option>
                </select>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "등록 중..." : "질문 등록"}
                </button>
            </form>
        </div>
    )
}

export default QnaCreate