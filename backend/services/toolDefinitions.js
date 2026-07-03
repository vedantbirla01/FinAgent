const toolDefinitions = [
  {
    type: 'function',
    function: {
      name: 'addExpense',
      description: 'Record a new expense transaction for the user.',
      parameters: {
        type: 'object',
        properties: {
          amount: {
            type: 'number',
            description: 'The amount of money spent, always positive.',
          },
          category: {
            type: 'string',
            description: 'The spending category, e.g. groceries, rent, transport, entertainment.',
          },
          description: {
            type: 'string',
            description: 'Optional short note about the expense.',
          },
        },
        required: ['amount', 'category'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'addIncome',
      description: 'Record a new income transaction for the user.',
      parameters: {
        type: 'object',
        properties: {
          amount: {
            type: 'number',
            description: 'The amount of money received, always positive.',
          },
          category: {
            type: 'string',
            description: 'The income source category, e.g. salary, freelance, gift.',
          },
          description: {
            type: 'string',
            description: 'Optional short note about the income.',
          },
        },
        required: ['amount', 'category'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getBalance',
      description: "Get the user's current overall balance (total income minus total expenses).",
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getSummary',
      description: "Get a category-wise breakdown of the user's spending, optionally filtered by time period.",
      parameters: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['this_month', 'last_month', 'all_time'],
            description: 'Which time period to summarize. Defaults to this_month if not specified.',
          },
        },
      },
    },
  },
];

export default toolDefinitions;