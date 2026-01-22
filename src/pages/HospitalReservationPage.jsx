// src/pages/HospitalReservationPage.jsx
"use client";

import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  createHospitalReservation,
  getHospitalReservationSlots,
} from "../api/hospitalApi";
import "./HospitalReservationPage.css";
import { useAuth } from "../contexts/AuthContext";

function getTodayDate() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

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
  
  // ✅ 1. AuthContext에서 user와 loading 상태 가져오기
  const { user, loading } = useAuth();

  const { hospital, selectedSymptoms = [] } = location.state || {};

  const [date, setDate] = useState(getTodayDate());
  const [time, setTime] = useState("");
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    if (!hospitalId) return;
    const fetchSlots = async () => {
      try {
        setSlotsLoading(true);
        const data = await getHospitalReservationSlots(hospitalId, date);
        const list = Array.isArray(data.slots) ? data.slots : [];
        setSlots(list);
        const firstReservable = list.find(s => s.reservable && !isPastTimeSlot(s.time, date));
        if (firstReservable) setTime(firstReservable.time);
      } catch (e) {
        console.error("슬롯 로딩 실패", e);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [hospitalId, date]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔍 디버깅: 현재 user 객체의 전체 구조를 콘솔에서 확인하세요.
    console.log("현재 로그인된 user 객체:", user);

    if (loading) return;

    // ✅ 2. [로그인 체크] user 객체가 아예 없으면 로그인 페이지로
    if (!user) {
      alert("로그인 세션이 만료되었습니다. 다시 로그인해 주세요.");
      navigate("/login");
      return;
    }

    // ✅ 3. [ID 추출] .id 외에 다른 필드명일 가능성 대비 (안전장치)
    const idToSubmit = user.id || user.userId || user.memberId;

    if (!idToSubmit) {
      console.error("유저 객체는 있으나 ID 값을 찾을 수 없습니다. 필드명을 확인하세요.");
      alert("사용자 정보 오류가 발생했습니다.");
      return;
    }

    if (!time) {
      alert("예약 시간을 선택해 주세요.");
      return;
    }

    const payload = {
      userId: idToSubmit, // ✅ 백엔드 DTO의 private Long userId와 매칭
      patientName,
      phone,
      memo: memo || (selectedSymptoms.length ? `선택 증상: ${selectedSymptoms.map(s => s.symptomName).join(", ")}` : ""),
      reservedAt: `${date}T${time}:00`,
    };

    console.log("서버 전송 최종 데이터:", payload);

    try {
      setSubmitting(true);
      await createHospitalReservation(hospitalId, payload);
      alert("예약이 성공적으로 완료되었습니다!");
      
      // ✅ 수정 전: navigate("/mypage", { replace: true }); 
      // ✅ 수정 후: 새로 만든 예약 내역 확인 페이지 경로로 변경
      navigate("/mypage", { replace: true }); 
      
    } catch (err) {
      console.error("API 응답 에러:", err.response?.data);
      alert(err.response?.data?.message || "예약 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ 4. 데이터 로드 중일 때 처리 (중요)
  if (loading) {
    return <div className="reservation-page-container">사용자 정보를 확인 중입니다...</div>;
  }

  if (!hospital) {
    return (
      <div className="reservation-page-container">
        <p>병원 정보가 없습니다.</p>
        <button onClick={() => navigate(-1)}>뒤로가기</button>
      </div>
    );
  }

  return (
    <div className="reservation-page-container">
      <header className="reservation-header">
        <h2 className="reservation-title">병원 예약</h2>
        <button className="reservation-back-btn" onClick={() => navigate(-1)}>뒤로가기</button>
      </header>

      <section className="reservation-section reservation-section--card">
        <h3 className="reservation-section-title">병원 정보</h3>
        <p className="reservation-hospital-name">{hospital.name || hospital.yadmNm}</p>
        <p className="reservation-hospital-addr">{hospital.roadAddress || hospital.addr}</p>
      </section>

      <section className="reservation-section reservation-section--card">
        <h3 className="reservation-section-title">예약 정보 입력</h3>
        <form className="reservation-form" onSubmit={handleSubmit}>
          <label className="reservation-field">
            <span className="reservation-label">예약 날짜</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="reservation-input" required />
          </label>

          <div className="reservation-field">
            <span className="reservation-label">예약 시간</span>
            {slotsLoading ? <p>로딩 중...</p> : (
              <div className="time-slot-grid">
                {slots.map((slot) => {
                  const disabled = !slot.reservable || isPastTimeSlot(slot.time, date);
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      className={`time-slot-btn ${time === slot.time ? "time-slot-btn--selected" : ""} ${disabled ? "time-slot-btn--disabled" : ""}`}
                      disabled={disabled}
                      onClick={() => setTime(slot.time)}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <label className="reservation-field">
            <span className="reservation-label">예약자 성함</span>
            <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="reservation-input" required />
          </label>

          <label className="reservation-field">
            <span className="reservation-label">연락처</span>
            <input 
              type="tel" 
              value={phone} 
              maxLength={15}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))} 
              className="reservation-input" 
              placeholder="숫자만 입력"
              required 
            />
          </label>

          <label className="reservation-field">
            <span className="reservation-label">증상/메모</span>
            <textarea rows={3} value={memo} onChange={(e) => setMemo(e.target.value)} className="reservation-textarea" />
          </label>

          <button type="submit" className="reservation-submit-btn" disabled={submitting || !time || loading}>
            {submitting ? "처리 중..." : "예약 확정하기"}
          </button>
        </form>
      </section>
    </div>
  );
}