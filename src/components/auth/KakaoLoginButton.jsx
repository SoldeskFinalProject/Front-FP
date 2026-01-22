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
    <button
      type="button"
      onClick={handleKakaoLogin}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",              /* 네이버 버튼과 동일한 너비 */
        height: "54px",             /* 사진 속 네이버 버튼의 묵직한 높이감 재현 */
        backgroundColor: "#FEE500", /* 카카오 공식 Yellow */
        color: "#191919",
        border: "none",
        borderRadius: "8px",        /* 네이버 버튼과 동일한 부드러운 곡률 */
        fontSize: "16px",
        fontWeight: "bold",         /* 사진처럼 텍스트를 강조 */
        cursor: "pointer",
        gap: "10px",                /* 아이콘과 텍스트 사이의 적절한 간격 */
        marginBottom: "12px",
        transition: "background-color 0.2s ease"
      }}
    >
      {/* 404 에러 없는 내장형 SVG 로고 */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 3C6.477 3 2 6.48 2 10.78C2 13.62 3.94 16.12 6.86 17.55L5.62 22.09C5.55 22.37 5.72 22.64 6 22.69C6.1 22.71 6.21 22.69 6.3 22.64L11.54 19.16C12.02 19.19 12.51 19.2 13 19.2C18.523 19.2 23 15.72 23 11.42C23 7.12 18.523 3 13 3H12Z" fill="#191919"/>
      </svg>
      <span>카카오 로그인</span>
    </button>
  );
}