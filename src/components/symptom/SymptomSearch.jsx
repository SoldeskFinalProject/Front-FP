"use client"

import { useState } from "react"
import { addUserInput } from "../../api/symptomAPI"
import "./SymptomSearch.css"

export default function SymptomSearch({ onSymptomAdd }) {
  const [inputText, setInputText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      alert("증상을 입력해주세요.")
      return
    }

    setIsSubmitting(true)
    setSubmitSuccess(false)

    try {
      const requestData = {
        userId: null, // 로그인 기능 구현 전에는 null
        inputText: inputText.trim(),
        imageUrl: null,
      }

      const response = await addUserInput(requestData)
      console.log("증상 입력 성공:", response)

      setSubmitSuccess(true)

      if (onSymptomAdd) {
        onSymptomAdd({
          symptomId: `custom-${Date.now()}`, // 임시 ID
          symptomName: inputText.trim(),
          categoryName: "사용자 입력",
          isCustom: true, // 사용자 입력 증상임을 표시
        })
      }

      setInputText("") // 입력창 초기화

      setTimeout(() => {
        setSubmitSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("증상 입력 실패:", error)
      alert("증상 입력에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isSubmitting) {
      handleSubmit()
    }
  }

  return (
    <div className="symptom-search-container">
      <div className="search-input-wrapper">
        <input
          type="text"
          className="symptom-search-input"
          placeholder="예: 머리가 지끈지끈 아파요, 기침이 심해요"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isSubmitting}
        />
        <button className="symptom-search-btn" onClick={handleSubmit} disabled={isSubmitting || !inputText.trim()}>
          {isSubmitting ? "등록중..." : "증상 등록"}
        </button>
      </div>

      {submitSuccess && <div className="submit-success-message">증상이 성공적으로 등록되었습니다!</div>}

      <div className="search-help-text">자연어로 증상을 자유롭게 입력하세요. 등록된 증상은 병원 추천에 활용됩니다.</div>
    </div>
  )
}
