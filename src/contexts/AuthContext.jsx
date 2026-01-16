"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { login as loginAPI, kakaoLogin as kakaoLoginAPI } from "../api/authAPI";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("loginUser");
        const token = localStorage.getItem("accessToken");
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, []);

    // 로그인 성공 시 상태와 로컬스토리지 모두 업데이트하는 공통 함수
    const handleLoginSuccess = (data) => {
        const userData = {
            userId: data.userId,
            name: data.name,
            role: data.role,
            email: data.email || (data.prefill && data.prefill.email)
        };
        // 1. 리액트 상태 업데이트 (이게 되어야 새로고침 없이 이름이 뜸)
        setUser(userData);
        // 2. 브라우저 저장
        localStorage.setItem("loginUser", JSON.stringify(userData));
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        return userData;
    };

    const login = async (credentials) => {
        const response = await loginAPI(credentials);
        return handleLoginSuccess(response);
    };

    // ✅ 카카오 전용 (CallbackPage에서 호출할 함수)
    const socialLogin = async (code) => {
        const response = await kakaoLoginAPI(code);
        return handleLoginSuccess(response);
    };

    const logout = () => {
        setUser(null);
        localStorage.clear();
        delete axios.defaults.headers.common['Authorization'];
    };

    const value = {
        user,
        login,
        socialLogin, // 👈 이게 있어야 CallbackPage에서 "is not a function" 에러가 안 납니다.
        logout,
        loading,
        isAuthenticated: !!user
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};