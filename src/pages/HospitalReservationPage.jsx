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

  // (선택) 증상은 location.state로 전달될 수도 있으니 유지
  const selectedSymptoms = location?.state?.selectedSymptoms || [];

  const userId = useMemo(() => user?.id || user?.userId || user?.memberId, [user]);

  // ✅ 예약자 성함은 로그인 유저 이름으로 고정 (가족 예약 X)
  const fixedPatientName = useMemo(() => user?.name || "", [user]);

  // ✅ 병원 요약(이름/주소/전화)
  const [hospital, setHospital] = useState(null);
  const [hospitalLoading, setHospitalLoading] = useState(true);

  const [date, setDate] = useState(getTodayDate());
  const [time, setTime] = useState("");

  const [phone, setPhone] = useState("");
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // ✅ 1) 병원 요약 조회
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

  // ✅ 2) 슬롯 조회
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

      if (!userId) {
        alert("로그인이 필요합니다. 다시 로그인해 주세요.");
        navigate("/login");
        return;
      }

      // ✅ 가족 예약 안 하므로: 이름이 없으면 예약 진행 막기(데이터 품질)
      if (!fixedPatientName) {
        alert("예약자 이름 정보를 불러오지 못했습니다. 로그인 정보를 확인해 주세요.");
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

      // ✅ 서버는 userId로 user.name을 조회해 저장하는 구조이므로 patientName은 보내지 않습니다.
      const payload = {
        userId: Number(userId),
        phone: phone || "",
        memo: symptomMemo,
        reservedAt: `${date}T${time}:00`,
      };

      try {
        setSubmitting(true);
        await createHospitalReservation(hospitalId, payload);
        alert("예약이 성공적으로 완료되었습니다!");
        navigate("/mypage/reservations", { replace: true });
      } catch (err) {
        console.error("예약 실패:", err);
        alert(
          err?.response?.data?.message ||
            err?.response?.data ||
            err?.message ||
            "예약 중 오류가 발생했습니다."
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      authLoading,
      userId,
      fixedPatientName,
      hospitalId,
      time,
      date,
      phone,
      memo,
      selectedSymptoms,
      navigate,
    ]
  );

  if (authLoading) {
    return (
      <div className="reservation-page-container">
        사용자 정보를 확인 중입니다...
      </div>
    );
  }

  return (
    <div className="reservation-page-container">
      <header className="reservation-header">
        <h2 className="reservation-title">병원 예약</h2>
        <button className="reservation-back-btn" onClick={() => navigate(-1)}>
          뒤로가기
        </button>
      </header>

      {/* ✅ 병원 정보 */}
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
              <p className="reservation-hospital-addr">
                ☎ {hospital.dutyTel1 || hospital.tel}
              </p>
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
                  const disabled =
                    !slot.reservable || isPastTimeSlot(slot.time, date);
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      className={`time-slot-btn ${
                        time === slot.time ? "time-slot-btn--selected" : ""
                      } ${disabled ? "time-slot-btn--disabled" : ""}`}
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

          {/* ✅ 예약자 성함: 로그인 유저 이름으로 고정 (가족 예약 X) */}
          <label className="reservation-field">
            <span className="reservation-label">예약자 성함</span>
            <input
              type="text"
              value={fixedPatientName || "이름 정보 없음"}
              readOnly
              disabled
              className="reservation-input"
              placeholder="로그인 사용자 이름"
              title={
                fixedPatientName
                  ? "로그인한 사용자 이름으로 자동 입력됩니다."
                  : "로그인 정보에 이름이 없습니다."
              }
            />
          </label>

          <label className="reservation-field">
            <span className="reservation-label">연락처</span>
            <input
              type="tel"
              value={phone}
              maxLength={15}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
              className="reservation-input"
              placeholder="숫자만 입력"
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
            disabled={
              submitting || !time || authLoading || !userId || !fixedPatientName
            }
            title={
              !userId
                ? "로그인이 필요합니다."
                : !fixedPatientName
                ? "예약자 이름 정보를 불러오지 못했습니다."
                : ""
            }
          >
            {submitting ? "처리 중..." : "예약 확정하기"}
          </button>
        </form>
      </section>
    </div>
  );
}
