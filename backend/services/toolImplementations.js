import Transaction from '../models/Transaction.js';
import searchFinancialTips from './ragService.js';

const addExpense = async (userId, args) => {
  const { amount, category, description } = args || {};
  const transaction = await Transaction.create({
    user: userId,
    type: 'expense',
    amount,
    category,
    description: description || '',
  });
  return {
    success: true,
    message: `Recorded expense of ${amount} in ${category}.`,
    transaction: {
      id: transaction._id,
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.date,
    },
  };
};

const addIncome = async (userId, args) => {
  const { amount, category, description } = args || {};
  const transaction = await Transaction.create({
    user: userId,
    type: 'income',
    amount,
    category,
    description: description || '',
  });
  return {
    success: true,
    message: `Recorded income of ${amount} from ${category}.`,
    transaction: {
      id: transaction._id,
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.date,
    },
  };
};

const getBalance = async (userId) => {
  const result = await Transaction.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  const totals = { income: 0, expense: 0 };
  result.forEach((r) => {
    totals[r._id] = r.total;
  });

  const balance = totals.income - totals.expense;

  return {
    balance,
    totalIncome: totals.income,
    totalExpense: totals.expense,
  };
};

const getDateRangeForPeriod = (period) => {
  const now = new Date();
  if (period === 'last_month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start, end };
  }
  if (period === 'all_time') {
    return null;
  }
  // default: this_month
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
};

const getSummary = async (userId, args) => {
  const { period } = args || {};
  const range = getDateRangeForPeriod(period || 'this_month');

  const match = { user: userId, type: 'expense' };
  if (range) {
    match.date = { $gte: range.start, $lt: range.end };
  }

  const result = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
      },
    },
    { $sort: { total: -1 } },
  ]);

  const categoryBreakdown = result.map((r) => ({
    category: r._id,
    total: r.total,
  }));

  const totalSpent = categoryBreakdown.reduce((sum, c) => sum + c.total, 0);

  return {
    period: period || 'this_month',
    totalSpent,
    categoryBreakdown,
  };
};

const searchTips = async (userId, args) => {
  const { query } = args || {};
  const results = await searchFinancialTips(query);
  return {
    query,
    tips: results,
  };
};

const toolImplementations = {
  addExpense,
  addIncome,
  getBalance,
  getSummary,
  searchFinancialTips: searchTips,
};

export default toolImplementations;