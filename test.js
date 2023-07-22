const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const function_descriptions = [
  {
    name: 'calculate_deal_size',
    description: 'extract order details information, including which product clients want to buy, how many they want to buy, and return results in an array',
    parameters: {
      type: 'object',
      properties: {
        orders: {
          type: 'array',
          description: 'an array of products people want to buy & the amount they want to buy',
          items: {
            product: {
              type: 'string',
              description: 'the product name that user wants to buy',
            },
            amount: {
              type: 'string',
              description: 'the amount that user wants to buy for the specific product',
            },
          },
        },
      },
      required: ['product', 'amount'],
    },
  },
];

const content = `
Hi,
we are a team of 10 people, i want 2 t shirt & 1 pant for each member, and i will get 5 pairs of shoes;

can you let me know the price and how soon can it be delivered?

thanks
`;

const product_catalogue = `
[{"product": "t-shirt", "price": "$23"}, {"product": "pants", "price": "$15"}, {"product": "shoes", "price": "$39"}]
`;

const query = `This is the product catalogue: ${product_catalogue} Please calculate the deal size:${content}`;

const messages = [{ role: 'user', content: query }];

(async () => {
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

    console.log(response.data);
  } catch (error) {
    console.error('Error processing the request:', error.response?.data || error.message);
  }
})();
