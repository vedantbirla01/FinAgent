import groq from './groqClient.js';
import toolDefinitions from './toolDefinitions.js';
import executeToolCall from './toolExecutor.js';
import Conversation from '../models/Conversation.js';

const SYSTEM_PROMPT = `You are FinAgent, a helpful personal finance assistant.
You help users track expenses, income, and understand their spending patterns.
You can call tools to record transactions or fetch real data. Never make up numbers — always use a tool to get real data before answering questions about amounts.
If a question requires multiple pieces of information (e.g. comparing two time periods), call tools one at a time and use each result before deciding your next step.
Once you have everything you need, give a concise, friendly final answer. Do not call a tool if you already have the answer from a previous tool result in this conversation.`;

const MAX_ITERATIONS = 5;
const HISTORY_LIMIT = 10; // last 10 messages (5 user+assistant exchanges) sent as context

const getOrCreateConversation = async (userId) => {
  let conversation = await Conversation.findOne({ user: userId });
  if (!conversation) {
    conversation = await Conversation.create({ user: userId, messages: [] });
  }
  return conversation;
};

const buildContextMessages = (conversation) => {
  const recent = conversation.messages.slice(-HISTORY_LIMIT);
  return recent
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role, content: m.content }));
};

const runAgent = async (userId, userMessage) => {
  const conversation = await getOrCreateConversation(userId);
  const contextMessages = buildContextMessages(conversation);

  const trace = [];

  // Working message list for this turn's LLM calls (not directly persisted — includes raw tool_call objects)
  const loopMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...contextMessages,
    { role: 'user', content: userMessage },
  ];

  let finalReply = null;
  let iteration = 0;

  while (iteration < MAX_ITERATIONS) {
    iteration += 1;

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL,
      messages: loopMessages,
      tools: toolDefinitions,
      tool_choice: 'auto',
    });

    const responseMessage = completion.choices[0].message;

    if (!responseMessage.tool_calls || responseMessage.tool_calls.length === 0) {
      finalReply = responseMessage.content;
      trace.push({
        step: iteration,
        type: 'final_answer',
        content: responseMessage.content,
      });
      break;
    }

    loopMessages.push(responseMessage);

    for (const toolCall of responseMessage.tool_calls) {
      const toolResult = await executeToolCall(userId, toolCall);

      trace.push({
        step: iteration,
        type: 'action',
        tool: toolCall.function.name,
        arguments: JSON.parse(toolCall.function.arguments),
        observation: toolResult,
      });

      loopMessages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolResult),
      });
    }
  }

  if (!finalReply) {
    finalReply =
      "I wasn't able to fully resolve that after several steps — could you rephrase or simplify your question?";
    trace.push({ step: iteration, type: 'max_iterations_reached' });
  }

  // Persist only user message + final assistant reply to conversation memory
  const toolsUsed = trace
    .filter((t) => t.type === 'action')
    .map((t) => t.tool)
    .join(', ');

  conversation.messages.push({ role: 'user', content: userMessage });
  conversation.messages.push({
    role: 'assistant',
    content: finalReply,
    toolName: toolsUsed || null,
  });
  await conversation.save();

  console.log(`\n--- ReAct trace (${iteration} iteration(s)) ---`);
  console.log(JSON.stringify(trace, null, 2));
  console.log('--- end trace ---\n');

  return {
    reply: finalReply,
    trace,
    iterations: iteration,
  };
};

export default runAgent;