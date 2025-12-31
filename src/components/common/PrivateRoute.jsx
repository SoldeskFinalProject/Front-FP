"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

const PrivateRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth()

    if (loading) {
        return (
        <div
            style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "400px",
            fontSize: "18px",
            color: "#6b7280",
            }}
        >
            로딩 중...
        </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/" replace />
    }

    return children
}

export default PrivateRoute
