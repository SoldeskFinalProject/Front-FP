// src/pages/SubscriptionPurchasePage.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import * as PortOne from "@portone/browser-sdk/v2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  getSubscriptionPlans,
  checkoutSubscription,
  confirmFirstPayment,
  getMyHospitalSubscriptionStatus,
  cancelMySubscriptionAutoRenew, // ✅ 추가 (반드시 subscriptionApi.js에 export 필요)
} from "../api/subscriptionApi";
import { getMyHospitalForSubscription } from "../api/hospitalMemberApi";

import "./SubscriptionPurchasePage.css";

const STORE_ID = import.meta.env.VITE_PORTONE_STORE_ID;
const CHANNEL_KEY = import.meta.env.VITE_PORTONE_CHANNEL_KEY;

function fmt(dt) {
  if (!dt) return "-";
  // LocalDateTime 문자열(예: 2026-01-28T17:47:55.136249) -> 보기 좋게
  return String(dt).replace("T", " ").slice(0, 19);
}

export default function SubscriptionPurchasePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isHospitalMember } = useAuth();

  // ✅ 내 병원(고정)
  const [myHospital, setMyHospital] = useState(null);
  const [loadingMyHospital, setLoadingMyHospital] = useState(false);

  // 플랜
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  // 상태
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [paying, setPaying] = useState(false);

  // ✅ 내 구독 상태
  const [mySub, setMySub] = useState(null);
  const [loadingMySub, setLoadingMySub] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const refreshMySubscription = async () => {
    const hospitalId = myHospital?.hospitalId;
    if (!hospitalId) return;

    setLoadingMySub(true);
    try {
      // ✅ “URL 고친 버전” 기준: hospitalId 받는 형태
      const data = await getMyHospitalSubscriptionStatus(hospitalId);
      setMySub(data);
    } catch (e) {
      console.error("getMyHospitalSubscriptionStatus error:", e);
      console.error("status:", e?.response?.status);
      console.error("data:", e?.response?.data);
      setMySub(null);
    } finally {
      setLoadingMySub(false);
    }
  };

  // ✅ 병원관계자만 사용
  useEffect(() => {
    if (!isAuthenticated) return;

    if (isAdmin) {
      alert("관리자는 구독 결제가 아닌 관리자 구독 관리 페이지를 이용해 주세요.");
      navigate("/");
      return;
    }

    if (!isHospitalMember) {
      alert("병원 관계자 계정만 구독 결제가 가능합니다.");
      navigate("/");
      return;
    }
  }, [isAuthenticated, isAdmin, isHospitalMember, navigate]);

  // ✅ 내 병원 조회
  useEffect(() => {
    if (!isAuthenticated) return;
    if (isAdmin) return;
    if (!isHospitalMember) return;

    (async () => {
      setLoadingMyHospital(true);
      try {
        const data = await getMyHospitalForSubscription(user?.userId);

        const h = data?.hospital ?? data;

        const hospitalId =
          h?.hospitalId ?? h?.id ?? data?.hospitalId ?? data?.id ?? null;

        if (!hospitalId) {
          alert(
            "내 병원 정보(hospitalId)를 찾지 못했습니다. 백엔드 응답을 확인해 주세요."
          );
          setMyHospital(null);
          return;
        }

        setMyHospital({
          hospitalId: data?.hospitalId ?? hospitalId,
          dutyName: data?.hospitalName ?? h?.dutyName ?? h?.name,
          dutyAddr: data?.address ?? h?.dutyAddr ?? h?.addr,
          dutyTel1: data?.tel ?? h?.dutyTel1 ?? h?.tel,
        });
      } catch (e) {
        console.error(e);
        alert("내 병원 정보를 불러오지 못했습니다.");
        setMyHospital(null);
      } finally {
        setLoadingMyHospital(false);
      }
    })();
  }, [isAuthenticated, isAdmin, isHospitalMember, user?.userId]);

  // ✅ 구독 플랜 조회
  useEffect(() => {
    (async () => {
      setLoadingPlans(true);
      try {
        const data = await getSubscriptionPlans();
        const list = Array.isArray(data) ? data : [];
        setPlans(list);

        if (list.length > 0 && selectedPlanId == null) {
          setSelectedPlanId(list[0].planId);
        }
      } catch (e) {
        console.error(e);
        alert("구독 상품을 불러오지 못했습니다.");
      } finally {
        setLoadingPlans(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ 병원 로딩 끝나면 내 구독 상태 조회
  useEffect(() => {
    if (!myHospital?.hospitalId) return;
    refreshMySubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myHospital?.hospitalId]);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.planId === selectedPlanId) || null,
    [plans, selectedPlanId]
  );

  const onClickPay = async () => {
    if (!isAuthenticated) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!isHospitalMember) {
      alert("병원 관계자 계정만 구독 결제가 가능합니다.");
      return;
    }
    if (!myHospital?.hospitalId) {
      alert("내 병원 정보가 없습니다. 새로고침 후 다시 시도해 주세요.");
      return;
    }
    if (!selectedPlan?.planId) {
      alert("구독 상품을 선택해 주세요.");
      return;
    }
    if (!STORE_ID || !CHANNEL_KEY) {
      alert("포트원 StoreId / ChannelKey 설정이 필요합니다(.env).");
      return;
    }

    setPaying(true);
    try {
      // 1) checkout
      const checkout = await checkoutSubscription({
        planId: selectedPlan.planId,
        hospitalId: myHospital.hospitalId,
        pgProvider: "PORTONE_V2",
      });

      // 2) 결제창 (일회 결제)
      const paymentResponse = await PortOne.requestPayment({
        storeId: STORE_ID,
        channelKey: CHANNEL_KEY,
        paymentId: checkout.orderId,
        orderName: checkout.planName ?? "구독 결제",
        totalAmount: checkout.amount,
        currency: "CURRENCY_KRW",
        payMethod: "EASY_PAY",
      });

      if (paymentResponse?.code) {
        console.error("PortOne payment failed:", paymentResponse);
        alert(`결제 실패: ${paymentResponse.message || paymentResponse.code}`);
        return;
      }

      const paymentId = paymentResponse?.paymentId;
      if (!paymentId) {
        console.error("Missing paymentId:", paymentResponse);
        alert("결제 응답 값이 올바르지 않습니다(paymentId 없음).");
        return;
      }

      // 2-1) billingKey (없으면 발급)
      let billingKey = paymentResponse?.billingKey ?? null;

      if (!billingKey) {
        const customerKey =
          checkout.customerKey ?? `hospital:${myHospital.hospitalId}`;

        const issueRes = await PortOne.requestIssueBillingKey({
          storeId: STORE_ID,
          channelKey: CHANNEL_KEY,
          payMethod: "EASY_PAY",
          issueName: "병원 구독 자동결제 빌링키",
          customer: { customerId: customerKey },
          billingKeyMethod: "EASY_PAY",
          easyPay: { provider: "TOSSPAY" }, // ✅ 채널 설정과 일치 필요
        });

        if (issueRes?.code) {
          console.error("Issue billingKey failed:", issueRes);
          alert(`빌링키 발급 실패: ${issueRes.message || issueRes.code}`);
          return;
        }
        billingKey = issueRes?.billingKey ?? null;
      }

      if (!billingKey) {
        alert("자동결제용 billingKey 발급에 실패했습니다.");
        return;
      }

      const customerKey =
        checkout.customerKey ?? `hospital:${myHospital.hospitalId}`;

      // 3) confirm
      await confirmFirstPayment({
        orderId: checkout.orderId,
        pgPaymentKey: paymentId,
        billingKey,
        customerKey,
      });

      alert("결제가 완료되었습니다. 구독이 활성화되었습니다.");
      await refreshMySubscription();
    } catch (e) {
      console.error("❌ confirmFirstPayment error status:", e?.response?.status);
      console.error("❌ confirmFirstPayment error data:", e?.response?.data);
      console.error("❌ confirmFirstPayment error:", e);
      alert(e?.response?.data?.message ?? "결제/구독 처리 중 오류가 발생했습니다.");
    } finally {
      setPaying(false);
    }
  };

  // ✅ 구독 해지(자동결제 OFF) = “해지 예약”
  const onCancelAutoRenew = async () => {
    if (!mySub?.active) {
      alert("현재 활성 구독이 없습니다.");
      return;
    }
    if (mySub?.autoRenew === false) {
      alert("이미 자동결제가 해지(OFF)된 상태입니다.");
      return;
    }

    const ok = window.confirm(
      "구독을 해지하시겠습니까?\n\n- 현재 이용 기간(endAt)까지는 그대로 이용 가능\n- 이후 자동결제는 진행되지 않음"
    );
    if (!ok) return;

    setCanceling(true);
    try {
      await cancelMySubscriptionAutoRenew();
      alert("구독 해지가 접수되었습니다. (자동결제 OFF)\n이용 기간 종료까지는 정상 이용 가능합니다.");
      await refreshMySubscription();
    } catch (e) {
      console.error("cancel autoRenew error:", e);
      alert(e?.response?.data?.message ?? "구독 해지 처리 중 오류가 발생했습니다.");
    } finally {
      setCanceling(false);
    }
  };

  // ✅ “다음 단계” 고려: 이미 구독중이면 결제 버튼을 막고 안내(원하시면 해제 가능)
  const isActiveNow = !!mySub?.active;
  const isCancelReserved = isActiveNow && mySub?.autoRenew === false;

  return (
    <div className="sp-page">
      <div className="sp-header">
        <h1 className="sp-title">병원 구독 결제</h1>
        <p className="sp-subtitle">
          구독 상품을 선택하고 결제를 완료하시면 바로 적용됩니다.
        </p>
      </div>

      {/* 0) 내 구독 상태 */}
      <section className="sp-section">
        <div className="sp-section-head">
          <h3 className="sp-section-title">0) 내 구독 상태</h3>
          <button
            className="sp-btn sp-btn-ghost"
            onClick={refreshMySubscription}
            disabled={loadingMySub}
          >
            {loadingMySub ? "조회중..." : "새로고침"}
          </button>
        </div>

        {loadingMySub ? (
          <div className="sp-loading">불러오는 중...</div>
        ) : mySub ? (
          <div className="sp-card sp-center">
            <div className="sp-card-title">
              {mySub.planName ? `구독 상품: ${mySub.planName}` : "구독 상품: -"}
            </div>

            <div className="sp-status-row">
              <span className={`sp-badge ${mySub.active ? "sp-badge-on" : "sp-badge-off"}`}>
                {mySub.active ? "구독중(ACTIVE)" : "미구독"}
              </span>

              {/* 해지 예약 배지 */}
              {isCancelReserved && (
                <span className="sp-badge sp-badge-warn">해지 예약됨</span>
              )}
            </div>

            <div className="sp-kv">
              <div className="sp-kv-row">
                <span className="sp-kv-k">시작일</span>
                <span className="sp-kv-v">{fmt(mySub.startAt)}</span>
              </div>
              <div className="sp-kv-row">
                <span className="sp-kv-k">종료일</span>
                <span className="sp-kv-v">{fmt(mySub.endAt)}</span>
              </div>
              <div className="sp-kv-row">
                <span className="sp-kv-k">다음 결제일</span>
                <span className="sp-kv-v">{fmt(mySub.nextBillingAt)}</span>
              </div>
              <div className="sp-kv-row">
                <span className="sp-kv-k">자동결제</span>
                <span className="sp-kv-v">
                  {mySub.autoRenew == null ? "-" : mySub.autoRenew ? "ON" : "OFF"}
                </span>
              </div>
            </div>

            <div className="sp-meta">hospitalId: {mySub.hospitalId ?? "-"}</div>

            {/* ✅ 해지 기능 UI */}
            {mySub.active && (
              <div className="sp-inline-actions">
                {mySub.autoRenew === true ? (
                  <button
                    className="sp-btn sp-btn-danger"
                    onClick={onCancelAutoRenew}
                    disabled={canceling}
                  >
                    {canceling ? "처리 중..." : "구독 해지 (자동결제 OFF)"}
                  </button>
                ) : (
                  <div className="sp-hint">
                    ✅ 해지 예약 상태입니다. 종료일(endAt)까지 이용 가능하며 이후 자동결제는 진행되지 않습니다.
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="sp-error">
            구독 정보를 불러오지 못했습니다. (미구독이거나 서버 응답 확인 필요)
          </div>
        )}
      </section>

      {/* 1) 내 병원 */}
      <section className="sp-section">
        <h3 className="sp-section-title">1) 내 병원 (고정)</h3>

        {loadingMyHospital ? (
          <div className="sp-loading">내 병원 정보를 불러오는 중...</div>
        ) : myHospital ? (
          <div className="sp-card sp-center">
            <div className="sp-card-title">
              {myHospital.dutyName ?? myHospital.name ?? "병원명"}
            </div>
            <div className="sp-info">
              {myHospital.dutyAddr ?? myHospital.addr ?? "주소 정보 없음"}
            </div>
            <div className="sp-info">{myHospital.dutyTel1 ?? myHospital.tel ?? ""}</div>
            <div className="sp-meta">hospitalId: {myHospital.hospitalId}</div>
          </div>
        ) : (
          <div className="sp-error">
            내 병원 정보를 불러오지 못했습니다. (병원 관계자 계정 매핑 확인 필요)
          </div>
        )}
      </section>

      {/* 2) 플랜 선택 */}
      <section className="sp-section">
        <h3 className="sp-section-title">2) 구독 상품 선택</h3>

        {loadingPlans ? (
          <div className="sp-loading">불러오는 중...</div>
        ) : (
          <div className="sp-grid">
            {plans.map((p) => (
              <div
                key={p.planId}
                className={`sp-plan ${selectedPlanId === p.planId ? "is-selected" : ""}`}
                onClick={() => setSelectedPlanId(p.planId)}
                role="button"
                tabIndex={0}
              >
                <div className="sp-plan-title">{p.name}</div>
                <div className="sp-plan-info">
                  가격: {Number(p.price).toLocaleString()}원
                </div>
                <div className="sp-plan-info">기간: {p.durationDays}일</div>
              </div>
            ))}
          </div>
        )}

        <div className="sp-actions">
          <button
            className="sp-btn sp-btn-primary"
            onClick={onClickPay}
            disabled={paying || !myHospital?.hospitalId || isActiveNow} // ✅ 다음단계: 활성 구독이면 결제 막기
            title={isActiveNow ? "이미 구독중입니다. 해지예약 후 기간 종료 뒤 재구독 가능합니다." : ""}
          >
            {paying ? "결제 진행 중..." : isActiveNow ? "현재 구독중" : "결제하고 구독 시작"}
          </button>

          {isActiveNow && (
            <div className="sp-hint" style={{ marginTop: 10 }}>
              ✅ 현재 구독중입니다. (필요 시 “플랜 변경” 기능을 별도 설계해 드리겠습니다)
            </div>
          )}
        </div>

        <div className="sp-footer">
          로그인 사용자: {user?.name ?? "-"} / StoreId: {STORE_ID ? "설정됨" : "미설정"} / ChannelKey:{" "}
          {CHANNEL_KEY ? "설정됨" : "미설정"}
        </div>
      </section>
    </div>
  );
}
