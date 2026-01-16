"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { login as loginAPI, logout as logoutAPI } from "../api/authAPI"
import { api } from "../config"

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
        const accessToken = localStorage.getItem("accessToken")
        const storedUser = localStorage.getItem("user")

        if (accessToken && storedUser) {
        setUser(JSON.parse(storedUser))
        }
        setLoading(false)
    }, [])

    const login = async (credentials) => {
        try {
            const response = await loginAPI(credentials)
            const { accessToken, refreshToken, ...userData } = response;

            // 토큰 저장
            localStorage.setItem("accessToken", accessToken)
            localStorage.setItem("refreshToken", refreshToken)

            setUser(userData)
            localStorage.setItem("user", JSON.stringify(userData))

            return userData
        } catch (error) {
            console.error("Login failed:", error)
            throw error
        }
    }

    const logout = async () => {
        try {
        const refreshToken = localStorage.getItem("refreshToken")
        if (refreshToken) {
            await logoutAPI(refreshToken)
        }
        } catch (error) {
        console.error("Logout error:", error)
        } finally {
        setUser(null)
        localStorage.removeItem("user")
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        }
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
            const userResponse = await api.get("/api/users/me")
            const updatedUser = userResponse.data
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
