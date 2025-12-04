import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createQuestion } from "../../api/qnaAPI"
import "./QnaCreate.css"

const QnaCreate = () => {
    const navigate = useNavigate()
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [status, setStatus] = useState("PUBLIC")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title.trim()) return alert("제목을 입력하세요.")
        if (!content.trim()) return alert("내용을 입력하세요.")

        const questionData = {
            title,
            content,
            status,
            userId: 1, // TODO 로그인 후 실제 사용자로 교체
        }

        try {
            setLoading(true)
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
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="질문 제목" />

            <label>내용</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="궁금한 점을 자세히 작성해주세요"></textarea>

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