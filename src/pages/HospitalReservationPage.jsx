// src/pages/HospitalReservationPage.jsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  createHospitalReservation,
  getHospitalReservationSlots,
  getHospitalSummary,
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

  const { user, loading: authLoading } = useAuth();
  const selectedSymptoms = location?.state?.selectedSymptoms || [];
  const userId = useMemo(() => user?.id || user?.userId || user?.memberId, [user]);
  const fixedPatientName = useMemo(() => user?.name || "", [user]);

  const [hospital, setHospital] = useState(null);
  const [hospitalLoading, setHospitalLoading] = useState(true);
  const [date, setDate] = useState(getTodayDate());
  const [time, setTime] = useState("");
  const [phone, setPhone] = useState("");
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // ✅ 핸드폰 번호 실시간 하이픈 포매팅 함수
  const handlePhoneChange = (e) => {
    const input = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 남김
    let formatted = "";

    if (input.length <= 3) {
      formatted = input;
    } else if (input.length <= 7) {
      formatted = `${input.slice(0, 3)}-${input.slice(3)}`;
    } else {
      formatted = `${input.slice(0, 3)}-${input.slice(3, 7)}-${input.slice(7, 11)}`;
    }
    setPhone(formatted);
  };

  useEffect(() => {
    if (!hospitalId) {
      setHospital(null);
      setHospitalLoading(false);
      return;
    }
    const fetchHospital = async () => {
      try {
        setHospitalLoading(true);
        const data = await getHospitalSummary(hospitalId);
        setHospital(data || null);
      } catch (e) {
        console.error("병원 정보 조회 실패:", e);
        setHospital(null);
      } finally {
        setHospitalLoading(false);
      }
    };
    fetchHospital();
  }, [hospitalId]);

  useEffect(() => {
    if (!hospitalId) return;
    const fetchSlots = async () => {
      try {
        setSlotsLoading(true);
        const data = await getHospitalReservationSlots(hospitalId, date);
        const list = Array.isArray(data?.slots) ? data.slots : [];
        setSlots(list);
        const firstReservable = list.find(
          (s) => s.reservable && !isPastTimeSlot(s.time, date)
        );
        if (firstReservable) setTime(firstReservable.time);
        else setTime("");
      } catch (e) {
        console.error("슬롯 로딩 실패:", e);
        setSlots([]);
        setTime("");
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [hospitalId, date]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (authLoading) return;

      // 1. 로그인 체크
      if (!userId) {
        alert("로그인이 필요합니다. 다시 로그인해 주세요.");
        navigate("/login");
        return;
      }

      // 2. 예약자 이름 체크
      if (!fixedPatientName) {
        alert("예약자 이름 정보를 불러오지 못했습니다. 로그인 정보를 확인해 주세요.");
        return;
      }

      // 3. 연락처 유효성 검사 (010으로 시작하는 10~11자리 숫자 확인)
      const rawPhone = phone.replace(/-/g, "");
      const phoneRegex = /^010\d{7,8}$/;
      if (!phoneRegex.test(rawPhone)) {
        alert("올바른 핸드폰 번호 형식을 입력해 주세요.\n(예: 010-1234-5678)");
        return;
      }

      if (!hospitalId) {
        alert("병원 정보가 없습니다.");
        return;
      }

      if (!time) {
        alert("예약 시간을 선택해 주세요.");
        return;
      }

      const symptomMemo =
        memo?.trim() ||
        (selectedSymptoms.length
          ? `선택 증상: ${selectedSymptoms.map((s) => s.symptomName).join(", ")}`
          : "");

      const payload = {
        userId: Number(userId),
        phone: rawPhone,
        memo: symptomMemo,
        reservedAt: `${date}T${time}:00`,
        // hospitalId는 이미 URL params로 존재하므로 payload에는 객체를 담지 않습니다.
      };

      try {
        setSubmitting(true);
        await createHospitalReservation(hospitalId, payload);
        alert("예약이 성공적으로 완료되었습니다!");
        navigate("/mypage/reservations", { replace: true });
      } catch (err) {
        console.error("예약 실패 상세:", err);

        // ✅ DB 중복 에러(Duplicate entry)가 발생한 경우를 체크합니다.
        const errorMessage = err?.response?.data?.message || err?.message || "";
        
        if (errorMessage.includes("Duplicate entry") || errorMessage.includes("500")) {
          alert("죄송합니다. 현재 해당 시간대에 이미 진행 중인 예약이 있거나 방금 선점되었습니다.\n잠시 후 다시 시도하시거나 다른 시간을 선택해 주세요.");
        } else {
          alert(
            err?.response?.data?.message ||
              err?.response?.data ||
              err?.message ||
              "예약 중 오류가 발생했습니다."
          );
        }
      } finally {
        setSubmitting(false); // ✅ 에러가 나더라도 버튼 잠금을 풀어 재시도가 가능하게 합니다.
      }
    },
    [authLoading, userId, fixedPatientName, hospitalId, time, date, phone, memo, selectedSymptoms, navigate]
  );

  if (authLoading) {
    return <div className="reservation-page-container">사용자 정보를 확인 중입니다...</div>;
  }

  return (
    <div className="reservation-page-container">
      <header className="reservation-header">
        <h2 className="reservation-title">병원 예약</h2>
        <button className="reservation-back-btn" onClick={() => navigate(-1)}>뒤로가기</button>
      </header>

      <section className="reservation-section reservation-section--card">
        <h3 className="reservation-section-title">병원 정보</h3>
        {hospitalLoading ? (
          <p>병원 정보를 불러오는 중입니다...</p>
        ) : hospital ? (
          <>
            <p className="reservation-hospital-name">
              {hospital.dutyName || hospital.hospitalName || "병원 이름 없음"}
            </p>
            <p className="reservation-hospital-addr">
              {hospital.dutyAddr || hospital.address || "-"}
            </p>
            {(hospital.dutyTel1 || hospital.tel) && (
              <p className="reservation-hospital-addr">☎ {hospital.dutyTel1 || hospital.tel}</p>
            )}
          </>
        ) : (
          <p>병원 정보를 불러오지 못했습니다.</p>
        )}
      </section>

      <section className="reservation-section reservation-section--card">
        <h3 className="reservation-section-title">예약 정보 입력</h3>
        <form className="reservation-form" onSubmit={handleSubmit}>
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

          <div className="reservation-field">
            <span className="reservation-label">예약 시간</span>
            {slotsLoading ? (
              <p>로딩 중...</p>
            ) : (
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
            <input
              type="text"
              value={fixedPatientName || "이름 정보 없음"}
              readOnly
              disabled
              className="reservation-input"
            />
          </label>

          <label className="reservation-field">
            <span className="reservation-label">연락처</span>
            <input
              type="tel"
              value={phone}
              maxLength={13} // 010-1234-5678 자릿수 맞춤
              onChange={handlePhoneChange} // ✅ 하이픈 자동 생성 핸들러 사용
              className="reservation-input"
              placeholder="010-0000-0000"
              required
            />
          </label>

          <label className="reservation-field">
            <span className="reservation-label">증상/메모</span>
            <textarea
              rows={3}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="reservation-textarea"
              placeholder="(선택) 증상/요청사항"
            />
          </label>

          <button
            type="submit"
            className="reservation-submit-btn"
            disabled={submitting || !time || authLoading || !userId || !fixedPatientName}
          >
            {submitting ? "처리 중..." : "예약 확정하기"}
          </button>
        </form>
      </section>
    </div>
  );
}