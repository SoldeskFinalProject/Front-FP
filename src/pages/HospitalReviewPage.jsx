// src/pages/HospitalReviewPage.jsx
"use client";

import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { createHospitalReview } from "../api/hospitalApi";
import "./HospitalReviewPage.css";

export default function HospitalReviewPage() {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { hospital, selectedSymptoms = [] } = location.state || {};

  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hospitalName = hospital?.name || "병원";

  // 선택한 증상들을 한 줄 텍스트로
  const symptomText =
    selectedSymptoms.length > 0
      ? selectedSymptoms.map((s) => s.symptomName).join(", ")
      : "";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numRating = Number(rating);
    if (Number.isNaN(numRating) || numRating < 1 || numRating > 5) {
      alert("평점은 1~5 사이의 숫자로 입력해 주세요.");
      return;
    }
    if (!content.trim()) {
      alert("리뷰 내용을 입력해 주세요.");
      return;
    }

    const payload = {
      // userId 는 보내지 않으면 백엔드에서 TEST_USER_ID(1L)로 처리
      rating: numRating,
      content: symptomText
        ? `[증상] ${symptomText}\n\n${content.trim()}`
        : content.trim(),
    };

    try {
      setSubmitting(true);
      await createHospitalReview(hospitalId, payload);
      alert("리뷰가 등록되었습니다.");

      // 직전 페이지로 돌아가기 (증상 결과 페이지)
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("리뷰 등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-page-container">
      <header className="review-header">
        <h2 className="review-title">병원 리뷰 작성</h2>
      </header>

      <section className="review-section">
        <div className="review-hospital-info">
          <h3 className="review-hospital-name">{hospitalName}</h3>
          {hospital?.addr && (
            <p className="review-hospital-addr">{hospital.addr}</p>
          )}
          {hospital?.tel && (
            <p className="review-hospital-tel">☎ {hospital.tel}</p>
          )}
        </div>

        {symptomText && (
          <div className="review-symptom-box">
            <span className="review-symptom-label">선택한 증상</span>
            <p className="review-symptom-text">{symptomText}</p>
          </div>
        )}

        <form className="review-form" onSubmit={handleSubmit}>
          <div className="review-field">
            <label className="review-label">평점 (1~5)</label>
            <select
              className="review-select"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              <option value={5}>5 - 매우 만족</option>
              <option value={4}>4 - 만족</option>
              <option value={3}>3 - 보통</option>
              <option value={2}>2 - 불만족</option>
              <option value={1}>1 - 매우 불만족</option>
            </select>
          </div>

          <div className="review-field">
            <label className="review-label">리뷰 내용</label>
            <textarea
              className="review-textarea"
              rows={6}
              placeholder="진료받으신 경험을 자세히 적어주세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="review-buttons">
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
