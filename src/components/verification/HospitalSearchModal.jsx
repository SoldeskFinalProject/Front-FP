"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { searchHospitals } from "../../api/userAPI"
import "./HospitalSearchModal.css"

const PAGE_SIZE = 10
const DEBOUNCE_MS = 250

const HospitalSearchModal = ({ onClose, onSelect }) => {
    const inputRef = useRef(null)
    const dropdownRef = useRef(null)
    const debounceRef = useRef(null)

    const [inputText, setInputText] = useState("")
    const [showDropdown, setShowDropdown] = useState(true)

    const [isSearching, setIsSearching] = useState(false)
    const [items, setItems] = useState([]) // 현재 페이지의 hospitals
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    const keyword = useMemo(() => inputText.trim(), [inputText])

    
    useEffect(() => {
        const prev = document.body.style.overflow
        document.body.style.overflow = "hidden"   // ✅ 배경 스크롤 잠금

        return () => {
            document.body.style.overflow = prev     // ✅ 모달 닫히면 복구
        }
    }, [])
    
    // 모달 열리면 기본 목록(키워드 없음) 0페이지 로드
    useEffect(() => {
        fetchPage("", 0)
        //// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // 드롭다운 바깥 클릭시 닫기 (증상 검색 느낌)
    useEffect(() => {
        const handleClickOutside = (e) => {
        if (!showDropdown) return
        if (dropdownRef.current && !dropdownRef.current.contains(e.target) && inputRef.current && !inputRef.current.contains(e.target)) {
            setShowDropdown(false)
        }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [showDropdown])

    const fetchPage = async (kw, nextPage) => {
        try {
        setIsSearching(true)
        const data = await searchHospitals(kw, nextPage, PAGE_SIZE)

        const content = Array.isArray(data?.content) ? data.content : []
        setItems(content)

        // Spring Page 메타
        setPage(typeof data?.number === "number" ? data.number : nextPage)
        setTotalPages(typeof data?.totalPages === "number" ? data.totalPages : 0)
        } catch (err) {
        console.error("병원 검색 실패:", err)
        setItems([])
        setPage(0)
        setTotalPages(0)
        } finally {
        setIsSearching(false)
        }
    }

    // 입력 변경 시 디바운스 검색 + 페이지 0으로 리셋
    const handleChange = (e) => {
        const v = e.target.value
        setInputText(v)
        setShowDropdown(true)

        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
        fetchPage(v.trim(), 0)
        }, DEBOUNCE_MS)
    }

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
        e.preventDefault()
        if (debounceRef.current) clearTimeout(debounceRef.current)
        fetchPage(keyword, 0)
        setShowDropdown(true)
        }
    }

    const handlePrev = () => {
        if (page <= 0) return
        fetchPage(keyword, page - 1)
    }

    const handleNext = () => {
        if (page >= totalPages - 1) return
        fetchPage(keyword, page + 1)
    }

    const handleSelectHospital = (hospital) => {
        // ✅ 선택 즉시 부모에게 전달
        onSelect(hospital)
        // UX: 선택 후 모달 닫고 싶으면 아래 주석 해제
        // onClose()
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
            <h2 className="modal-title">병원 검색</h2>
            <button className="modal-close" onClick={onClose}>✕</button>
            </div>

            <div className="modal-body">
            {/* ✅ 증상 검색 느낌의 검색 입력 + 드롭다운 */}
            <div className="search-input-container">
                <input
                ref={inputRef}
                type="text"
                className="symptom-search-input"
                placeholder="병원명 / 주소 / 전화번호로 검색"
                value={inputText}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                onFocus={() => setShowDropdown(true)}
                />

                {showDropdown && (
                <div ref={dropdownRef} className="search-dropdown">
                    {isSearching ? (
                    <div className="dropdown-loading">검색 중...</div>
                    ) : items.length > 0 ? (
                    <>
                        <div className="dropdown-header">
                        검색 결과 (클릭하여 선택)
                        <span className="dropdown-sub">
                            {totalPages > 0 ? ` · ${page + 1}/${totalPages} 페이지` : ""}
                        </span>
                        </div>

                        {items.map((h) => (
                        <div
                            key={h.hospitalId}
                            className="dropdown-item"
                            onClick={() => handleSelectHospital(h)}
                        >
                            <div className="dropdown-symptom-name">{h.dutyName}</div>
                            <div className="dropdown-category-name">{h.dutyAddr || "-"}</div>
                            {h.dutyTel1 && (
                            <div className="dropdown-category-name">☎ {h.dutyTel1}</div>
                            )}
                        </div>
                        ))}

                        {/* ✅ 페이징 버튼 */}
                        <div className="dropdown-pagination">
                        <button
                            type="button"
                            className="page-btn"
                            onClick={handlePrev}
                            disabled={page <= 0}
                        >
                            이전
                        </button>

                        <div className="page-indicator">
                            {totalPages === 0 ? "0/0" : `${page + 1} / ${totalPages}`}
                        </div>

                        <button
                            type="button"
                            className="page-btn"
                            onClick={handleNext}
                            disabled={totalPages === 0 || page >= totalPages - 1}
                        >
                            다음
                        </button>
                        </div>
                    </>
                    ) : (
                    <div className="dropdown-empty">
                        검색 결과가 없습니다.
                    </div>
                    )}
                </div>
                )}
            </div>

            {/* (선택) 아래에 안내 텍스트/버튼 등을 넣고 싶으면 여기에 */}
            </div>
        </div>
        </div>
    )
}

export default HospitalSearchModal
