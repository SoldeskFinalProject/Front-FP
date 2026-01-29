// src/api/hospitalMemberApi.js
import { api } from "../config";

export const getMyHospitalForSubscription = async (userId) => {
  // ✅ 백엔드: GET /api/hospital-members/me?userId=...
  const res = await api.get("/api/hospital-members/me", {
    params: { userId },
  });
  return res.data; // HospitalMemberDTO
};
