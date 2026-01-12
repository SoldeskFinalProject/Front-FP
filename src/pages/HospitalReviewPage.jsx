// src/pages/HospitalReviewPage.jsx
"use client";

import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { createHospitalReview } from "../api/hospitalApi";
import "./HospitalReviewPage.css";

// 0.5 단위 평점 옵션
const RATING_OPTIONS = [
  { value: 5.0, label: "5.0" },
  { value: 4.5, label: "4.5" },
  { value: 4.0, label: "4.0" },
  { value: 3.5, label: "3.5" },
  { value: 3.0, label: "3.0" },
  { value: 2.5, label: "2.5" },
  { value: 2.0, label: "2.0" },
  { value: 1.5, label: "1.5" },
  { value: 1.0, label: "1.0" },
];

function getRatingText(value) {
  if (value >= 4.5) return "매우 만족";
  if (value >= 3.5) return "만족";
  if (value >= 2.5) return "보통";
  if (value >= 1.5) return "불만족";
  return "매우 불만족";
}

export default function HospitalReviewPage() {
  const { hospitalId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { hospital, selectedSymptoms = [] } = location.state || {};

  const [rating, setRating] = useState(5.0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!hospital) {
    return (
      <div className="review-page-container">
        <p>병원 정보가 없습니다. 증상 분석 결과 페이지에서 다시 시도해 주세요.</p>
        <button className="review-back-btn" onClick={() => navigate("/result")}>
          결과 페이지로 이동
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hospitalId) {
      alert("병원 정보가 없습니다. 다시 시도해 주세요.");
      return;
    }

    if (!content.trim()) {
      alert("리뷰 내용을 입력해 주세요.");
      return;
    }

    const payload = {
      rating, // 0.5 단위 숫자
      content,
      // userId는 보내지 않으면 서버에서 TEST_USER_ID(1L)로 처리
    };

    try {
      setSubmitting(true);
      await createHospitalReview(hospitalId, payload);
      alert("리뷰가 등록되었습니다.");
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert(err.message || "리뷰 등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRatingText = getRatingText(rating);

  return (
    <div className="review-page-container">
      {/* 상단 병원 정보 카드 */}
      <section className="review-section review-section--card">
        <h2 className="review-hospital-name">
          {hospital.name || hospital.yadmNm || "병원 이름 없음"}
        </h2>
        <p className="review-hospital-addr">
          {hospital.roadAddress ||
            hospital.jibunAddress ||
            hospital.addr ||
            hospital.address ||
            ""}
        </p>
        {(hospital.tel || hospital.telno) && (
          <p className="review-hospital-tel">
            ☎ {hospital.tel || hospital.telno}
          </p>
        )}
      </section>

      {/* 선택한 증상 배너 */}
      {selectedSymptoms.length > 0 && (
        <section className="review-section">
          <div className="review-symptom-banner">
            <p className="review-symptom-title">선택한 증상</p>
            <p className="review-symptom-text">
              {selectedSymptoms.map((s) => s.symptomName).join(", ")}
            </p>
          </div>
        </section>
      )}

      {/* 평점 + 리뷰 입력 카드 */}
      <section className="review-section review-section--card">
        {/* 평점 */}
        <div className="review-field">
          <p className="review-label">평점 (1.0 ~ 5.0, 0.5 단위)</p>
          <p className="review-rating-summary">
            선택한 평점: <strong>{rating.toFixed(1)}점</strong> ·{" "}
            <span>{selectedRatingText}</span>
          </p>

          <div className="review-rating-grid">
            {RATING_OPTIONS.map((opt) => {
              const active = rating === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={[
                    "review-rating-btn",
                    active ? "review-rating-btn--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setRating(opt.value)}
                >
                  <span className="review-rating-btn-score">
                    {opt.value.toFixed(1)}
                  </span>
                  <span className="review-rating-btn-text">
                    {getRatingText(opt.value)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 내용 입력 */}
        <form onSubmit={handleSubmit} className="review-form">
          <div className="review-field">
            <p className="review-label">리뷰 내용</p>
            <textarea
              className="review-textarea"
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="진료를 받으신 경험을 솔직하게 남겨주세요. (예: 대기 시간, 설명의 친절함, 치료 만족도 등)"
            />
          </div>

          {/* 버튼 영역 */}
          <div className="review-button-row">
            <button
              type="button"
              className="review-cancel-btn"
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="review-submit-btn"
              disabled={submitting}
            >
              {submitting ? "등록 중..." : "리뷰 등록"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
