// src/api/subscriptionApi.js
import { api } from "../config";

// 1) 구독 플랜 목록
export const getSubscriptionPlans = async () => {
  const res = await api.get("/api/subscriptions/plans");
  return res.data;
};

// payload = SubscriptionPurchasePage.jsx | const confirm = await confirmFirstPayment 부분

// 2) 결제 준비(주문 생성) - checkout()
export const checkoutSubscription = async (payload) => {
  // payload: { planId, hospitalId, pgProvider }
  const res = await api.post("/api/subscriptions/checkout", payload);
  return res.data; // { orderId, amount, planName, durationDays }
};

// 3) 첫 결제 확정 - confirm()
export const confirmFirstPayment = async (payload) => {
  // payload: { orderId, pgPaymentKey, billingKey?, customerKey? }
  const res = await api.post("/api/subscriptions/confirm", payload);
  return res.data;
};

// 4) 내 병원 구독 상태 조회 - me()
export const getMyHospitalSubscriptionStatus = async (hospitalId) => {
    if (hospitalId == null) {
    throw new Error("hospitalId는 필수입니다.");
  }
  const res = await api.get("/api/subscriptions/me/status", {
    params: { hospitalId },
  });

  return res.data; // 예: { hospitalId, status, startAt, endAt, autoRenew, ... }
};

// ✅ 구독 해지(자동결제 OFF)
export const cancelMySubscriptionAutoRenew = async () => {
  const res = await api.post("/api/subscriptions/me/cancel");
  return res.data;
};