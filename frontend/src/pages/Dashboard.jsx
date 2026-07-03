import { useAuth } from '../context/useAuth.js';

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <button
            onClick={logout}
            className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Log out
          </button>
        </div>
        <div className="bg-slate-800 rounded-xl p-6">
          <p className="text-slate-300">
            Logged in as <span className="text-white font-medium">{user?.name}</span> ({user?.email})
          </p>
          <p className="text-slate-500 text-sm mt-4">
            Real dashboard with charts and chat comes in later phases.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;