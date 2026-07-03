import asyncHandler from 'express-async-handler';
import Budget from '../models/Budget.js';

// @desc    Set or update a budget for a category
// @route   POST /api/budgets
// @access  Private
const setBudget = asyncHandler(async (req, res) => {
  const { category, monthlyLimit } = req.body;

  if (!category || monthlyLimit === undefined) {
    res.status(400);
    throw new Error('category and monthlyLimit are required');
  }

  const budget = await Budget.findOneAndUpdate(
    { user: req.user._id, category },
    { monthlyLimit },
    { upsert: true, new: true, runValidators: true }
  );

  res.json(budget);
});

// @desc    Get all budgets for the logged-in user
// @route   GET /api/budgets
// @access  Private
const getBudgets = asyncHandler(async (req, res) => {
  const budgets = await Budget.find({ user: req.user._id });
  res.json(budgets);
});

export { setBudget, getBudgets };
