// src/pages/HospitalReviewPage.jsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../config";
import { useAuth } from "../contexts/AuthContext";
import "./HospitalReviewPage.css";

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
  const navigate = useNavigate();
  const { reservationId } = useParams();
  const { user } = useAuth();

  const userId = useMemo(() => user?.userId || user?.id, [user]);

  // 공통 상태
  const [loading, setLoading] = useState(true);
  const [ctx, setCtx] = useState(null);
  const [error, setError] = useState("");

  // 작성/수정용
  const [rating, setRating] = useState(5.0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 조회용 (이미 작성된 리뷰)
  const [reviewDetail, setReviewDetail] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const selectedRatingText = useMemo(() => getRatingText(rating), [rating]);

  const fetchContext = useCallback(async () => {
    if (!reservationId) {
      setError("예약 정보가 없습니다.");
      setLoading(false);
      return;
    }
    if (!userId) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.get(
        `/api/hospitals/reservations/${reservationId}/review-context`,
        { params: { userId } }
      );

      const data = res.data;
      setCtx(data);

      // 완료 예약이 아니면 작성/조회 불가
      if (data?.status !== "COMPLETED") {
        setError("진료 완료된 예약만 리뷰를 작성/조회할 수 있습니다.");
        setReviewDetail(null);
        return;
      }

      // ✅ 이미 리뷰면: 리뷰 상세 조회
      if (data?.reviewed === true) {
        const detail = await api.get(
          `/api/hospitals/reservations/${reservationId}/review`,
          { params: { userId } }
        );

        setReviewDetail(detail.data || null);
        setEditMode(false);

        // 조회 화면은 폼 초기값도 리뷰 값으로 세팅해두면 수정 전환이 쉬움
        const r = Number(detail.data?.rating ?? 5.0);
        setRating(Number.isFinite(r) ? r : 5.0);
        setContent(detail.data?.content ?? "");
      } else {
        // 미작성: 작성 모드
        setReviewDetail(null);
        setEditMode(false);
        setRating(5.0);
        setContent("");
      }
    } catch (e) {
      console.error("리뷰 컨텍스트/상세 조회 실패:", e);
      setError(
        e?.response?.data?.message ||
          e?.response?.data ||
          "리뷰 정보를 불러오지 못했습니다."
      );
      setCtx(null);
      setReviewDetail(null);
    } finally {
      setLoading(false);
    }
  }, [reservationId, userId]);

  useEffect(() => {
    fetchContext();
  }, [fetchContext]);

  const isReviewed = useMemo(() => ctx?.reviewed === true, [ctx]);

  const canSubmitCreate = useMemo(() => {
    if (loading || submitting) return false;
    if (!ctx) return false;
    if (ctx.status !== "COMPLETED") return false;
    if (ctx.reviewed === true) return false; // 작성은 미작성일 때만
    if (!content.trim()) return false;
    return true;
  }, [loading, submitting, ctx, content]);

  const canSubmitEdit = useMemo(() => {
    if (loading || submitting) return false;
    if (!reviewDetail) return false;
    if (!editMode) return false;
    if (!content.trim()) return false;
    return true;
  }, [loading, submitting, reviewDetail, editMode, content]);

  // ✅ 미작성일 때: 리뷰 작성
  const handleCreate = useCallback(
    async (e) => {
      e.preventDefault();

      if (!canSubmitCreate) {
        alert(error || "리뷰를 작성할 수 없습니다.");
        return;
      }

      try {
        setSubmitting(true);

        const payload = {
          userId,
          reservationId: Number(reservationId),
          rating: Number(rating),
          content: content.trim(),
        };

        await api.post("/api/hospitals/reviews", payload);

        alert("리뷰가 등록되었습니다.");
        // 등록 후 바로 조회 화면으로 전환
        await fetchContext();
      } catch (err) {
        console.error(err);
        alert(
          err?.response?.data?.message ||
            err?.response?.data ||
            err?.message ||
            "리뷰 등록 중 오류가 발생했습니다."
        );
      } finally {
        setSubmitting(false);
      }
    },
    [canSubmitCreate, error, userId, reservationId, rating, content, fetchContext]
  );

  // ✅ 작성된 리뷰 수정
  const handleUpdate = useCallback(
    async (e) => {
      e.preventDefault();

      if (!canSubmitEdit) {
        alert("수정 내용을 확인해 주세요.");
        return;
      }

      try {
        setSubmitting(true);

        const reviewId = reviewDetail?.reviewId;
        if (!reviewId) {
          alert("리뷰 ID가 없어 수정할 수 없습니다.");
          return;
        }

        // 백엔드가 (userId, rating, content) 정도 받는 구조면 이대로 OK
        const payload = {
          rating: Number(rating),
          content: content.trim(),
        };

        await api.put(`/api/hospitals/reviews/${reviewId}`, payload, {
          params: { userId },
        });

        alert("리뷰가 수정되었습니다.");
        setEditMode(false);
        await fetchContext();
      } catch (err) {
        console.error(err);
        alert(
          err?.response?.data?.message ||
            err?.response?.data ||
            err?.message ||
            "리뷰 수정 중 오류가 발생했습니다."
        );
      } finally {
        setSubmitting(false);
      }
    },
    [canSubmitEdit, reviewDetail, userId, rating, content, fetchContext]
  );

  // ✅ 작성된 리뷰 삭제
  const handleDelete = useCallback(async () => {
    if (!reviewDetail?.reviewId) {
      alert("리뷰 ID가 없어 삭제할 수 없습니다.");
      return;
    }
    if (!window.confirm("정말로 리뷰를 삭제하시겠습니까?")) return;

    try {
      setSubmitting(true);

      await api.delete(`/api/hospitals/reviews/${reviewDetail.reviewId}`, {
        params: { userId },
      });

      alert("리뷰가 삭제되었습니다.");
      navigate("/mypage/reservations", { replace: true });
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "리뷰 삭제 중 오류가 발생했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  }, [reviewDetail, userId, navigate]);

  if (loading) {
    return (
      <div className="review-page-container">
        <p>리뷰 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="review-page-container">
        <p>{error}</p>
        <div className="review-button-row">
          <button className="review-back-btn" onClick={() => navigate(-1)}>
            이전으로
          </button>
          <button className="review-back-btn" onClick={() => navigate("/mypage/reservations")}>
            내 예약으로
          </button>
        </div>
      </div>
    );
  }

  // ✅ 1) 이미 리뷰가 있으면: "조회/수정/삭제" 화면
  if (isReviewed && reviewDetail) {
    return (
      <div className="review-page-container">
        <section className="review-section review-section--card">
          <h2 className="review-hospital-name">
            {reviewDetail.hospitalName || "병원 이름 없음"}
          </h2>

          {ctx?.reservedAt && (
            <p className="review-hospital-addr">
              예약일시:{" "}
              {new Date(ctx.reservedAt).toLocaleString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}

          {ctx?.patientName && (
            <p className="review-hospital-tel">환자: {ctx.patientName}</p>
          )}
        </section>

        <section className="review-section review-section--card">
          <div className="review-field">
            <p className="review-label">평점</p>
            <p className="review-rating-summary">
              <strong>{Number(reviewDetail.rating ?? rating).toFixed(1)}점</strong> ·{" "}
              <span>{getRatingText(Number(reviewDetail.rating ?? rating))}</span>
            </p>
          </div>

          {!editMode ? (
            <>
              <div className="review-field">
                <p className="review-label">리뷰 내용</p>
                <div className="review-textarea" style={{ whiteSpace: "pre-wrap" }}>
                  {reviewDetail.content || "(내용 없음)"}
                </div>
              </div>

              <div className="review-button-row">
                <button
                  type="button"
                  className="review-cancel-btn"
                  onClick={() => navigate("/mypage/reservations")}
                  disabled={submitting}
                >
                  내 예약으로
                </button>
                <button
                  type="button"
                  className="review-submit-btn"
                  onClick={() => setEditMode(true)}
                  disabled={submitting}
                >
                  수정
                </button>
                <button
                  type="button"
                  className="review-submit-btn"
                  onClick={handleDelete}
                  disabled={submitting}
                >
                  삭제
                </button>
              </div>
            </>
          ) : (
            // ✅ 수정 모드
            <form onSubmit={handleUpdate} className="review-form">
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
                        <span className="review-rating-btn-score">{opt.value.toFixed(1)}</span>
                        <span className="review-rating-btn-text">{getRatingText(opt.value)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="review-field">
                <p className="review-label">리뷰 내용</p>
                <textarea
                  className="review-textarea"
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="진료 경험을 남겨주세요."
                />
              </div>

              <div className="review-button-row">
                <button
                  type="button"
                  className="review-cancel-btn"
                  onClick={() => {
                    setEditMode(false);
                    setRating(Number(reviewDetail.rating ?? 5.0));
                    setContent(reviewDetail.content ?? "");
                  }}
                  disabled={submitting}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="review-submit-btn"
                  disabled={!canSubmitEdit}
                >
                  {submitting ? "저장 중..." : "저장"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    );
  }

  // ✅ 2) 미작성 예약이면: 작성 폼
  return (
    <div className="review-page-container">
      <section className="review-section review-section--card">
        <h2 className="review-hospital-name">{ctx?.hospitalName || "병원 이름 없음"}</h2>
        {ctx?.reservedAt && (
          <p className="review-hospital-addr">
            예약일시:{" "}
            {new Date(ctx.reservedAt).toLocaleString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
        {ctx?.patientName && <p className="review-hospital-tel">환자: {ctx.patientName}</p>}
      </section>

      <section className="review-section review-section--card">
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
                  <span className="review-rating-btn-score">{opt.value.toFixed(1)}</span>
                  <span className="review-rating-btn-text">{getRatingText(opt.value)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleCreate} className="review-form">
          <div className="review-field">
            <p className="review-label">리뷰 내용</p>
            <textarea
              className="review-textarea"
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="진료를 받으신 경험을 솔직하게 남겨주세요."
            />
          </div>

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
              disabled={!canSubmitCreate}
              title={!canSubmitCreate ? "리뷰 작성 조건을 확인해 주세요." : ""}
            >
              {submitting ? "등록 중..." : "리뷰 등록"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
