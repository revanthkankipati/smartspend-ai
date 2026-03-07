import { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I am the SmartSpend AI. Ask me anything about your spending!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // useStore context will ensure any AI responses trigger on the latest local stats
  // We can pass local context if we wanted, but our backend handles the DB queries directly now.

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', text: data.reply || data.error || 'Connection to AI failed.' }
      ]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error connecting to server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        className="chat-fab-button"
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: '20px', right: '20px',
          backgroundColor: '#3b82f6', color: 'white', borderRadius: '50%',
          width: '56px', height: '56px', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
          border: 'none', cursor: 'pointer', zIndex: 1000
        }}
      >
        <MessageSquare size={24} />
      </button>

      {isOpen && (
        <div className="chat-window" style={{
          position: 'fixed', bottom: '90px', right: '20px',
          width: '350px', height: '500px', backgroundColor: 'white',
          borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1000,
          border: '1px solid #e2e8f0'
        }}>
          <div className="chat-header" style={{
            backgroundColor: '#3b82f6', color: 'white', padding: '16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>AI Assistant</h3>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
          
          <div className="chat-messages" style={{
            flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#f8fafc'
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.role === 'user' ? '#3b82f6' : '#e2e8f0',
                color: msg.role === 'user' ? 'white' : '#1e293b',
                padding: '10px 14px', borderRadius: '12px', 
                borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px',
                borderBottomLeftRadius: msg.role === 'assistant' ? '2px' : '12px',
                maxWidth: '85%', fontSize: '14px', lineHeight: '1.4'
              }}>
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', color: '#64748b', fontSize: '12px' }}>Thinking...</div>
            )}
          </div>

          <form onSubmit={sendMessage} style={{
            padding: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px', backgroundColor: 'white'
          }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your spending..."
              style={{
                flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'
              }}
            />
            <button type="submit" disabled={isLoading} style={{
              backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px',
              padding: '0 16px', cursor: isLoading ? 'default' : 'pointer', opacity: isLoading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
