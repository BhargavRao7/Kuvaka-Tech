const dataStore = require('../services/dataStore');

function setOffer(req, res) {
  const { name, value_props, ideal_use_cases } = req.body;

  if (!name || !value_props || !ideal_use_cases) {
    return res.status(400).json({ error: 'Invalid offer data. Please provide name, value_props, and ideal_use_cases.' });
  }

  dataStore.offer = { name, value_props, ideal_use_cases };

  console.log('Offer received and updated:', dataStore.offer);

  res.status(200).json({ message: 'Offer details received successfully.', offer: dataStore.offer });
}

module.exports = { setOffer };