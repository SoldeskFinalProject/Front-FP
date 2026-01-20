import React from "react";

export default function NaverLoginButton() {
    // .env에서 값 가져오기
    const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
    const REDIRECT_URI = import.meta.env.VITE_NAVER_REDIRECT_URI;
    const STATE = "false";

    const NAVER_AUTH_URL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&state=${STATE}&redirect_uri=${REDIRECT_URI}&auth_type=reauthenticate`;

    const handleLogin = () => {
        // 환경변수 잘 불러와졌는지 확인용 (개발 끝나면 삭제)
        if (!NAVER_CLIENT_ID) {
            alert("Client ID가 설정되지 않았습니다!");
            return;
        }
        window.location.href = NAVER_AUTH_URL;
    };

    return (
        <button onClick={handleLogin} className="naver-login-button">
        <span className="naver-icon">N</span>
        네이버 로그인
        </button>
    );
}