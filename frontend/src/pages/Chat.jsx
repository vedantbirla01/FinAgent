import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/useAuth.js';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import { Wallet, LayoutDashboard, LogOut, Send, Receipt } from 'lucide-react';

function ToolReceipt({ action }) {
  const isError = action.observation?.error;
  return (
    <div className="mt-2 bg-panel-light border border-dashed border-border rounded-lg px-3 py-2 font-mono text-xs">
      <div className="flex items-center gap-1.5 text-muted mb-1">
        <Receipt size={12} />
        <span className="uppercase tracking-wide">{action.tool}</span>
      </div>
      <div className="text-muted/80">
        {Object.entries(typeof action.arguments === 'string' ? JSON.parse(action.arguments || '{}') : action.arguments || {}).map(([k, v]) => (
          <div key={k}>
            {k}: <span className="text-text">{String(v)}</span>
          </div>
        ))}
      </div>
      <div className={`mt-1 pt-1 border-t border-border ${isError ? 'text-rose' : 'text-teal'}`}>
        {isError ? action.observation.message : (action.observation.message || JSON.stringify(action.observation).slice(0, 120))}
      </div>
    </div>
  );
}

function ToolTrace({ trace }) {
  const [expanded, setExpanded] = useState(false);
  const actions = trace.filter((t) => t.type === 'action');

  if (actions.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-gold hover:underline font-mono"
      >
        {expanded ? 'hide' : 'view'} trace · {actions.length} call{actions.length > 1 ? 's' : ''}
      </button>
      {expanded && (
        <div className="space-y-1.5">
          {actions.map((action, i) => (
            <ToolReceipt key={i} action={action} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chat() {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef(null);

  const loadHistory = async () => {
    try {
      const { data } = await api.get('/chat/history');
      const formatted = data
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content, trace: [] }));
      setMessages(formatted);
    } catch (err) {
      console.error('Failed to load chat history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setMessages((prev) => [...prev, { role: 'user', content: trimmed, trace: [] }]);
    setInput('');
    setSending(true);

    try {
      const { data } = await api.post('/chat/message', { message: trimmed });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply, trace: data.trace || [] },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: err.response?.data?.message || 'Something went wrong. Please try again.',
          trace: [],
          isError: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <div className="border-b border-border px-5 py-3 flex justify-between items-center bg-panel/50 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-gold/10 border border-gold/30 flex items-center justify-center">
            <Wallet size={16} className="text-gold" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-sm leading-tight">FinAgent</h1>
            <p className="text-muted text-xs leading-tight">{user?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-xs text-muted hover:text-text bg-panel-light hover:bg-border border border-border px-3 py-1.5 rounded-lg transition-colors"
          >
            <LayoutDashboard size={13} /> Dashboard
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-text bg-panel-light hover:bg-border border border-border px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogOut size={13} /> Log out
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {loadingHistory ? (
            <p className="text-muted text-sm text-center font-mono">loading conversation…</p>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-3">
                <Wallet size={22} className="text-gold" />
              </div>
              <p className="text-muted text-sm font-mono">
                try: "I spent 450 on groceries" or "what's my balance?"
              </p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-gold text-ink font-medium'
                      : msg.isError
                      ? 'bg-rose/10 border border-rose/30 text-rose'
                      : 'bg-panel border border-border text-text'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  {msg.role === 'assistant' && msg.trace.length > 0 && <ToolTrace trace={msg.trace} />}
                </div>
              </div>
            ))
          )}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-panel border border-border text-muted rounded-2xl px-4 py-2.5 text-sm font-mono">
                thinking…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <form onSubmit={handleSend} className="border-t border-border px-4 py-4 bg-panel/50 backdrop-blur">
        <div className="max-w-2xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            disabled={sending}
            className="flex-1 rounded-xl bg-panel-light border border-border text-text px-4 py-2.5 outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/40 disabled:opacity-50 transition-colors text-sm"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="flex items-center gap-1.5 bg-gold hover:bg-gold-dim disabled:opacity-50 text-ink font-semibold rounded-xl px-5 py-2.5 transition-colors text-sm"
          >
            <Send size={15} /> Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default Chat;