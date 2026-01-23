import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { chatWithAiPharmacist } from "../../api/aiAPI"; 
import "./AiChatWidget.css";

export default function AiChatWidget() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: "ai", 
      text: "안녕하세요! AI 약사입니다. 💊" 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 스크롤 자동 이동용 Ref
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // 경로 체크 로직 (함수 내부 상단에 위치)
  if (!location.pathname.startsWith("/dictionary")) {
    return null;
  }

  // 메시지 전송 핸들러
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { id: Date.now(), sender: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const result = await chatWithAiPharmacist(input);
      const aiResponseText = result.response || "죄송합니다. 답변을 가져오지 못했습니다.";
      
      const aiMsg = { 
        id: Date.now() + 1, 
        sender: "ai", 
        text: aiResponseText 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        sender: "ai", 
        text: "잠시 연결 상태가 좋지 않습니다. 나중에 다시 시도해주세요. 😢" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      handleSend();
    }
  };

  // 🔗 텍스트 안의 링크를 버튼으로 변환 (최종 강화 버전)
  const renderMessageContent = (text) => {
    // 1. 정규식 설명:
    // (https://...) 또는 (/dictionary/detail/숫자) 패턴을 찾습니다.
    // 뒤에 오는 괄호나 공백은 제외하고 순수 주소만 잡도록 설정했습니다.
    const urlRegex = /(https?:\/\/[^\s)]+|\/dictionary\/detail\/\d+)/g;
    
    // 2. 텍스트를 줄바꿈(\n) 단위로 먼저 쪼갭니다. (버튼이 줄바꿈되어 보이게 하기 위함)
    return text.split('\n').map((line, lineIndex) => {
      // 3. 각 줄에서 링크가 있는지 확인
      const parts = line.split(urlRegex);
      
      return (
        <div key={lineIndex} style={{ minHeight: '1.2em' }}>
          {parts.map((part, partIndex) => {
            if (!part) return null;

            if (part.match(urlRegex)) {
              // 🚨 링크 발견! -> 버튼으로 변환
              return (
                <button 
                  key={partIndex}
                  className="chat-link-btn"
                  onClick={() => {
                    navigate(part); // 해당 경로로 이동
                    // 모바일이라면 챗봇 닫기 (선택사항)
                    // setIsOpen(false);
                  }}
                >
                  💊 약 정보 자세히 보기
                </button>
              );
            } else {
              // 일반 텍스트인데, "[상세페이지 링크]:" 같은 텍스트는 보기 싫으니 숨김 처리
              const cleanedText = part.replace(/\[.*?\]:\s*/g, "").trim();
              return <span key={partIndex}>{cleanedText}</span>;
            }
          })}
        </div>
      );
    });
  };

  // 메인 렌더링 return (함수의 가장 마지막에 위치)
  return (
    <div className="ai-widget-container">
      {!isOpen && (
        <button className="ai-fab-btn" onClick={() => setIsOpen(true)}>
          <span style={{ fontSize: '24px' }}>💊</span>
          <span className="fab-tooltip">AI 약사에게 물어보세요!</span>
        </button>
      )}

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="header-title">
              <span style={{ fontSize: '20px', marginRight: '8px' }}>🤖</span>
              AI 약사
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-row ${msg.sender}`}>
                {msg.sender === 'ai' && <div className="ai-avatar">AI</div>}
                <div className="message-bubble">
                  {renderMessageContent(msg.text)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message-row ai">
                <div className="ai-avatar">AI</div>
                <div className="message-bubble typing">
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              placeholder="질문을 입력하세요..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button onClick={handleSend} disabled={loading || !input.trim()}>
              전송
            </button>
          </div>
        </div>
      )}
    </div>
  );
}