"use client"

import { useState, useEffect, useRef } from "react"
import { addUserInput, searchSymptoms } from "../../api/symptomAPI"
import "./SymptomSearch.css"

export default function SymptomSearch({ onSymptomAdd }) {
  const [inputText, setInputText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (inputText.trim().length >= 2) {
        setIsSearching(true)
        try {
          const results = await searchSymptoms(inputText.trim())
          console.log("[v0] 검색 결과:", results)
          setSearchResults(results || [])
          setShowDropdown(true)
        } catch (error) {
          console.error("[v0] 검색 실패:", error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
        setShowDropdown(false)
      }
    }, 300) // 300ms 디바운스

    return () => clearTimeout(delaySearch)
  }, [inputText])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelectSymptom = (symptom) => {
    console.log("[v0] 증상 선택:", symptom)
    
    if (onSymptomAdd) {
      onSymptomAdd({
        symptomId: symptom.symptomId,
        symptomName: symptom.symptomName,
        categoryName: symptom.categoryName,
        isCustom: false,
      })
    }

    // 선택 후 입력창 초기화 및 드롭다운 닫기
    setInputText("")
    setShowDropdown(false)
    setSearchResults([])
  }

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      alert("증상을 입력해주세요.")
      return
    }

    setIsSubmitting(true)
    setSubmitSuccess(false)
    setShowDropdown(false)

    try {
      const requestData = {
        userId: null,
        inputText: inputText.trim(),
        imageUrl: null,
      }

      const response = await addUserInput(requestData)
      console.log("증상 입력 성공:", response)

      setSubmitSuccess(true)

      if (onSymptomAdd) {
        onSymptomAdd({
          symptomId: `custom-${Date.now()}`,
          symptomName: inputText.trim(),
          categoryName: "사용자 입력",
          isCustom: true,
        })
      }

      setInputText("")

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
      if (showDropdown && searchResults.length > 0) {
        handleSelectSymptom(searchResults[0])
      } else {
        handleSubmit()
      }
    }
  }

  return (
    <div className="symptom-search-container">
      <div className="search-input-wrapper">
        <div className="search-input-container">
          <input
            ref={inputRef}
            type="text"
            className="symptom-search-input"
            placeholder="예: 두통, 기침, 복통 등 증상 키워드 입력"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowDropdown(true)
              }
            }}
            disabled={isSubmitting}
          />
          
          {showDropdown && (
            <div ref={dropdownRef} className="search-dropdown">
              {isSearching ? (
                <div className="dropdown-loading">검색 중...</div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="dropdown-header">검색 결과 (클릭하여 추가)</div>
                  {searchResults.map((symptom) => (
                    <div
                      key={symptom.symptomId}
                      className="dropdown-item"
                      onClick={() => handleSelectSymptom(symptom)}
                    >
                      <div className="dropdown-symptom-name">{symptom.symptomName}</div>
                      <div className="dropdown-category-name">{symptom.categoryName}</div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="dropdown-empty">
                  검색 결과가 없습니다. &quot;증상 등록&quot; 버튼으로 등록하세요.
                </div>
              )}
            </div>
          )}
        </div>
        
        <button className="symptom-search-btn" onClick={handleSubmit} disabled={isSubmitting || !inputText.trim()}>
          {isSubmitting ? "등록중..." : "증상 등록"}
        </button>
      </div>

      {submitSuccess && <div className="submit-success-message">증상이 성공적으로 등록되었습니다!</div>}

      <div className="search-help-text">
        키워드 입력 시 자동완성으로 등록된 증상을 검색할 수 있습니다. 
        없는 증상은 &quot;증상 등록&quot; 버튼으로 자유롭게 등록하세요.
      </div>
    </div>
  )
}
