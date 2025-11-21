// "use client"

import { useState, useEffect } from "react"
import "./CategorySelect.css"

const CategorySelect = ({ categories, selectedCategory, setSelectedCategory }) => {
    const [showOthersDropdown, setShowOthersDropdown] = useState(false)

    const mainCategories = ["머리", "목", "가슴", "배", "등", "엉덩이", "팔", "다리"]
    const otherCategories = ["눈", "귀", "코", "입", "전신", "피부", "골반", "손", "발"]

    useEffect(() => {
        console.log("[v0] 전체 카테고리 데이터:", categories)
        console.log(
        "[v0] 메인 카테고리 필터링 결과:",
        categories.filter((cat) => mainCategories.includes(cat.categoryName)),
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categories])

    const handleCategoryClick = (category) => {
        console.log("✅ 선택한 카테고리:", category)
        setSelectedCategory(category)
        setShowOthersDropdown(false)
    }

    return (
        <div className="category-select-container">
        {categories.length === 0 ? (
            <p className="loading-text">카테고리를 불러오는 중...</p>
        ) : (
            <div className="category-buttons">
            {/* 주요 카테고리 버튼들 */}
            {categories
                .filter((cat) => mainCategories.includes(cat.categoryName))
                .map((category) => (
                <button
                    key={category.categoryId}
                    className={`category-btn ${selectedCategory?.categoryId === category.categoryId ? "active" : ""}`}
                    onClick={() => handleCategoryClick(category)}
                >
                    {category.categoryName}
                </button>
                ))}

            {/* 그 외 카테고리 (호버 드롭다운) */}
            <div
                className="others-dropdown-wrapper"
                onMouseEnter={() => setShowOthersDropdown(true)}
                onMouseLeave={() => setShowOthersDropdown(false)}
            >
                <button
                className={`category-btn ${
                    selectedCategory && otherCategories.includes(selectedCategory.categoryName) ? "active" : ""
                }`}
                >
                그 외
                </button>
                
                {showOthersDropdown && (
                <div className="others-dropdown">
                    {categories
                    .filter((cat) => otherCategories.includes(cat.categoryName))
                    .map((category) => (
                        <button
                        key={category.categoryId}
                        className="dropdown-item"
                        onClick={() => handleCategoryClick(category)}
                        >
                        {category.categoryName}
                        </button>
                    ))}
                </div>
                )}
            </div>
            </div>
        )}
        </div>
    )
}

export default CategorySelect
