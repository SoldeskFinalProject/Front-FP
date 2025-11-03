"use client"

import { useState, useEffect } from "react"
import CategorySelect from "../components/symptom/CategorySelect"
import SymptomSelect from "../components/symptom/SymptomSelect"
import SelectedSymptoms from "../components/symptom/SelectedSymptoms"
import RecommendationButton from "../components/symptom/RecommendationButton"
import { getAllCategories, getSymptomByCategory } from "../api/SymptomApi"
import "./SymptomPage.css"

export default function SymptomPage() {
  const [activeTab, setActiveTab] = useState("internal")
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [symptoms, setSymptoms] = useState([])
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [uploadedImage, setUploadedImage] = useState(null)

  // ✅ 카테고리 전체 조회
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories()
        setCategories(data)
      } catch (err) {
        console.error("카테고리 불러오기 실패:", err)
      }
    }
    fetchCategories()
  }, [])

  // ✅ 선택된 카테고리의 증상 조회
  useEffect(() => {
    if (selectedCategory) {
      getSymptomByCategory(selectedCategory.categoryId)
        .then((data) => {
          console.log("📋 불러온 증상:", data)
          setSymptoms(data)
        })
        .catch((err) => console.error("증상 불러오기 실패:", err))
    }
  }, [selectedCategory])

  // ✅ 증상 선택 / 해제 (누적)
  const handleSymptomToggle = (symptom) => {
    setSelectedSymptoms((prev) => {
      const alreadySelected = prev.some((s) => s.symptomId === symptom.symptomId)

      if (alreadySelected) {
        return prev.filter((s) => s.symptomId !== symptom.symptomId)
      } else {
        return [...prev, { ...symptom, categoryName: selectedCategory.categoryName }]
      }
    })
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // ✅ 병원 추천 버튼 클릭
  const handleRecommend = () => {
    if (activeTab === "internal" && selectedSymptoms.length === 0) {
      alert("증상을 1개 이상 선택해주세요.")
      return
    }
    if (activeTab === "external" && !uploadedImage) {
      alert("외상 이미지를 업로드해주세요.")
      return
    }
    console.log("추천 요청 데이터:", {
      tabType: activeTab,
      selectedSymptoms,
      uploadedImage,
    })
    alert("병원 추천 기능은 준비 중입니다.")
  }

  return (
    <div className="page-container">
      <div className="tab-container">
        <button
          className={`tab-btn ${activeTab === "internal" ? "active" : ""}`}
          onClick={() => setActiveTab("internal")}
        >
          내상
        </button>

        <button
          className={`tab-btn ${activeTab === "external" ? "active" : ""}`}
          onClick={() => setActiveTab("external")}
        >
          외상
        </button>
      </div>

      {activeTab === "internal" && (
        <>
          {/* 카테고리 선택 */}
          <section className="section">
            <h3 className="section-title">1. 카테고리 선택</h3>
            <CategorySelect
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </section>

          {/* 증상 선택 */}
          <section className="section">
            <h3 className="section-title">2. 증상 선택 (중복 가능)</h3>
            <SymptomSelect symptoms={symptoms} selectedSymptoms={selectedSymptoms} onToggle={handleSymptomToggle} />
          </section>

          {/* 선택된 증상 목록 */}
          <section className="section">
            <SelectedSymptoms selectedSymptoms={selectedSymptoms} setSelectedSymptoms={setSelectedSymptoms} />
          </section>
        </>
      )}

      {activeTab === "external" && (
        <section className="section">
          <h3 className="section-title">외상 이미지 업로드</h3>
          <div className="image-upload-container">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" id="image-upload" />
            <label htmlFor="image-upload" className="file-label">
              이미지 선택
            </label>

            {uploadedImage && (
              <div className="image-preview">
                <img src={uploadedImage || "/placeholder.svg"} alt="업로드된 외상 이미지" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* 병원 추천 버튼 */}
      <section className="section">
        <RecommendationButton
          disabled={activeTab === "internal" ? selectedSymptoms.length === 0 : !uploadedImage}
          onClick={handleRecommend}
        />
      </section>
    </div>
  )
}
