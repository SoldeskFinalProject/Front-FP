import "./CategoryDescription.css"

export default function CategoryDescription({ category }) {
    if (!category) {
        return (
        <div className="category-description-container">
            <div className="description-placeholder">
            <p>카테고리를 선택하면 상세 정보가 표시됩니다.</p>
            </div>
        </div>
        )
    }

    return (
        <div className="category-description-container">
        <h3 className="description-title">{category.categoryName}</h3>

        <div className="description-content">
            <p className="description-text">{category.description || "해당 카테고리에 대한 설명이 없습니다."}</p>
        </div>

        <div className="description-info">
            <div className="info-item">
            <span className="info-label">선택된 카테고리</span>
            <span className="info-value">{category.categoryName}</span>
            </div>
        </div>
        </div>
    )
}
