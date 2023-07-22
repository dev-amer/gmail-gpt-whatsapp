const fastify = require('fastify')({ logger: true });
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const function_descriptions = [
  {
    name: 'extract_info_from_email',
    description: 'categorise & extract key info from an email, such as use case, company name, contact details, etc.',
    parameters: {
      type: 'object',
      properties: {
        companyName: {
          type: 'string',
          description: 'the name of the company that sent the email',
        },
        priority: {
          type: 'string',
          description: 'Try to give a priority score to this email based on how likely this email will lead to a good business opportunity, from 0 to 10; 10 most important',
        },
        category: {
          type: 'string',
          description: 'Try to categorise this email into categories like those: 1. Sales 2. customer support; 3. consulting; 4. partnership; etc.',
        },
        product: {
          type: 'string',
          description: 'Try to identify which product the client is interested in, if any',
        },
        amount: {
          type: 'string',
          description: 'Try to identify the amount of products the client wants to purchase, if any',
        },
        nextStep: {
          type: 'string',
          description: 'What is the suggested next step to move this forward?',
        },
      },
      required: ['companyName', 'amount', 'product', 'priority', 'category', 'nextStep'],
    },
  },
];

const Email = {
  from_email: 'string',
  content: 'string',
};

fastify.get('/', async (request, reply) => {
  return { Hello: 'World' };
});

fastify.post('/', async (request, reply) => {
  const { content } = request.body;
  const query = `Please extract key information from this email: ${content} `;

  const messages = [{ role: 'user', content: query }];

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-0613',
        messages: messages,
        functions: function_descriptions,
        function_call: 'auto',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const arguments = response.data.choices[0].message.function_call.arguments;
    const companyName = eval(arguments).companyName;
    const priority = eval(arguments).priority;
    const product = eval(arguments).product;
    const amount = eval(arguments).amount;
    const category = eval(arguments).category;
    const nextStep = eval(arguments).nextStep;

    return {
      companyName,
      product,
      amount,
      priority,
      category,
      nextStep,
    };
  } catch (error) {
    console.error('Error processing the email:', error);
    return { error: 'An error occurred while processing the email' };
  }
});

fastify.listen(3000, '0.0.0.0', (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening on ${address}`);
});
