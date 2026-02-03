import React, { useState } from "react";
import { Link } from "react-router-dom";
import { findAccountByPhone, sendTempPasswordEmail } from "../../api/authAPI"; 
import "./FindAccount.css";

export default function FindAccount() {
  const [phone, setPhone] = useState("");
  const [emailForPw, setEmailForPw] = useState(""); // 비번찾기용
  const [findType, setFindType] = useState("id");
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
        if (findType === "id") {
            // 2. 여기서 호출하는 이름을 위 import와 동일하게 수정!
            await findAccountByPhone(phone); 
            setMessage({ 
                type: "success", 
                text: "가입 정보가 문자로 발송되었습니다." 
            });
        } else {
            // 3. 임시 비밀번호 발송 호출
            await sendTempPasswordEmail(emailForPw);
            setMessage({ 
                type: "success", 
                text: "임시 비밀번호가 메일로 발송되었습니다." 
            });
        }
    } catch (err) {
      console.error("", err)
        setMessage({ type: "error", text: "정보를 찾을 수 없거나 발송에 실패했습니다." });
    }
};

  return (
    <div className="find-wrapper">
      <div className="find-container">
        <div className="find-header">
          <h2>계정 관리</h2>
          <p>분실하신 정보를 안전하게 찾아드립니다.</p>
        </div>

        <div className="find-tabs">
          <button className={findType === "id" ? "active" : ""} onClick={() => setFindType("id")}>아이디 찾기</button>
          <button className={findType === "pw" ? "active" : ""} onClick={() => setFindType("pw")}>비밀번호 찾기</button>
        </div>

        <form className="find-form" onSubmit={handleSubmit}>
          {findType === "id" ? (
            <div className="input-group">
              <label>전화번호</label>
              <input 
                type="tel" 
                placeholder="01012345678" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                required 
              />
            </div>
          ) : (
            <div className="input-group">
              <label>이메일 주소</label>
              <input 
                type="email" 
                placeholder="example@email.com" 
                value={emailForPw} 
                onChange={(e) => setEmailForPw(e.target.value)} 
                required 
              />
            </div>
          )}
          <button type="submit" className="submit-btn">확인하기</button>
        </form>

        {message && (
          <div className={`message-box ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="find-footer">
          <Link to="/login">로그인 화면으로 돌아가기</Link>
        </div>
      </div>
    </div>
  );
}