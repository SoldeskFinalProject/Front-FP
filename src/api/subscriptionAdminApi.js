// src/api/subscriptionAdminApi.js
import { api } from "../config";

// ✅ 관리자: 플랜 전체 조회
export const adminListSubscriptionPlans = async () => {
  const res = await api.get("/api/admin/subscriptions/plans");
  return res.data; // List<SubscriptionPlanResponseDTO>
};

// ✅ 관리자: 플랜 단건 조회
export const adminGetSubscriptionPlan = async (planId) => {
  const res = await api.get(`/api/admin/subscriptions/plans/${planId}`);
  return res.data;
};

// ✅ 관리자: 플랜 생성
export const adminCreateSubscriptionPlan = async (payload) => {
  // payload: { name, price, durationDays, isActive }
  const res = await api.post("/api/admin/subscriptions/plans", payload);
  return res.data;
};

// ✅ 관리자: 플랜 수정(부분 수정 가능)
export const adminUpdateSubscriptionPlan = async (planId, payload) => {
  // payload: { name?, price?, durationDays?, isActive? }
  const res = await api.put(`/api/admin/subscriptions/plans/${planId}`, payload);
  return res.data;
};

// ✅ 관리자: 플랜 삭제
export const adminDeleteSubscriptionPlan = async (planId) => {
  const res = await api.delete(`/api/admin/subscriptions/plans/${planId}`);
  return res.data; // no content
};
