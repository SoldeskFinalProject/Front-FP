export default function FindPassword() {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/auth/reset-password-request", { email });
      setIsSent(true);
      alert("비밀번호 재설정 이메일을 발송했습니다.");
    } catch (err) {
      alert("이메일 발송에 실패했습니다.");
    }
  };

  return (
    <div className="find-container">
      <h2>비밀번호 찾기</h2>
      <p>가입하신 이메일로 비밀번호 재설정 링크를 보내드립니다.</p>
      <form onSubmit={handleResetPassword}>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <button type="submit">이메일 발송</button>
      </form>
    </div>
  );
}