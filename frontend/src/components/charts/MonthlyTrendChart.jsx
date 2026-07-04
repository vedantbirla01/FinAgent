import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function MonthlyTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
        <YAxis stroke="#94a3b8" fontSize={12} />
        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8, color: '#fff' }} />
        <Legend />
        <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
        <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="Expense" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default MonthlyTrendChart;