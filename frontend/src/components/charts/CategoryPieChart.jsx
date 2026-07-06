import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#d4a857', '#2dd4bf', '#fb7185', '#8891a5', '#a9834a', '#5eead4', '#f9a8b4', '#4b5877'];

function CategoryPieChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted text-sm font-mono">
        no expenses this month yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: '#111a2e', border: '1px solid #253252', borderRadius: 8, color: '#e8ecf3', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Inter, sans-serif' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default CategoryPieChart;