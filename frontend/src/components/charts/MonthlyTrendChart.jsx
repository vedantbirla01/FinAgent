import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function MonthlyTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#253252" />
        <XAxis dataKey="month" stroke="#8891a5" fontSize={11} fontFamily="JetBrains Mono, monospace" />
        <YAxis stroke="#8891a5" fontSize={11} fontFamily="JetBrains Mono, monospace" />
        <Tooltip contentStyle={{ backgroundColor: '#111a2e', border: '1px solid #253252', borderRadius: 8, color: '#e8ecf3', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Inter, sans-serif' }} />
        <Line type="monotone" dataKey="income" stroke="#2dd4bf" strokeWidth={2} name="Income" dot={{ r: 3 }} />
        <Line type="monotone" dataKey="expense" stroke="#fb7185" strokeWidth={2} name="Expense" dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default MonthlyTrendChart;