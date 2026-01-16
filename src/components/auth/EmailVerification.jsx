"use client"

import { useState, useEffect } from "react"
import { sendVerificationEmail, verifyEmailCode } from "../../api/authAPI"
import "./EmailVerification.css"

export default function EmailVerification({ email, onVerified }) {
    const [code, setCode] = useState("")
    const [isCodeSent, setIsCodeSent] = useState(false)
    const [timer, setTimer] = useState(0)
    const [isVerifying, setIsVerifying] = useState(false)
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (timer > 0) {
            const countdown = setTimeout(() => setTimer(timer - 1), 1000)
            return () => clearTimeout(countdown)
        }
    }, [timer])

    const handleSendCode = async () => {
        try {
            setError("")
            setMessage("")
            await sendVerificationEmail(email)
            setIsCodeSent(true)
            setTimer(60) // 1분 재요청 제한
            setMessage("인증 코드가 발송되었습니다. 이메일을 확인해주세요.")
        } catch (err) {
            setError(err.response?.data?.message || "인증 코드 발송에 실패했습니다.")
        }
    }

    const handleVerifyCode = async () => {
        if (code.length !== 6) {
        setError("6자리 인증 코드를 입력해주세요.")
        return
        }

        try {
        setIsVerifying(true)
        setError("")
        const response = await verifyEmailCode(email, code)

        if (response.emailVerified) {
            setMessage("이메일 인증이 완료되었습니다!")
            setTimeout(() => {
            onVerified()
            }, 1000)
        }
        } catch (err) {
        setError(err.response?.data?.message || "인증 코드가 올바르지 않습니다.")
        } finally {
        setIsVerifying(false)
        }
    }

    return (
        <div className="email-verification">
        <div className="verification-header">
            <h2>이메일 인증</h2>
            <p className="verification-email">{email}</p>
        </div>

        {!isCodeSent ? (
            <div className="verification-step">
            <p className="step-description">회원가입을 완료하려면 이메일 인증이 필요합니다.</p>
            <button className="send-code-btn" onClick={handleSendCode} disabled={timer > 0}>
                {timer > 0 ? `재발송 (${timer}초)` : "인증 코드 발송"}
            </button>
            </div>
        ) : (
            <div className="verification-step">
            <p className="step-description">이메일로 발송된 6자리 인증 코드를 입력해주세요.</p>

            <div className="code-input-group">
                <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="code-input"
                disabled={isVerifying}
                />
                <button className="verify-btn" onClick={handleVerifyCode} disabled={isVerifying || code.length !== 6}>
                {isVerifying ? "확인 중..." : "인증하기"}
                </button>
            </div>

            <button className="resend-link" onClick={handleSendCode} disabled={timer > 0}>
                {timer > 0 ? `코드 재발송 (${timer}초)` : "코드 재발송"}
            </button>
            </div>
        )}

        {message && <div className="verification-message success">{message}</div>}
        {error && <div className="verification-message error">{error}</div>}
        </div>
    )
}
