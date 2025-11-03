"use client"
import "./SymptomSelect.css"

const SymptomSelect = ({ symptoms, selectedSymptoms, onToggle }) => {
  console.log("🧩 현재 symptoms:", symptoms)

  if (!symptoms) {
    return <p>증상 목록을 불러오는 중입니다...</p>
  }

  if (Array.isArray(symptoms) && symptoms.length === 0) {
    return <p>해당 카테고리에 증상 정보가 없습니다.</p>
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
