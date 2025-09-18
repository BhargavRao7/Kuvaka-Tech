// This is the main entry point for our application.
// It sets up the Express server and wires everything together.
require('dotenv').config(); // Load environment variables from .env file FIRST.
const express = require('express');
const apiRoutes = require('./src/api/routes');

// Create our Express application.
const app = express();

// Define the port. We'll use the environment variable PORT if it's set (for deployment),
// otherwise, we'll default to 3000 for local development.
const PORT = process.env.PORT || 3000;

// --- Middleware ---
// This is middleware to parse incoming JSON request bodies.
// It makes `req.body` available for us in our controllers.
app.use(express.json());

// --- API Routes ---
// We'll prefix all our API routes with '/api' for good practice.
// Any request starting with /api will be handled by our router.
app.use('/api', apiRoutes);

// A simple root route to check if the server is up and running.
app.get('/', (req, res) => {
  res.send('Lead Scorer API is alive and kicking! 🎉');
});

// --- Start the Server ---
// This starts the server and makes it listen for incoming requests on our defined port.
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});