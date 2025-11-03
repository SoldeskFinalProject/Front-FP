"use client"
import "./SelectedSymptoms.css"

const SelectedSymptoms = ({ selectedSymptoms, setSelectedSymptoms }) => {
  if (selectedSymptoms.length === 0) {
    return null
  }

  const handleRemove = (symptomId) => {
    setSelectedSymptoms((prev) => prev.filter((s) => s.symptomId !== symptomId))
  }

  if (!SelectedSymptoms || selectedSymptoms.length == 0) {
    return <p>선택된 증상이 없습니다.</p>
  }

  // ✅ categoryName별로 그룹화
  const grouped = selectedSymptoms.reduce((acc, s) => {
    acc[s.categoryName] = acc[s.categoryName] || []
    acc[s.categoryName].push(s)
    return acc
  }, {})

  return (
    <div className="selected-symptoms-container">
      <h4 className="category-label">선택된 증상:</h4>
      {Object.entries(grouped).map(([categoryName, symptoms]) => (
        <div key={categoryName} className="category-group">
          <h5 className="category-label">{categoryName}</h5>
          <div className="symptom-tags">
            {symptoms.map((symptom) => (
              <span key={symptom.symptomId} className="symptom-tag">
                {symptom.symptomName}
                <button onClick={() => handleRemove(symptom.symptomId)} className="remove-btn">
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default SelectedSymptoms
