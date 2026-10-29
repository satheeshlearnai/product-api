const app = require('./app');

/**
 * Starts the Product API server on process.env.PORT, defaulting to 3000.
 * Takes no parameters; exits the process with code 1 if startup throws.
 * @returns {Promise<void>} Resolves once the server has been asked to listen.
 */
async function startServer() {
  const PORT = process.env.PORT || 3000;
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
