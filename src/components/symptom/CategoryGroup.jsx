"use client"

import { useState, useEffect } from "react"
import { getGroupsByCategory } from "../../api/symptomAPI"
import "./CategoryGroup.css"

const CategoryGroup = ({ selectedCategory, selectedGroup, setSelectedGroup }) => {
    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (selectedCategory) {
        setLoading(true)
        getGroupsByCategory(selectedCategory.categoryId)
            .then((data) => {
            console.log("📦 불러온 증상 그룹:", data)
            setGroups(data)
            })
            .catch((err) => {
            console.error("증상 그룹 불러오기 실패:", err)
            setGroups([])
            })
            .finally(() => {
            setLoading(false)
            })
        } else {
        setGroups([])
        }
    }, [selectedCategory])

    const handleGroupClick = (group) => {
        console.log("✅ 선택한 그룹:", group)
        setSelectedGroup(group)
    }

    if (!selectedCategory) {
        return <p className="info-text">먼저 카테고리를 선택해주세요.</p>
    }

    if (loading) {
        return <p className="loading-text">그룹을 불러오는 중...</p>
    }

    if (groups.length === 0) {
        return <p className="info-text">해당 카테고리에 증상 그룹이 없습니다.</p>
    }

    return (
        <div className="category-group-container">
        <div className="group-buttons">
            {groups.map((group) => (
            <button
                key={group.groupId}
                className={`group-btn ${selectedGroup?.groupId === group.groupId ? "active" : ""}`}
                onClick={() => handleGroupClick(group)}
            >
                {group.groupName}
            </button>
            ))}
        </div>
        </div>
    )
}

export default CategoryGroup
