import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth.js';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import CategoryPieChart from '../components/charts/CategoryPieChart.jsx';
import MonthlyTrendChart from '../components/charts/MonthlyTrendChart.jsx';
import BudgetBarChart from '../components/charts/BudgetBarChart.jsx';
import { Wallet, MessageSquare, LogOut } from 'lucide-react';

function Dashboard() {
  const { user, logout } = useAuth();
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [budgetData, setBudgetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [budgetCategory, setBudgetCategory] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [savingBudget, setSavingBudget] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [categoryRes, trendRes, budgetRes] = await Promise.all([
        api.get('/analytics/category-summary'),
        api.get('/analytics/monthly-trend'),
        api.get('/analytics/budget-vs-actual'),
      ]);
      setCategoryData(categoryRes.data);
      setTrendData(trendRes.data);
      setBudgetData(budgetRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleSetBudget = async (e) => {
    e.preventDefault();
    if (!budgetCategory || !budgetLimit) return;
    setSavingBudget(true);
    try {
      await api.post('/budgets', {
        category: budgetCategory,
        monthlyLimit: Number(budgetLimit),
      });
      setBudgetCategory('');
      setBudgetLimit('');
      await loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save budget');
    } finally {
      setSavingBudget(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-gold/10 border border-gold/30 flex items-center justify-center">
              <Wallet size={16} className="text-gold" />
            </div>
            <div>
              <h1 className="font-display font-semibold text-lg leading-tight">Dashboard</h1>
              <p className="text-muted text-xs leading-tight">{user?.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to="/chat"
              className="flex items-center gap-1.5 text-xs text-muted hover:text-text bg-panel-light hover:bg-border border border-border px-3 py-1.5 rounded-lg transition-colors"
            >
              <MessageSquare size={13} /> Chat
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-text bg-panel-light hover:bg-border border border-border px-3 py-1.5 rounded-lg transition-colors"
            >
              <LogOut size={13} /> Log out
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-sm text-rose bg-rose/10 border border-rose/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-muted text-sm font-mono">loading dashboard…</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-panel border border-border rounded-2xl p-6">
              <h2 className="font-display text-sm font-semibold mb-3 text-muted uppercase tracking-wide">
                Spending by Category
              </h2>
              <CategoryPieChart data={categoryData} />
            </div>

            <div className="bg-panel border border-border rounded-2xl p-6">
              <h2 className="font-display text-sm font-semibold mb-3 text-muted uppercase tracking-wide">
                6-Month Trend
              </h2>
              <MonthlyTrendChart data={trendData} />
            </div>

            <div className="bg-panel border border-border rounded-2xl p-6 lg:col-span-2">
              <h2 className="font-display text-sm font-semibold mb-3 text-muted uppercase tracking-wide">
                Budget vs Actual
              </h2>
              <BudgetBarChart data={budgetData} />
            </div>

            <div className="bg-panel border border-border rounded-2xl p-6 lg:col-span-2">
              <h2 className="font-display text-sm font-semibold mb-4 text-muted uppercase tracking-wide">
                Set a Budget
              </h2>
              <form onSubmit={handleSetBudget} className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-xs text-muted mb-1.5">Category</label>
                  <input
                    type="text"
                    value={budgetCategory}
                    onChange={(e) => setBudgetCategory(e.target.value)}
                    placeholder="groceries"
                    required
                    className="rounded-lg bg-panel-light border border-border text-text px-3 py-2 outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/40 transition-colors font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5">Monthly Limit</label>
                  <input
                    type="number"
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(e.target.value)}
                    placeholder="3000"
                    min="0"
                    required
                    className="rounded-lg bg-panel-light border border-border text-text px-3 py-2 outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/40 transition-colors font-mono text-sm w-32"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingBudget}
                  className="bg-gold hover:bg-gold-dim disabled:opacity-50 text-ink font-semibold rounded-lg px-4 py-2 transition-colors text-sm"
                >
                  {savingBudget ? 'Saving…' : 'Save Budget'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;