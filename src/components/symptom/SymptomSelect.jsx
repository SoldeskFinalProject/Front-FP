"use client"
import "./SymptomSelect.css"

const SymptomSelect = ({ symptoms, selectedSymptoms, onToggle }) => {
  console.log("[v0] SymptomSelect - 받은 증상 데이터:", symptoms)
  console.log("[v0] SymptomSelect - 선택된 증상:", selectedSymptoms)

  if (!symptoms) {
    return <p className="info-message">증상 목록을 불러오는 중입니다...</p>
  }

  if (Array.isArray(symptoms) && symptoms.length === 0) {
    return <p className="info-message">해당 그룹에 증상 정보가 없습니다.</p>
  }

  return (
    <div className="symptom-select-container">
      <ul className="symptom-list">
        {symptoms.map((symptom) => {
          const isChecked = selectedSymptoms.some((s) => s.symptomId === symptom.symptomId)
          return (
            <li key={symptom.symptomId} className="symptom-item">
              <label>
                <input type="checkbox" checked={isChecked} onChange={() => onToggle(symptom)} />
                <span>{symptom.symptomName}</span>
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default SymptomSelect
