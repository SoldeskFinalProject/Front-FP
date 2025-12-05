import "./RecommendationButton.css"

const RecommendationButton = ({ disabled, onClick }) => {
  return (
    <div className="recommendation-button-container">
      <button disabled={disabled} onClick={onClick} className="recommendation-btn">
        진료과 / 병원 추천
      </button>
    </div>
  )
}

export default RecommendationButton
