import React, { useState } from "react";
import axios from "axios";

export default function FindId() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);

  const handleFindId = async (e) => {
    e.preventDefault();
    try {
      // 서버에 이메일 가입 경로 확인 요청
      const res = await axios.post("/api/auth/find-id", { email });
      setResult(res.data); // 예: { provider: 'kakao' }
    } catch (err) {
      alert("해당 이메일로 가입된 정보가 없습니다.");
    }
  };

  return (
    <div className="find-container">
      <h2>계정 찾기</h2>
      <form onSubmit={handleFindId}>
        <input 
          type="email" 
          placeholder="가입하신 이메일을 입력하세요" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">확인</button>
      </form>

      {result && (
        <div className="result-box">
          {result.provider === "kakao" ? (
            <p>해당 이메일은 <strong>카카오 계정</strong>으로 가입되어 있습니다. 카카오 로그인을 이용해 주세요.</p>
          ) : result.provider === "naver" ? (
            <p>해당 이메일은 <strong>네이버 계정</strong>으로 가입되어 있습니다. 네이버 로그인을 이용해 주세요.</p>
          ) : (
            <p><strong>일반 계정</strong>으로 가입된 이메일입니다. 로그인을 진행해 주세요.</p>
          )}
        </div>
      )}
    </div>
  );
}