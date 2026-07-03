import toolImplementations from './toolImplementations.js';

const executeToolCall = async (userId, toolCall) => {
  const { name, arguments: argsJson } = toolCall.function;

  let args;
  try {
    args = JSON.parse(argsJson);
  } catch (error) {
    return {
      error: true,
      message: `Failed to parse arguments for tool ${name}: malformed JSON.`,
    };
  }

  const implementation = toolImplementations[name];

  if (!implementation) {
    return {
      error: true,
      message: `Unknown tool requested: ${name}`,
    };
  }

  try {
    const result = await implementation(userId, args);
    return result;
  } catch (error) {
    return {
      error: true,
      message: `Tool ${name} failed: ${error.message}`,
    };
  }
};

export default executeToolCall;