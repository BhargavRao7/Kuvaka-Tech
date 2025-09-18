const csv = require('csv-parser');
const stream = require('stream');
const dataStore = require('../services/dataStore');
const { runScoringPipeline } = require('../services/scoring.service');

function uploadLeads(req, res) {
  if (!req.file) {
    return res.status(400).send({ error: 'No CSV file uploaded.' });
  }

  dataStore.leads = [];
  dataStore.results = [];

  const bufferStream = new stream.PassThrough();
  bufferStream.end(req.file.buffer);

  bufferStream
    .pipe(csv())
    .on('data', (row) => {
      dataStore.leads.push(row);
    })
    .on('end', () => {
      // Once the file is fully parsed, we send a success response.
      console.log(`${dataStore.leads.length} leads parsed from CSV.`);
      res.status(200).send({
        message: 'CSV file uploaded and parsed successfully.',
        leadCount: dataStore.leads.length,
        leads: dataStore.leads, // Sending a preview of the leads
      });
    })
    .on('error', (error) => {
      console.error('Error parsing CSV:', error);
      res.status(500).send({ error: 'Failed to parse the CSV file.' });
    });
}

/**
 * Handles the POST /score request.
 * It kicks off the scoring pipeline.
 */
async function triggerScoring(req, res) {
  try {
    // We call our main scoring function from the service layer.
    await runScoringPipeline();
    res.status(200).json({
      message: 'Scoring process completed successfully.',
      resultCount: dataStore.results.length,
      results: dataStore.results, // Return the results directly
    });
  } catch (error) {
    console.error('Scoring error:', error.message);
    // Send back a helpful error message if something went wrong (e.g., no leads were uploaded).
    res.status(400).json({ error: error.message });
  }
}

/**
 * Handles the GET /results request.
 * Returns the scored leads as either JSON or a CSV file.
 */
function getResults(req, res) {
  const { results } = dataStore;

  if (results.length === 0) {
    return res.status(200).json([]); // Return an empty array if no results yet.
  }

  const exportCsv = req.query.exportcsv === 'true'; // Check query param

  if (exportCsv) {
    // Create the CSV header row
    const csvHeader = 'name,role,company,intent,score,reasoning\n';
    // Create a CSV row for each result
    const csvRows = results.map(r =>
      `"${r.name}","${r.role}","${r.company}","${r.intent}","${r.score}","${r.reasoning}"`
    ).join('\n');

    const csvContent = csvHeader + csvRows;

    res.header('Content-Type', 'text/csv');
    res.attachment('scored_leads.csv'); // Force download
    return res.send(csvContent);
  } else {
    // Default: return JSON
    return res.status(200).json(results);
  }
}



module.exports = {
  uploadLeads,
  triggerScoring,
  getResults,
};