import { useState } from "react"
import { searchSymptoms } from "../../api/symptomAPI"
import "./SymptomSearch.css"

export default function SymptomSearch({ onSelect }) {
  const [keyword, setKeyword] = useState("")
  const [results, setResults] = useState([])

  const handleSearch = async () => {
    if (!keyword.trim()) return
    const data = await searchSymptoms(keyword)
    setResults(data)
  }

  return (
    <div className="symptom-search">
      <div className="search-bar">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="증상 키워드를 입력하세요 (예: 속쓰림, 머리 아픔)"
        />
        <button onClick={handleSearch}>검색</button>
      </div>

      {results.length > 0 && (
        <div className="search-results">
          <p>🔍 검색 결과</p>
          <ul>
            {results.map((symptom) => (
              <li key={symptom.symptomId} onClick={() => onSelect(symptom)}>
                <strong>{symptom.symptomName}</strong>
                <p>{symptom.keywordTags || "관련 키워드 없음"}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
