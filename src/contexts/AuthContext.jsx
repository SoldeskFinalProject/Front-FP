"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
    login as loginAPI,
    logout as logoutAPI,
    kakaoLogin as kakaoLoginAPI,
    naverLogin as naverLoginAPI,
} from "../api/authAPI";
import { api } from "../config";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    // 로그인한 유저 정보 객체 (userId, email, name, role 등)
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ✅ 인증 상태(의사/병원 인증 요청의 최신 상태)
    const [verificationStatus, setVerificationStatus] = useState(null);

    // ✅ 내 인증상태 조회 (안전 버전 적용)
    const refreshVerificationStatus = async () => {
        const accessToken = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");

        // 토큰/유저 없으면 스킵
        if (!accessToken || !storedUser) {
            setVerificationStatus(null);
            return null;
        }

        let parsedUser = null;
        try {
            parsedUser = JSON.parse(storedUser);
        } catch (e) {
            // user 파싱이 깨져있으면 정리
            console.error("", e)
            localStorage.removeItem("user");
            setVerificationStatus(null);
            return null;
        }

        // ✅ 어드민은 인증상태 배너 대상이 아니므로 호출 스킵
        const isAdmin =
            parsedUser?.role === "ADMIN" || parsedUser?.role === "ROLE_ADMIN";
        if (isAdmin) {
            setVerificationStatus(null);
            return null;
        }

        try {
            // ✅ 백엔드가 userId를 요구하는 경우 대비해서 같이 전달
            const res = await api.get("/api/verification/me", {
                params: { userId: parsedUser?.userId },
            });

            setVerificationStatus(res.data);
            return res.data;
        } catch (error) {
            const status = error?.response?.status;

            // ✅ 400은 "요청 없음/대상 아님"류로 조용히 처리 (콘솔 에러 방지)
            if (status === 400) {
                setVerificationStatus(null);
                return null;
            }

            console.error("Failed to refresh verification status:", error);
            setVerificationStatus(null);
            return null;
        }
    };

    // 앱 로드 시 로컬스토리지에서 사용자 정보 복구
    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");

        if (accessToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);

                // ✅ 복구 성공 시 인증 상태도 같이 불러오기
                refreshVerificationStatus();
            } catch (error) {
                console.error("Failed to parse user data:", error);
                localStorage.removeItem("user"); // 잘못된 데이터면 삭제
                setUser(null);
                setVerificationStatus(null);
            }
        } else {
            setVerificationStatus(null);
        }

        setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ✅ 로그인/소셜로그인 성공 시 공통 처리 함수
    const handleLoginSuccess = async (data) => {
        // 백엔드 응답 구조: { accessToken, refreshToken, userId, email, name, role, ... }
        const { accessToken, refreshToken, ...userData } = data;

        // 1. 토큰 및 유저 정보 저장
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        // 2. 유저 정보 저장 (새로고침 시 유지용)
        localStorage.setItem("user", JSON.stringify(userData));

        // 3. 리액트 상태 업데이트
        setUser(userData);

        // ✅ 4. 로그인 직후 인증 상태 갱신 (배너 즉시 반영)
        await refreshVerificationStatus();

        return userData;
    };

    // 일반 로그인
    const login = async (credentials) => {
        try {
            const response = await loginAPI(credentials);
            return await handleLoginSuccess(response);
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    // ✅ 카카오 소셜 로그인
    const socialLogin = async (code) => {
        try {
            const response = await kakaoLoginAPI(code);
            return await handleLoginSuccess(response);
        } catch (error) {
            console.error("Kakao Login failed:", error);
            throw error;
        }
    };

    // ✅ 네이버 소셜 로그인
    const naverLogin = async (code, state) => {
        try {
            const response = await naverLoginAPI(code, state);
            return await handleLoginSuccess(response);
        } catch (error) {
            console.error("Naver Login failed:", error);
            throw error;
        }
    };

    // 로그아웃 (서버 세션 종료 및 로컬 데이터 삭제)
    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
                await logoutAPI(refreshToken).catch((err) => {
                    console.warn("서버 세션은 이미 만료되었거나 찾을 수 없습니다.", err);
                });
            }
        } catch (error) {
            console.error("Logout process error:", error);
        } finally {
            // 서버 실패 여부와 상관없이 클라이언트 상태는 무조건 클리어
            setUser(null);
            setVerificationStatus(null);
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");

            // 로그인 페이지로 이동
            window.location.href = "/login";
        }
    };

    // 사용자 정보 최신화 (프로필 수정, 관리자 승인, 등급 변경 등 반영용)
    const refreshUserInfo = async () => {
        const accessToken = localStorage.getItem("accessToken");
        if (user && accessToken) {
            try {
                const userResponse = await api.get("/api/users/me");
                const updatedUser = userResponse.data;

                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));

                // ✅ 유저 정보 갱신 후 인증 상태도 다시 갱신
                await refreshVerificationStatus();
            } catch (error) {
                console.error("Failed to refresh user info:", error);
                // 토큰 만료 에러라면 로그아웃 처리가 인터셉터에서 될 것임
            }
        }
    };

    const value = {
        user,
        login,
        socialLogin,
        naverLogin,
        logout,
        loading,
        refreshUserInfo,

        // ✅ 추가: 인증 상태 배너용
        verificationStatus,
        refreshVerificationStatus,

        isAuthenticated: !!user,
        isAdmin: user?.role === "ADMIN" || user?.role === "ROLE_ADMIN",
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};