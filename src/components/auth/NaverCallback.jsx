// src/components/auth/NaverCallback.jsx

import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

export default function NaverCallback() {
    const navigate = useNavigate()
    const { naverLogin } = useAuth() // =
    const isCalled = useRef(false)   // 중복 호출 방지

    useEffect(() => {
        if (isCalled.current) return
        
        const params = new URLSearchParams(window.location.search)
        const code = params.get("code")
        const state = params.get("state")

        if (!code) {
            alert("잘못된 접근입니다.")
            navigate("/login")
            return
        }

        isCalled.current = true // 호출 플래그 세팅

        // Context 함수만 호출하면 끝.
        const processLogin = async () => {
        try {
            await naverLogin(code, state) // AuthContext가 다 알아서 함
            
            // 성공 시 메인으로
            navigate("/")
            
        } catch (error) {
            // 실패 시 에러 메시지 띄우고 로그인 페이지로
            const errorMsg = error.response?.data?.message || "네이버 로그인 실패"
            alert(errorMsg)
            navigate("/login")
        }
    }

        processLogin()
    }, [navigate, naverLogin])

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700">네이버 로그인 중...</h2>
            <p className="text-gray-500 mt-2">잠시만 기다려주세요.</p>
        </div>
        </div>
    )
}