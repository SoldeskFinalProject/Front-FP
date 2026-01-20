"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { 
    login as loginAPI, 
    logout as logoutAPI, 
    kakaoLogin as kakaoLoginAPI, 
    naverLogin as naverLoginAPI 
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
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 앱 로드 시 로컬스토리지에서 사용자 정보 복구
    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");

        if (accessToken && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("유저 정보 파싱 에러:", error);
                localStorage.removeItem("user");
            }
        }
        setLoading(false);
    }, []);

    // ✅ 로그인/소셜로그인 성공 시 공통 처리 함수
    const handleLoginSuccess = (data) => {
        const { accessToken, refreshToken, ...userData } = data;

        // 1. 토큰 및 유저 정보 저장
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(userData));

        // 2. 리액트 상태 업데이트
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

    // ✅ 카카오 소셜 로그인
    const socialLogin = async (code) => {
        try {
            const response = await kakaoLoginAPI(code);
            return handleLoginSuccess(response);
        } catch (error) {
            console.error("Kakao Login failed:", error);
            throw error;
        }
    };

    // ✅ 네이버 소셜 로그인
    const naverLogin = async (code, state) => {
        try {
            const response = await naverLoginAPI(code, state);
            return handleLoginSuccess(response);
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
                // 서버에 알리되, 이미 만료된 경우 등을 위해 catch 처리
                await logoutAPI(refreshToken).catch(err => {
                    console.warn("서버 세션은 이미 만료되었거나 찾을 수 없습니다.");
                });
            }
        } catch (error) {
            console.error("Logout process error:", error);
        } finally {
            // 💡 실제 로그아웃 성공은 여기서 결정됩니다.
            setUser(null);
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        
            // 로그아웃 후 로그인 페이지로 이동
            window.location.href = "/login"; 
        }
    };

    // 유저 정보 최신화 (관리자 승인 등 변경사항 반영용)
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
        naverLogin, // 네이버 기능 추가
        logout,
        loading,
        refreshUserInfo,
        isAuthenticated: !!user,
        isAdmin: user?.role === "ADMIN" || user?.role === "ROLE_ADMIN" // 관리자 여부 체크
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};