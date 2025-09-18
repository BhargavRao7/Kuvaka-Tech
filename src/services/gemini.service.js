const axios = require('axios');

async function getAiScore(offer, lead) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in the .env file!');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
    CONTEXT:
    You are an expert Sales Development Representative tasked with qualifying leads.
    The product you are selling is called "${offer.name}".
    Key value propositions are: ${offer.value_props.join(', ')}.
    The ideal customer use case is: ${offer.ideal_use_cases.join(', ')}.

    LEAD DATA:
    - Name: ${lead.name}
    - Role: ${lead.role}
    - Company: ${lead.company}
    - Industry: ${lead.industry}
    - LinkedIn Bio: ${lead.linkedin_bio}

    TASK:
    Based on all the provided context, classify the lead's buying intent.
    Your response MUST be a valid JSON object with ONLY the following two keys:
    1. "intent": A string with one of three values: "High", "Medium", or "Low".
    2. "reasoning": A concise, one-sentence explanation for your classification.

    DO NOT add any other text, explanations, or markdown formatting outside of the JSON object.
  `;

  try {
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
    });
    const rawContent = response.data.candidates[0].content.parts[0].text;
    const jsonResponse = JSON.parse(rawContent);
    return jsonResponse;
  } catch (error) {
    console.error('Error contacting Gemini API:', error.response ? error.response.data : error.message);
    return {
      intent: 'Low',
      reasoning: 'AI analysis failed or could not be completed.',
    };
  }
}

module.exports = { getAiScore };