import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/useAuth.js';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

function ToolTrace({ trace }) {
  const [expanded, setExpanded] = useState(false);
  const actions = trace.filter((t) => t.type === 'action');

  if (actions.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-indigo-400 hover:underline"
      >
        {expanded ? 'Hide' : 'Show'} reasoning trace ({actions.length} tool call{actions.length > 1 ? 's' : ''})
      </button>
      {expanded && (
        <div className="mt-2 space-y-2">
          {actions.map((action, i) => (
            <div key={i} className="bg-slate-900 rounded-lg p-3 text-xs font-mono border border-slate-700">
              <div className="text-indigo-400">tool: {action.tool}</div>
              <div className="text-slate-400 mt-1">args: {JSON.stringify(action.arguments)}</div>
              <div className="text-slate-500 mt-1">
                result: {JSON.stringify(action.observation).slice(0, 200)}
                {JSON.stringify(action.observation).length > 200 ? '...' : ''}
              </div>
            </div>
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
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <div className="border-b border-slate-800 px-4 py-3 flex justify-between items-center">
        <div>
          <h1 className="text-white font-semibold">FinAgent Chat</h1>
          <p className="text-slate-500 text-xs">{user?.name}</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/dashboard"
            className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Dashboard
          </Link>
          <button
            onClick={logout}
            className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Log out
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {loadingHistory ? (
            <p className="text-slate-500 text-sm text-center">Loading conversation...</p>
          ) : messages.length === 0 ? (
            <p className="text-slate-500 text-sm text-center">
              Try: "I spent 450 on groceries yesterday" or "what's my balance?"
            </p>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : msg.isError
                      ? 'bg-red-950/50 border border-red-900 text-red-300'
                      : 'bg-slate-800 text-slate-100'
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
              <div className="bg-slate-800 text-slate-400 rounded-xl px-4 py-2 text-sm">
                Thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <form onSubmit={handleSend} className="border-t border-slate-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 rounded-lg bg-slate-800 text-white px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg px-6 py-2 transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default Chat;