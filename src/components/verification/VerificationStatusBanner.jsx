import "./VerificationStatusBanner.css"

const VerificationStatusBanner = ({ verificationStatus }) => {
    if (!verificationStatus?.latestDoctorRequest && !verificationStatus?.latestHospitalRequest) {
        return null
    }

    return (
        <div className="verification-status">
        {verificationStatus?.latestDoctorRequest && (
            <div className="status-card">
            <h3>의사 인증 상태</h3>
            <p className={`status-badge status-${verificationStatus.latestDoctorRequest.adminDecision.toLowerCase()}`}>
                {verificationStatus.latestDoctorRequest.adminDecision === "PENDING"
                ? "승인 대기 중"
                : verificationStatus.latestDoctorRequest.adminDecision === "APPROVED"
                    ? "승인 완료"
                    : "거절됨"}
            </p>
            {verificationStatus.latestDoctorRequest.adminReason && (
                <p className="status-reason">사유: {verificationStatus.latestDoctorRequest.adminReason}</p>
            )}
            </div>
        )}

        {verificationStatus?.latestHospitalRequest && (
            <div className="status-card">
            <h3>병원 관계자 인증 상태</h3>
            <p className={`status-badge status-${verificationStatus.latestHospitalRequest.adminDecision.toLowerCase()}`}>
                {verificationStatus.latestHospitalRequest.adminDecision === "PENDING"
                ? "승인 대기 중"
                : verificationStatus.latestHospitalRequest.adminDecision === "APPROVED"
                    ? "승인 완료"
                    : "거절됨"}
            </p>
            {verificationStatus.latestHospitalRequest.adminReason && (
                <p className="status-reason">사유: {verificationStatus.latestHospitalRequest.adminReason}</p>
            )}
            </div>
        )}
        </div>
    )
}

export default VerificationStatusBanner
