import React, { useState } from "react";
import "./ReportModal.css";

const ReportModal = ({ isOpen, onClose, onSubmit, targetType }) => {
    const [reason, setReason] = useState("");
    const reportReasons = [
        "부적절한 홍보 게시글",
        "음란물 또는 자극적인 내용",
        "권리침해 및 저작권 위반",
        "욕설, 비하, 차별적 표현",
        "기타 사유"
    ];

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!reason.trim()) {
            alert("신고 사유를 선택하거나 입력해주세요.");
            return;
        }
        onSubmit(reason);
        setReason(""); // 초기화
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="report-modal-overlay" onClick={handleOverlayClick}>
            
            {/* 2. 중앙에 뜨는 하얀 박스 (여기 클릭하면 안 닫힘) */}
            <div className="report-modal-content">
                <h3>🚨 {targetType} 신고하기</h3>
                <p className="modal-notice">
                    허위 신고 시 서비스 이용이 제한될 수 있습니다.<br/>
                    신중하게 선택해 주세요.
                </p>
                
                <div className="reason-list">
                    {reportReasons.map((r) => (
                        <label key={r} className="reason-item">
                            <input
                                type="radio"
                                name="reportReason"
                                value={r}
                                checked={reason === r || (r === "기타 사유" && !reportReasons.slice(0, 5).includes(reason) && reason !== "")}
                                onChange={(e) => setReason(e.target.value)}
                            />
                            <span>{r}</span>
                        </label>
                    ))}
                </div>

                {/* '기타 사유'를 선택했거나 직접 입력 중일 때 텍스트박스 활성화 느낌 */}
                {/* 편의상 항상 보이게 하거나, 기타 선택시에만 보이게 할 수 있음. 여기선 항상 노출 */}
                <textarea
                    placeholder="상세 사유를 입력해주세요 (선택사항)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                />

                <div className="modal-actions">
                    <button className="cancel-btn" onClick={onClose}>취소</button>
                    <button className="submit-btn" onClick={handleSubmit}>신고하기</button>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;