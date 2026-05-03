import { useEffect, useState, useRef } from 'react';
import { getChatHistory, sendMessage } from '../services/api';
import './Chatbot.css';

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    getChatHistory().then(r => {
      setMessages(r.data.map(m => ({ role: m.role, text: m.message })));
    }).catch(() => { });
  }, []);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTo({
        top: chatWindowRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const { data } = await sendMessage(msg);
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Something went wrong. Try again!' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const suggestions = [
    'What can I make with eggs and rice?',
    'How do I store leftover curry?',
    'Quick meals under 15 minutes?',
    'Substitute for cream in pasta?',
  ];

  return (
    <div className="page chat-page">
      <h1 className="page-title">Ask Remy</h1>
      <p className="chat-sub">Your Smart Kitchen Companion: Ask, Cook, Enjoy.</p>

      <div className="chat-window card" ref={chatWindowRef}>
        {messages.length === 0 && (
          <div className="chat-empty">
            <img src="/remy.png" alt="Remy" className="tony-avatar avatar-img" />
            <h3>Hi! I'm Remy, your MoodMeal assistant.</h3>
            <p>Ask me anything about cooking, recipes, or your pantry!</p>
            <div className="suggestions">
              {suggestions.map(s => (
                <button key={s} className="suggestion-chip" onClick={() => setInput(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              {m.role === 'assistant' && <img src="/remy.png" alt="Remy" className="msg-avatar-img" />}
              <div className="bubble">{m.text}</div>
              {m.role === 'user' && <span className="msg-avatar user-av"></span>}
            </div>
          ))}
          {loading && (
            <div className="message assistant">
              <img src="/remy.png" alt="Remy" className="msg-avatar-img" />
              <div className="bubble typing">
                <span /><span /><span />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="chat-input-area card">
        <textarea
          rows={2}
          placeholder="Ask Remy anything... (Enter to send)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <button className="btn btn-primary" onClick={handleSend} disabled={loading || !input.trim()}>
          Send ➤
        </button>
      </div>
    </div>
  );
}
