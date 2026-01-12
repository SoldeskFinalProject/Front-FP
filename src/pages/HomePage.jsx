"use client"

import { useNavigate } from "react-router-dom"
import "./HomePage.css"

export default function HomePage() {
    const navigate = useNavigate()

    const handleDoctorVerify = () => {
        navigate("/verification?type=doctor")
    }

    const handleHospitalVerify = () => {
        navigate("/verification?type=hospital")
    }

    return (
        <div className="home-container">
        <header className="home-header">
            {/* <div className="home-logo">
            <span className="logo-icon">⚕️</span>
            <span className="logo-text">
                Med<span className="logo-accent">Connect</span>
            </span>
            </div>
            <div className="home-auth-buttons">
            <button className="btn-login" onClick={() => navigate("/login")}>
                Log in
            </button>
            <button className="btn-signup" onClick={() => navigate("/signup")}>
                Sign up
            </button>
            </div> */}
        </header>

        <main className="home-main">
            <h1 className="home-title">Partner with Us</h1>
            <p className="home-subtitle">Join our verified network of healthcare providers.</p>

            <div className="verification-cards">
            <div className="verification-card doctor-card">
                <div className="card-icon doctor-icon">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z" />
                </svg>
                </div>
                <h2 className="card-title">의사 인증</h2>
                <p className="card-description">
                
                </p>
                <button className="btn-verify doctor-btn" onClick={handleDoctorVerify}>
                Verify as Doctor
                <span className="btn-arrow">→</span>
                </button>
            </div>

            <div className="verification-card hospital-card">
                <div className="card-icon hospital-icon">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M3 21h18" />
                    <path d="M5 21V7l8-4v18" />
                    <path d="M19 21V11l-6-4" />
                    <path d="M9 9v.01" />
                    <path d="M9 12v.01" />
                    <path d="M9 15v.01" />
                    <path d="M9 18v.01" />
                </svg>
                </div>
                <h2 className="card-title">병원 관계자 인증</h2>
                <p className="card-description">
                </p>
                <button className="btn-verify hospital-btn" onClick={handleHospitalVerify}>
                Verify Institution
                <span className="btn-arrow">→</span>
                </button>
            </div>
            </div>
        </main>
        </div>
    )
}
