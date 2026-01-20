"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { login as loginAPI, logout as logoutAPI, kakaoLogin as kakaoLoginAPI } from "../api/authAPI";
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
            setUser(JSON.parse(storedUser));
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

    // ✅ 카카오 전용 소셜 로그인 (CallbackPage에서 호출)

    // ✅ 카카오 소셜 로그인 (CallbackPage에서 호출)

    const socialLogin = async (code) => {
        try {
            const response = await kakaoLoginAPI(code);
            return handleLoginSuccess(response);
        } catch (error) {
            console.error("Social login failed:", error);
            throw error;
        }
    };


    // 로그아웃 (서버 세션 종료 및 로컬 데이터 삭제)
    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
                // 서버에 알리되, 에러가 나더라도 사용자에게는 알리지 않고 무시함
                await logoutAPI(refreshToken).catch(err => {
                    console.warn("서버 세션은 이미 만료되었거나 찾을 수 없습니다.");
                });
            }
        } catch (error) {
            // 네트워크 에러 등 발생 시 로그만 출력
            console.error("Logout process error:", error);
        } finally {
            // 💡 실제 로그아웃 성공은 여기서 결정됩니다.
            setUser(null);
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        
            // alert("로그아웃 되었습니다."); // 필요하다면 추가
            window.location.href = "/login"; 
        }
    };
    

    // 유저 역할 업데이트 (인증 성공 시 등)
    const updateUserRole = (newRole) => {
        if (user) {
            const updatedUser = { ...user, role: newRole };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
        }
    };

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
        logout,
        loading,
        refreshUserInfo,
        isAuthenticated: !!user,
        isAdmin: user?.role === "ADMIN" // 관리자 여부 편의 기능

    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};