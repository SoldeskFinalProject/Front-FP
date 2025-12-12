"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import CategorySelect from "../components/symptom/CategorySelect"
import CategoryGroup from "../components/symptom/CategoryGroup"
import SymptomSelect from "../components/symptom/SymptomSelect"
import SelectedSymptoms from "../components/symptom/SelectedSymptoms"
import RecommendationButton from "../components/symptom/RecommendationButton"
import SymptomSearch from "../components/symptom/SymptomSearch"
import CategoryDescription from "../components/symptom/CategoryDescription"
import { getAllCategories, getSymptomsByGroup } from "../api/symptomAPI"
import "./SymptomPage.css"

export default function SymptomPage() {
  const [activeTab, setActiveTab] = useState("internal")
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [symptoms, setSymptoms] = useState([])
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [uploadedImage, setUploadedImage] = useState(null)
  const navigate = useNavigate()

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

  useEffect(() => {
    if (selectedGroup && selectedCategory) {
      console.log("[v0] 증상 조회 시작:", {
        categoryId: selectedCategory.categoryId,
        groupId: selectedGroup.groupId,
      })

      getSymptomsByGroup(selectedCategory.categoryId, selectedGroup.groupId)
        .then((data) => {
          console.log("📋 불러온 증상:", data)
          setSymptoms(data)
        })
        .catch((err) => {
          console.error("증상 불러오기 실패:", err)
          setSymptoms([])
        })
    } else {
      setSymptoms([])
    }
  }, [selectedGroup, selectedCategory])

  useEffect(() => {
    setSelectedGroup(null)
    setSymptoms([])
  }, [selectedCategory])

  const handleSymptomToggle = (symptom) => {
    setSelectedSymptoms((prev) => {
      const alreadySelected = prev.some((s) => s.symptomId === symptom.symptomId)

      if (alreadySelected) {
        return prev.filter((s) => s.symptomId !== symptom.symptomId)
      } else {
        return [...prev, { ...symptom, categoryName: selectedCategory?.categoryName }]
      }
    })
  }

  const handleCustomSymptomAdd = (customSymptom) => {
    setSelectedSymptoms((prev) => {
      // 중복 체크 (같은 텍스트가 이미 있으면 추가하지 않음)
      const alreadyExists = prev.some((s) => s.symptomName === customSymptom.symptomName)
      if (alreadyExists) {
        return prev
      }
      return [...prev, customSymptom]
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

  const handleRecommend = () => {
    if (activeTab === "internal" && selectedSymptoms.length === 0) {
      alert("증상을 1개 이상 선택해주세요.")
      return
    }
    if (activeTab === "external" && !uploadedImage) {
      alert("외상 이미지를 업로드해주세요.")
      return
    }

    const resultData = {
      tabType: activeTab,
      selectedSymptoms,
      uploadedImage,
      timestamp: new Date().toISOString(),
    }

    console.log("[v0] 결과 페이지로 이동:", resultData)
    navigate("/result", { state: resultData })
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
        <div className="content-layout">
          <div className="main-section">
            <section className="section">
              <h3 className="section-title">1. 증상 검색 (자연어 입력)</h3>
              <SymptomSearch onSymptomAdd={handleCustomSymptomAdd} />
            </section>

            <section className="section">
              <h3 className="section-title">2. 카테고리 선택</h3>
              <CategorySelect
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            </section>

            {selectedCategory && (
              <section className="section">
                <h3 className="section-title">3. 증상 그룹 선택</h3>
                <CategoryGroup
                  selectedCategory={selectedCategory}
                  selectedGroup={selectedGroup}
                  setSelectedGroup={setSelectedGroup}
                />
              </section>
            )}

            {selectedGroup && (
              <section className="section">
                <h3 className="section-title">4. 증상 선택 (중복 가능)</h3>
                <SymptomSelect symptoms={symptoms} selectedSymptoms={selectedSymptoms} onToggle={handleSymptomToggle} />
              </section>
            )}

            {selectedSymptoms.length > 0 && (
              <section className="section">
                <h3 className="section-title">5. 선택된 증상</h3>
                <SelectedSymptoms selectedSymptoms={selectedSymptoms} setSelectedSymptoms={setSelectedSymptoms} />
              </section>
            )}
          </div>

          <aside className="side-section">
            <CategoryDescription category={selectedCategory} />
          </aside>
        </div>
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

      {((activeTab === "internal" && selectedSymptoms.length > 0) || (activeTab === "external" && uploadedImage)) && (
        <section className="section">
          <RecommendationButton
            disabled={activeTab === "internal" ? selectedSymptoms.length === 0 : !uploadedImage}
            onClick={handleRecommend}
          />
        </section>
      )}
    </div>
  )
}
