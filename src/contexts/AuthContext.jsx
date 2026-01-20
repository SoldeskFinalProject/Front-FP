"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { login as loginAPI,
        logout as logoutAPI,
        kakaoLogin as kakaoLoginAPI,
        naverLogin as naverLoginAPI } from "../api/authAPI";
import { api } from "../config";

// 사용자의 로그인 상태(인증 정보)를 전역적으로 관리
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
    const [user, setUser] = useState(null);     // 로그인한 유저 정보 객체
    const [loading, setLoading] = useState(true);

    // 앱 로드 시 로컬스토리지에서 사용자 정보 복구
    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");

        if (accessToken && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // ✅ 로그인/소셜로그인 성공 시 공통 처리 함수
    const handleLoginSuccess = (data) => {
        const { accessToken, refreshToken, ...userData } = data;

        // 토큰 및 유저 정보 저장
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(userData));

        // 상태 업데이트
        setUser(userData);
        
        return userData;
    };

    // 일반 로그인
    const login = async (credentials) => {
        try {
            const response = await loginAPI(credentials);
            return handleLoginSuccess(response);
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    // ✅ 카카오 소셜 로그인 (CallbackPage에서 호출)
    const socialLogin = async (code) => {
        try {
            const response = await kakaoLoginAPI(code);
            return handleLoginSuccess(response);
        } catch (error) {
            console.error("Social login failed: ", error);
            throw error;
        }
    };

    const naverLogin = async (code, state) => {
        try {
            const response = await naverLoginAPI(code, state);
            return handleLoginSuccess(response);
        } catch (error) {
            console.error("Naver Login failed: ", error);
            throw error;
        }
    }

    // 로그아웃
    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
                await logoutAPI(refreshToken);
            }
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // 서버 실패 여부와 상관없이 로컬 상태는 클리어
            setUser(null);
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        }
    };

    // 사용자 정보 최신화 (관리자 승인 등 변경사항 반영용)
    const refreshUserInfo = async () => {
        if (user) {
            try {
                const userResponse = await api.get("/api/users/me");
                const updatedUser = userResponse.data;
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
            } catch (error) {
                console.error("Failed to refresh user info:", error);
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
        isAuthenticated: !!user,
        isAdmin: user?.role === "ADMIN" // 관리자 여부 편의 기능
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};