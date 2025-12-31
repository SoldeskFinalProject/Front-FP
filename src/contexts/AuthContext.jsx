"use client"

// 사용자 정보를 공유하기 위한 전역 인증 상태 관리자
import { createContext, useContext, useState, useEffect } from "react"
import { login as loginAPI } from "../api/authAPI"
import { getMyInfo } from "../api/userAPI"

const AuthContext = createContext()
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider")
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // 페이지 로드 시 localStorage에서 사용자 정보 복원
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
        setUser(JSON.parse(storedUser))
        }
        setLoading(false)
    }, [])

    const login = async (credentials) => {
        try {
        const response = await loginAPI(credentials)
        const userData = {
            userId: response.userId,
            email: response.email,
            name: response.name,
            role: response.role,
        }
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
        return userData
        } catch (error) {
        console.error("Login failed:", error)
        throw error
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("user")
    }

    const updateUserRole = (newRole) => {
        if (user) {
        const updatedUser = { ...user, role: newRole }
        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))
        }
    }

    const refreshUserInfo = async () => {
        if (user) {
        try {
            const userInfo = await getMyInfo(user.userId)
            const updatedUser = {
            ...user,
            role: userInfo.role,
            }
            setUser(updatedUser)
            localStorage.setItem("user", JSON.stringify(updatedUser))
        } catch (error) {
            console.error("Failed to refresh user info:", error)
        }
        }
    }

    const value = {
        user,
        login,
        logout,
        updateUserRole,
        refreshUserInfo,
        isAuthenticated: !!user,
        isAdmin: user?.role === "ADMIN",
        isDoctor: user?.role === "DOCTOR",
        isHospital: user?.role === "HOSPITAL",
        isUser: user?.role === "USER",
        loading,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
