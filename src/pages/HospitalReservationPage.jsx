// src/pages/HospitalReservationPage.jsx
"use client";

import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  createHospitalReservation,
  getHospitalReservationSlots,
} from "../api/hospitalApi";
import "./HospitalReservationPage.css";

function getTodayDate() {
  const d = new Date();
  return d.toISOString().slice(0, 10); // yyyy-MM-dd
}

// 오늘 & 현재 시간 기준으로 이미 지난 슬롯인지 체크
function isPastTimeSlot(slotTime, selectedDate) {
  const todayStr = getTodayDate();
  if (selectedDate !== todayStr) return false;

  const now = new Date();
  const [h, m] = slotTime.split(":").map(Number);
  const slotMinutes = h * 60 + m;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return slotMinutes <= nowMinutes;
}

export default function HospitalReservationPage() {
  const { hospitalId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { hospital, selectedSymptoms = [] } = location.state || {};

  const [date, setDate] = useState(getTodayDate());
  const [time, setTime] = useState("");
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 슬롯 상태
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(null);

  // 날짜 변경 시 슬롯 조회
  useEffect(() => {
    if (!hospitalId) return;

    const fetchSlots = async () => {
      try {
        setSlotsLoading(true);
        setSlotsError(null);

        const data = await getHospitalReservationSlots(hospitalId, date);
        const list = Array.isArray(data.slots) ? data.slots : [];
        setSlots(list);

        // 기본 선택값: 예약 가능 & (오늘이면) 현재 시간 이후인 첫 슬롯
        const firstReservable = list.find(
          (s) => s.reservable && !isPastTimeSlot(s.time, date),
        );
        if (firstReservable) {
          setTime(firstReservable.time);
        } else {
          setTime("");
        }
      } catch (e) {
        console.error(e);
        setSlots([]);
        setTime("");
        setSlotsError("예약 가능 시간을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [hospitalId, date]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hospitalId) {
      alert("병원 정보가 없습니다. 다시 시도해 주세요.");
      return;
    }
    if (!time) {
      alert("예약 시간을 선택해 주세요.");
      return;
    }

    const reservedAt = `${date}T${time}`;

    const payload = {
      userId: 1, // 로그인 붙기 전까지 임시
      patientName,
      phone,
      memo:
        memo ||
        (selectedSymptoms.length
          ? `선택 증상: ${selectedSymptoms
              .map((s) => s.symptomName)
              .join(", ")}`
          : ""),
      reservedAt,
    };

    try {
      setSubmitting(true);
      await createHospitalReservation(hospitalId, payload);
      alert("예약이 완료되었습니다.");
      navigate("/result", { replace: true });
    } catch (err) {
      console.error(err);
      alert(err.message || "예약 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!hospital) {
    return (
      <div className="reservation-page-container">
        <p>병원 정보가 없습니다. 증상 분석 결과 페이지에서 다시 시도해 주세요.</p>
        <button className="reservation-back-btn" onClick={() => navigate("/result")}>
          결과 페이지로 이동
        </button>
      </div>
    );
  }

  const hasReservableSlot = slots.some(
    (s) => s.reservable && !isPastTimeSlot(s.time, date),
  );

  return (
    <div className="reservation-page-container">
      <header className="reservation-header">
        <h2 className="reservation-title">병원 예약</h2>
        <button className="reservation-back-btn" onClick={() => navigate(-1)}>
          뒤로가기
        </button>
      </header>

      {/* 병원 정보 카드 */}
      <section className="reservation-section reservation-section--card">
        <h3 className="reservation-section-title">병원 정보</h3>
        <p className="reservation-hospital-name">
          {hospital.name || hospital.yadmNm || "병원 이름 없음"}
        </p>
        <p className="reservation-hospital-addr">
          {hospital.roadAddress ||
            hospital.jibunAddress ||
            hospital.addr ||
            hospital.address ||
            ""}
        </p>
        {(hospital.tel || hospital.telno) && (
          <p className="reservation-hospital-tel">
            ☎ {hospital.tel || hospital.telno}
          </p>
        )}
      </section>

      {/* 예약 입력 카드 */}
      <section className="reservation-section reservation-section--card">
        <h3 className="reservation-section-title">예약 정보 입력</h3>

        {slotsError && <p className="error-text">{slotsError}</p>}

        <form className="reservation-form" onSubmit={handleSubmit}>
          {/* 날짜 */}
          <label className="reservation-field">
            <span className="reservation-label">예약 날짜</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="reservation-input"
              required
            />
          </label>

          {/* 시간 – 버튼 그리드 */}
          <div className="reservation-field">
            <span className="reservation-label">예약 시간</span>

            {slotsLoading && <p className="info-text">예약 가능 시간을 불러오는 중…</p>}

            {!slotsLoading && slots.length === 0 && (
              <p className="info-text">해당 날짜에는 예약 가능한 시간이 없습니다.</p>
            )}

            {!slotsLoading && slots.length > 0 && (
              <>
                <div className="time-slot-grid">
                  {slots.map((slot) => {
                    const disabled =
                      !slot.reservable || isPastTimeSlot(slot.time, date);
                    const selected = time === slot.time;

                    return (
                      <button
                        key={slot.time}
                        type="button"
                        className={[
                          "time-slot-btn",
                          selected ? "time-slot-btn--selected" : "",
                          disabled ? "time-slot-btn--disabled" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        disabled={disabled}
                        onClick={() => {
                          if (!disabled) setTime(slot.time);
                        }}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>

                {!hasReservableSlot && (
                  <p className="info-text info-text--small">
                    선택 가능한 시간이 없습니다. 다른 날짜를 선택해 주세요.
                  </p>
                )}

                <div className="time-slot-legend">
                  <span className="legend-box legend-box--available" />
                  <span>예약 가능</span>
                  <span className="legend-box legend-box--disabled" />
                  <span>이미 예약되었거나 현재 시간 이전</span>
                  <span className="legend-box legend-box--selected" />
                  <span>선택한 시간</span>
                </div>
              </>
            )}
          </div>

          {/* 이름 */}
          <label className="reservation-field">
            <span className="reservation-label">예약자 이름</span>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="reservation-input"
              placeholder="실제 진료 받으실 분 성함"
              required
            />
          </label>

          {/* 연락처 */}
          <label className="reservation-field">
            <span className="reservation-label">연락처</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="reservation-input"
              placeholder="예) 010-1234-5678"
              required
            />
          </label>

          {/* 메모 */}
          <label className="reservation-field">
            <span className="reservation-label">증상 / 메모</span>
            <textarea
              rows={4}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="reservation-textarea"
              placeholder={
                selectedSymptoms.length
                  ? `예) ${selectedSymptoms
                      .map((s) => s.symptomName)
                      .join(", ")} 등`
                  : "증상이나 요청사항을 자유롭게 적어 주세요."
              }
            />
          </label>

          <button
            type="submit"
            className="reservation-submit-btn"
            disabled={submitting || !time}
          >
            {submitting ? "예약 처리 중..." : "예약 확정하기"}
          </button>
        </form>
      </section>
    </div>
  );
}
