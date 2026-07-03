import groq from './groqClient.js';
import toolDefinitions from './toolDefinitions.js';
import executeToolCall from './toolExecutor.js';

const SYSTEM_PROMPT = `You are FinAgent, a helpful personal finance assistant.
You help users track expenses, income, and understand their spending.
Use the available tools to take real actions or fetch real data — never make up numbers.
Keep responses concise and friendly.`;

const runSingleTurn = async (userId, userMessage) => {
  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    tools: toolDefinitions,
    tool_choice: 'auto',
  });

  const responseMessage = completion.choices[0].message;

  if (!responseMessage.tool_calls) {
    return {
      reply: responseMessage.content,
      toolCalled: null,
      toolResult: null,
    };
  }

  const toolCall = responseMessage.tool_calls[0];
  const toolResult = await executeToolCall(userId, toolCall);

  const followUp = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
      responseMessage,
      {
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolResult),
      },
    ],
  });

  return {
    reply: followUp.choices[0].message.content,
    toolCalled: toolCall.function.name,
    toolResult,
  };
};

export default runSingleTurn;