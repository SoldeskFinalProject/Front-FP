// src/pages/KakaoCallbackPage.jsx
"use client";

import React, { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function KakaoCallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { socialLogin } = useAuth();
    
    // 💡 핵심: useRef를 사용해서 한 번만 실행되도록 잠금 장치를 만듭니다.
    const hasRun = useRef(false);

    useEffect(() => {
        const code = searchParams.get("code");
        
        // 코드가 없거나 이미 실행 중이라면 중단!
        if (!code || hasRun.current) return;

        const processLogin = async () => {
            hasRun.current = true; // 실행 시작 표시
            try {
                console.log("카카오 로그인 시도중...");
                await socialLogin(code);
                console.log("로그인 성공! 홈으로 이동합니다.");
                navigate("/", { replace: true });
            } catch (e) {
                console.error("서버 응답 상세:", e.response?.data);
                // 에러가 나도 이미 코드가 쓰였다면 홈으로 보내버리는 것도 방법입니다.
                // navigate("/"); 
            }
        };

        processLogin();
    }, [searchParams, navigate, socialLogin]);

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <h3>로그인 처리 중입니다...</h3>
        </div>
    );
}