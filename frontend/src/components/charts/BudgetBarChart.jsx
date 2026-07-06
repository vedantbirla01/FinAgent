import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function BudgetBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted text-sm font-mono">
        no budgets set yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#253252" />
        <XAxis dataKey="category" stroke="#8891a5" fontSize={11} fontFamily="JetBrains Mono, monospace" />
        <YAxis stroke="#8891a5" fontSize={11} fontFamily="JetBrains Mono, monospace" />
        <Tooltip contentStyle={{ backgroundColor: '#111a2e', border: '1px solid #253252', borderRadius: 8, color: '#e8ecf3', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Inter, sans-serif' }} />
        <Bar dataKey="budget" fill="#d4a857" name="Budget" radius={[4, 4, 0, 0]} />
        <Bar dataKey="actual" fill="#fb7185" name="Actual" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default BudgetBarChart;