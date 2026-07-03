import asyncHandler from 'express-async-handler';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';

// @desc    Category-wise expense breakdown for current month (for pie chart)
// @route   GET /api/analytics/category-summary
// @access  Private
const getCategorySummary = asyncHandler(async (req, res) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const result = await Transaction.aggregate([
    {
      $match: {
        user: req.user._id,
        type: 'expense',
        date: { $gte: start, $lt: end },
      },
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
      },
    },
    { $sort: { total: -1 } },
    {
      $project: {
        _id: 0,
        category: '$_id',
        total: 1,
      },
    },
  ]);

  res.json(result);
});

// @desc    Monthly income vs expense trend, last 6 months (for line chart)
// @route   GET /api/analytics/monthly-trend
// @access  Private
const getMonthlyTrend = asyncHandler(async (req, res) => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const result = await Transaction.aggregate([
    {
      $match: {
        user: req.user._id,
        date: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Reshape into { month: 'Jul 2026', income: X, expense: Y } per month
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthMap = {};

  for (let i = 0; i < 6; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    monthMap[key] = {
      month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
      income: 0,
      expense: 0,
    };
  }

  result.forEach((r) => {
    const key = `${r._id.year}-${r._id.month}`;
    if (monthMap[key]) {
      monthMap[key][r._id.type] = r.total;
    }
  });

  res.json(Object.values(monthMap));
});

// @desc    Budget vs actual spending for current month, per category (for bar chart)
// @route   GET /api/analytics/budget-vs-actual
// @access  Private
const getBudgetVsActual = asyncHandler(async (req, res) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [budgets, actuals] = await Promise.all([
    Budget.find({ user: req.user._id }),
    Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
    ]),
  ]);

  const actualMap = {};
  actuals.forEach((a) => {
    actualMap[a._id] = a.total;
  });

  const result = budgets.map((b) => ({
    category: b.category,
    budget: b.monthlyLimit,
    actual: actualMap[b.category] || 0,
  }));

  res.json(result);
});

export { getCategorySummary, getMonthlyTrend, getBudgetVsActual };