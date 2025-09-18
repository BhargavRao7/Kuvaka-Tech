const dataStore = require('./dataStore');
const { getAiScore } = require('./gemini.service');

const DECISION_MAKER_ROLES = ['head', 'vp', 'founder', 'ceo', 'c-level', 'director'];
const INFLUENCER_ROLES = ['manager', 'lead', 'principal', 'senior'];

/**
 * Calculates the score based on a set of predefined rules.
 * @param {object} lead - The lead object to score.
 * @param {object} offer - The offer object for context.
 * @returns {number} The calculated rule score (0-50).
 */
function calculateRuleScore(lead, offer) {
  let score = 0;
  const leadRole = lead.role.toLowerCase();

  if (DECISION_MAKER_ROLES.some(role => leadRole.includes(role))) {
    score += 20;  
  } else if (INFLUENCER_ROLES.some(role => leadRole.includes(role))) {
    score += 10; 
  }

  const leadIndustry = lead.industry.toLowerCase();
  if (offer.ideal_use_cases.some(useCase => useCase.toLowerCase().includes(leadIndustry))) {
    score += 20;  
  }
  const allFieldsPresent = Object.values(lead).every(field => field && field.trim() !== '');
  if (allFieldsPresent) {
    score += 10;  
  }

  return score;
}

function mapAiIntentToPoints(intent) {
  const intentMap = {
    High: 50,
    Medium: 30,
    Low: 10,
  };
  return intentMap[intent] || 10;
}

async function runScoringPipeline() {
  const { leads, offer } = dataStore;

  if (!leads.length || !offer) {
    throw new Error('Offer and leads must be uploaded before scoring.');
  }

  const scoredResults = [];

  for (const lead of leads) {
    console.log(`Scoring lead: ${lead.name}...`);

    const ruleScore = calculateRuleScore(lead, offer);

    const aiResult = await getAiScore(offer, lead);
    const aiPoints = mapAiIntentToPoints(aiResult.intent);

    scoredResults.push({
      name: lead.name,
      role: lead.role,
      company: lead.company,
      intent: aiResult.intent, // e.g., "High"
      score: ruleScore + aiPoints, // Final combined score
      reasoning: aiResult.reasoning, // The AI's justification
    });
  }

  scoredResults.sort((a, b) => b.score - a.score);

  dataStore.results = scoredResults;
  console.log('Scoring complete!');
}

module.exports = { runScoringPipeline };