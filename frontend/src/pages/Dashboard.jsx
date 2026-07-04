import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import api from '../api/axios.js';
import CategoryPieChart from '../components/charts/CategoryPieChart.jsx';
import MonthlyTrendChart from '../components/charts/MonthlyTrendChart.jsx';
import BudgetBarChart from '../components/charts/BudgetBarChart.jsx';

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
    <div className="min-h-screen bg-slate-900 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Dashboard
            </h1>

            <p className="text-slate-400 text-sm">
              Logged in as{' '}
              <span className="text-slate-300">
                {user?.name}
              </span>
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/chat"
              className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Chat
            </Link>

            <button
              onClick={logout}
              className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Log out
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-400">
            Loading dashboard...
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-2">
                Spending by Category (This Month)
              </h2>

              <CategoryPieChart data={categoryData} />
            </div>

            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-2">
                6-Month Income vs Expense Trend
              </h2>

              <MonthlyTrendChart data={trendData} />
            </div>

            <div className="bg-slate-800 rounded-xl p-6 lg:col-span-2">
              <h2 className="text-white font-semibold mb-2">
                Budget vs Actual (This Month)
              </h2>

              <BudgetBarChart data={budgetData} />
            </div>

            <div className="bg-slate-800 rounded-xl p-6 lg:col-span-2">
              <h2 className="text-white font-semibold mb-4">
                Set a Monthly Budget
              </h2>

              <form
                onSubmit={handleSetBudget}
                className="flex flex-wrap gap-3 items-end"
              >
                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    Category
                  </label>

                  <input
                    type="text"
                    value={budgetCategory}
                    onChange={(e) => setBudgetCategory(e.target.value)}
                    placeholder="groceries"
                    required
                    className="rounded-lg bg-slate-700 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    Monthly Limit
                  </label>

                  <input
                    type="number"
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(e.target.value)}
                    placeholder="3000"
                    min="0"
                    required
                    className="rounded-lg bg-slate-700 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 w-32"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingBudget}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2 transition-colors"
                >
                  {savingBudget ? 'Saving...' : 'Save Budget'}
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