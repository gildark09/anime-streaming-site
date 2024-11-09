const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Handle 404 errors
  if (err.message?.includes('not found') || err.response?.status === 404) {
    return res.status(404).json({
      error: 'Resource not found',
      details: err.message
    });
  }

  // Handle timeout errors
  if (err.code === 'ECONNABORTED') {
    return res.status(504).json({
      error: 'Request timeout',
      details: 'The server took too long to respond'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler; 