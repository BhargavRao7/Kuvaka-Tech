const express = require('express');
const multer = require('multer');

const { setOffer } = require('../controllers/offer.controller');
const { uploadLeads, triggerScoring, getResults } = require('../controllers/leads.controller');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/offer', setOffer);

router.post('/leads/upload', upload.single('leadsFile'), uploadLeads);

router.post('/score', triggerScoring);

router.get('/results', getResults);

module.exports = router;