// src/api/subscriptionApi.js
import { api } from "../config";

/* ======================================================
   1) 구독 플랜 목록 (공개)
   ====================================================== */
export const getSubscriptionPlans = async () => {
  const res = await api.get("/api/subscriptions/plans");
  return res.data;
};

/* ======================================================
   2) 결제 준비 (주문 생성)
   POST /billing/checkout
   ====================================================== */
export const checkoutSubscription = async (payload) => {
  // payload: { planId, hospitalId, pgProvider }
  const res = await api.post(
    "/api/subscriptions/billing/checkout",
    payload
  );
  return res.data; // { orderId, amount, planName, durationDays }
};

/* ======================================================
   3) 첫 결제 확정
   POST /billing/confirm
   ====================================================== */
export const confirmFirstPayment = async (payload) => {
  // payload: { orderId, pgPaymentKey, billingKey?, customerKey? }
  const res = await api.post(
    "/api/subscriptions/billing/confirm",
    payload
  );
  return res.data;
};

/* ======================================================
   4) 내 병원 구독 상태 조회
   GET /me/status
   ====================================================== */
export const getMyHospitalSubscriptionStatus = async () => {
  const res = await api.get("/api/subscriptions/me/status");
  return res.data;
};

/* ======================================================
   5) 구독 해지 (자동결제 OFF)
   POST /me/cancel
   ====================================================== */
export const cancelMySubscriptionAutoRenew = async () => {
  const res = await api.post("/api/subscriptions/me/cancel");
  return res.data;
};
