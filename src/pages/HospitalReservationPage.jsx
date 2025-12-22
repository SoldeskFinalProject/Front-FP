// src/pages/HospitalReservationPage.jsx
"use client";

import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { createHospitalReservation } from "../api/hospitalApi";
import "./HospitalReservationPage.css"; // 파일 없으면 만들어 주세요

function getTodayDate() {
  const d = new Date();
  return d.toISOString().slice(0, 10); // yyyy-MM-dd
}

export default function HospitalReservationPage() {
  const { hospitalId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { hospital, selectedSymptoms = [] } = location.state || {};

  // 병원 정보 안전하게 정리
  const hospitalName =
    hospital?.name || hospital?.yadmNm || `병원 ID ${hospitalId}`;
  const hospitalAddress =
    hospital?.roadAddress || hospital?.jibunAddress || hospital?.addr || "";
  const hospitalTel = hospital?.tel || hospital?.telno || "";

  const [date, setDate] = useState(getTodayDate());
  const [time, setTime] = useState("09:00");
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 30분 단위 타임 슬롯 (예시: 09:00 ~ 18:00)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = 9; h <= 18; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        slots.push(`${hh}:${mm}`);
      }
    }
    return slots;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date || !time) {
      alert("예약 날짜와 시간을 선택해 주세요.");
      return;
    }

    const reservedAt = `${date}T${time}:00`;

    // 선택된 증상들 정리
    const symptomCodes = selectedSymptoms
      .map((s) => s.symptomCode)
      .filter(Boolean);
    const symptomNames = selectedSymptoms
      .map((s) => s.symptomName)
      .filter(Boolean);

    const payload = {
      // 백엔드 DTO(HospitalReservationCreateRequest)에 맞춰서 전송
      userId: 1, // 로그인 붙기 전까지 테스트용
      patientName,
      phone,
      memo:
        memo ||
        (symptomNames.length > 0
          ? `선택 증상: ${symptomNames.join(", ")}`
          : ""),
      reservedAt,
      symptomCodes,
      symptomNames,
    };

    try {
      setSubmitting(true);
      await createHospitalReservation(hospitalId, payload);
      alert("예약이 완료되었습니다.");
      navigate(-1); // 이전 페이지(증상 결과 페이지)로 돌아가기
    } catch (err) {
      console.error(err);
      alert("예약 중 오류가 발생했습니다.");
      setSubmitting(false);
    }
  };

  return (
    <div className="reservation-page-container">
      <header className="reservation-header">
        <h2 className="reservation-title">병원 예약</h2>
        <button className="reservation-back-btn" onClick={() => navigate(-1)}>
          뒤로가기
        </button>
      </header>

      <section className="reservation-section">
        <h3 className="reservation-section-title">병원 정보</h3>
        <p className="reservation-hospital-name">{hospitalName}</p>
        {hospitalAddress && (
          <p className="reservation-hospital-addr">{hospitalAddress}</p>
        )}
        {hospitalTel && (
          <p className="reservation-hospital-tel">☎ {hospitalTel}</p>
        )}
      </section>

      <section className="reservation-section">
        <h3 className="reservation-section-title">예약 정보 입력</h3>

        {/* 선택한 증상 요약 */}
        {selectedSymptoms.length > 0 && (
          <div className="reservation-symptom-summary">
            <span className="label">선택한 증상</span>
            <span className="value">
              {selectedSymptoms.map((s) => s.symptomName).join(", ")}
            </span>
          </div>
        )}

        <form className="reservation-form" onSubmit={handleSubmit}>
          <label className="reservation-field">
            <span>예약 날짜</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>

          <label className="reservation-field">
            <span>예약 시간</span>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            >
              {timeSlots.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className="reservation-field">
            <span>예약자 이름</span>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              required
            />
          </label>

          <label className="reservation-field">
            <span>연락처</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </label>

          <label className="reservation-field">
            <span>증상 / 메모</span>
            <textarea
              rows={4}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder={
                selectedSymptoms.length
                  ? `예) ${selectedSymptoms
                      .map((s) => s.symptomName)
                      .join(", ")} 등`
                  : "증상이나 요청사항을 적어 주세요."
              }
            />
          </label>

          <button
            type="submit"
            className="reservation-submit-btn"
            disabled={submitting}
          >
            {submitting ? "예약 중..." : "예약 확정하기"}
          </button>
        </form>
      </section>
    </div>
  );
}
