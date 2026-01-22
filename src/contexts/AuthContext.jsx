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
    const [user, setUser] = useState(null);     // 로그인한 유저 정보 객체 (userId, email, name, role 등)
    const [loading, setLoading] = useState(true);

    // 앱 로드 시 로컬스토리지에서 사용자 정보 복구
    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");

        if (accessToken && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user data:", e);
                localStorage.removeItem("user"); // 잘못된 데이터면 삭제
            }
        }
        setLoading(false);
    }, []);

    // ✅ 로그인/소셜로그인 성공 시 공통 처리 함수
    const handleLoginSuccess = (data) => {
        // 백엔드 응답 구조: { accessToken, refreshToken, userId, email, name, role, ... }
        const { accessToken, refreshToken, ...userData } = data;

        // 1. 토큰 저장
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        
        // 2. 유저 정보 저장 (새로고침 시 유지용)
        // userData 안에 userId가 반드시 포함되어 있어야 합니다!
        localStorage.setItem("user", JSON.stringify(userData));

        // 3. 상태 업데이트
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

    // ✅ 네이버 소셜 로그인
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
                // 백엔드에 로그아웃 요청 (리프레시 토큰 삭제 등)
                await logoutAPI(refreshToken);
            }
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // 서버 실패 여부와 상관없이 클라이언트 상태는 무조건 클리어
            setUser(null);
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            
            // 로그인 페이지로 이동 (선택사항)
            window.location.href = "/login";
        }
    };

    // 사용자 정보 최신화 (프로필 수정, 등급 변경 등 반영용)
    const refreshUserInfo = async () => {
        const accessToken = localStorage.getItem("accessToken");
        if (user && accessToken) {
            try {
                // 내 정보 가져오기 API (백엔드에 구현되어 있어야 함)
                const userResponse = await api.get("/api/users/me");
                const updatedUser = userResponse.data;
                
                // 기존 user 정보에 덮어쓰기 (토큰은 그대로)
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
            } catch (error) {
                console.error("Failed to refresh user info:", error);
                // 토큰 만료 에러라면 로그아웃 처리가 인터셉터에서 될 것임
            }
        }
    };

    const value = {
        user,             // 현재 로그인한 유저 객체
        login,            // 일반 로그인 함수
        socialLogin,      // 카카오 로그인 함수
        naverLogin,       // 네이버 로그인 함수
        logout,           // 로그아웃 함수
        loading,          // 초기 로딩 상태 (true면 깜빡임 방지용 로딩 스피너 보여주기)
        refreshUserInfo,  // 유저 정보 갱신 함수
        isAuthenticated: !!user,       // 로그인 여부 (boolean)
        isAdmin: user?.role === "ADMIN" // 관리자 여부 (boolean)
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};