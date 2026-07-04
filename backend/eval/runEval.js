import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import runAgent from '../services/agentService.js';
import testQueries from './testQueries.json' with { type: 'json' };

dotenv.config();

const EVAL_USER_EMAIL = 'eval-runner@finagent.test';

const getOrCreateEvalUser = async () => {
  let user = await User.findOne({ email: EVAL_USER_EMAIL });
  if (!user) {
    user = await User.create({
      name: 'Eval Runner',
      email: EVAL_USER_EMAIL,
      password: 'eval_test_password_123',
    });
  }
  return user;
};

const runEval = async () => {
  await connectDB();

  const evalUser = await getOrCreateEvalUser();

  // Reset conversation history so each eval run starts clean
  await Conversation.deleteOne({ user: evalUser._id });

  const results = [];
  let correct = 0;

  console.log(`Running eval on ${testQueries.length} queries...\n`);

  for (const testCase of testQueries) {
    const response = await runAgent(evalUser._id, testCase.query);

    const actualTools = response.trace
      .filter((t) => t.type === 'action')
      .map((t) => t.tool);

    const actualPrimaryTool = actualTools.length > 0 ? actualTools[0] : null;
    const passed = actualPrimaryTool === testCase.expectedTool;

    if (passed) correct += 1;

    results.push({
      id: testCase.id,
      query: testCase.query,
      expectedTool: testCase.expectedTool,
      actualTool: actualPrimaryTool,
      allToolsCalled: actualTools,
      passed,
    });

    console.log(
      `${passed ? '✓' : '✗'} [${testCase.id}] "${testCase.query}" → expected: ${testCase.expectedTool}, got: ${actualPrimaryTool}`
    );
  }

  const accuracy = Math.round((correct / testQueries.length) * 10000) / 100;

  console.log(`\n=== Eval Summary ===`);
  console.log(`Passed: ${correct}/${testQueries.length} (${accuracy}%)`);

  const failed = results.filter((r) => !r.passed);
  if (failed.length > 0) {
    console.log(`\nFailed cases:`);
    failed.forEach((f) => {
      console.log(`  [${f.id}] "${f.query}" — expected ${f.expectedTool}, got ${f.actualTool}`);
    });
  }

  await mongoose.connection.close();
  process.exit(0);
};

runEval().catch((error) => {
  console.error('Eval run failed:', error);
  process.exit(1);
});