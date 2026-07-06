import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import { Wallet } from 'lucide-react';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 ledger-bg">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 rounded-md bg-gold/10 border border-gold/30 flex items-center justify-center">
            <Wallet size={18} className="text-gold" />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">FinAgent</span>
        </div>

        <div className="bg-panel border border-border rounded-2xl p-8 shadow-2xl shadow-black/40">
          <h1 className="font-display text-xl font-semibold mb-1">Create your account</h1>
          <p className="text-muted text-sm mb-6">Start tracking in a minute.</p>

          {error && (
            <div className="mb-4 text-sm text-rose bg-rose/10 border border-rose/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wide text-muted mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg bg-panel-light border border-border text-text px-3 py-2.5 outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/40 transition-colors font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-muted mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg bg-panel-light border border-border text-text px-3 py-2.5 outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/40 transition-colors font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-muted mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg bg-panel-light border border-border text-text px-3 py-2.5 outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/40 transition-colors font-mono text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gold hover:bg-gold-dim disabled:opacity-50 text-ink font-semibold rounded-lg py-2.5 transition-colors"
            >
              {submitting ? 'Creating account…' : 'Register'}
            </button>
          </form>

          <p className="mt-5 text-sm text-muted text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-gold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;