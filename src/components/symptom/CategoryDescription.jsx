// components/symptom/CategoryDescription.jsx
import "./CategoryDescription.css"

export default function CategoryDescription({ category }) {
    if (!category) {
        return (
        <div className="category-description">
            <p>카테고리를 선택하면 해당 부위의 설명이 여기에 표시됩니다.</p>
        </div>
        )
    }

    return (
        <div className="category-description">
        <h4>{category.categoryName}</h4>
        <p>{category.description || "설명 정보가 없습니다."}</p>
        </div>
    )
}
