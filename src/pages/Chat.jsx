import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Lightbulb, AlertCircle, RefreshCw } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';

const suggestions = [
  'How do I register to vote in India?',
  'What is the Model Code of Conduct?',
  'How does the EVM work?',
  'What is NOTA and how do I use it?',
  'How are election results counted?',
];



async function callGemini(question, userUid) {
  const apiUrl = `${import.meta.env.VITE_API_URL}/chat`;

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, uid: userUid }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return { text: data.answer, model: data.model };
  } catch (e) {
    if (e.name === 'TypeError' && (e.message.includes('fetch') || e.message.includes('network'))) {
      throw new Error('Network error. Please check your internet connection or verify the backend is deployed.', { cause: e });
    }
    throw e;
  }
}

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Hello! I'm **ElectWise AI**, your civic education assistant. Ask me anything about India's election process, voter rights, or democratic procedures. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    document.title = 'AI Civic Assistant — ElectWise';
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const question = text.trim();
    setInput('');
    setError(null);

    const userMsg = { role: 'user', text: question };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const { text: answer, model } = await callGemini(
        question,
        user?.uid
      );
      const aiMsg = { role: 'ai', text: answer };
      setMessages((prev) => [...prev, aiMsg]);

      // Save to Firestore (non-blocking)
      if (user) {
        addDoc(collection(db, 'chatHistory', user.uid, 'messages'), {
          question,
          answer,
          model,
          createdAt: serverTimestamp(),
        }).catch(() => {});
      }
    } catch (err) {
      const msg = err.message || 'Failed to get a response.';
      setError(msg);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: `❌ **Error:** ${msg}\n\nPlease try again or rephrase your question.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const renderText = (text) =>
    text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul class="list-disc pl-5 my-2 space-y-1">$1</ul>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');

  return (
    <main className="page-wrapper">
      {/* Header */}
      <section className="hero-gradient text-white py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 bg-[#fc8b19] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Bot size={28} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">Civic AI Assistant</h1>
          <p className="text-white/70">Powered by Google Gemini — Ask anything about Indian elections</p>
          {!user && (
            <p className="mt-3 text-xs text-yellow-300 bg-white/10 px-4 py-2 rounded-full inline-block">
              <AlertCircle size={12} className="inline mr-1" />
              Sign in to save your conversation history
            </p>
          )}
        </div>
      </section>

      <section className="flex-1 py-8 px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">

          {/* Suggestions */}
          <div>
            <p className="text-xs text-[#43474f] font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Lightbulb size={13} /> Suggested Questions
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => !loading && sendMessage(s)}
                  disabled={loading}
                  className="chip disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-4 min-h-[400px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.role === 'user' ? 'bg-[#1A3A6B]' : 'bg-[#fc8b19]'
                  }`}
                >
                  {msg.role === 'user' ? (
                    user?.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <User size={14} className="text-white" />
                    )
                  ) : (
                    <Bot size={14} className="text-white" />
                  )}
                </div>
                <div
                  className={msg.role === 'user' ? 'bubble-user' : 'bubble-ai'}
                  dangerouslySetInnerHTML={{ __html: renderText(msg.text) }}
                />
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-[#fc8b19] flex items-center justify-center flex-shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bubble-ai flex items-center gap-1.5 py-4">
                  <span
                    className="w-2 h-2 bg-[#43474f] rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-[#43474f] rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-[#43474f] rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Error banner */}
          {error && !loading && (
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                <RefreshCw size={14} />
              </button>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="sticky bottom-6 bg-white border border-[#e9edff] rounded-2xl shadow-lg p-3 flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about voter registration, EVM, election phases..."
              aria-label="Chat input"
              className="flex-1 bg-transparent text-sm text-[#0d1b35] outline-none placeholder:text-[#43474f]/50 px-2"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="w-10 h-10 bg-[#002451] rounded-xl flex items-center justify-center text-white disabled:opacity-40 hover:bg-[#1A3A6B] transition flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
