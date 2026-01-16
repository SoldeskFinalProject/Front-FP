"use client";

import React from "react";

const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_REST_API_KEY;
const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

export default function KakaoLoginButton() {
  const handleKakaoLogin = () => {
    if (!KAKAO_CLIENT_ID || !REDIRECT_URI) {
      alert("Kakao 설정이 올바르지 않습니다. .env를 확인해 주세요.");
      return;
    }

    // ✅ 공백/개행 방지(진짜로 이런거 때문에 400 많이 남)
    const clientId = String(KAKAO_CLIENT_ID).trim();
    const redirectUri = String(REDIRECT_URI).trim();

    const kakaoAuthUrl =
        "https://kauth.kakao.com/oauth/authorize" +
        `?client_id=${encodeURIComponent(clientId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code`;

    window.location.href = kakaoAuthUrl;
  };

  return (
    <button type="button" onClick={handleKakaoLogin}>
      카카오로 간편 로그인
    </button>
  );
}
