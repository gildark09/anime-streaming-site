const express = require('express');
const router = express.Router();
const AnimeService = require('../services/animeService');
const {
    getTrending,
    searchAnime,
    getAnimeById,
    getStreamingLinks
} = require('../controllers/animeController');
const axios = require('axios');

// Test route - move this to the top
router.get('/test', (req, res) => {
  try {
    res.json({ status: 'ok', message: 'Backend API is running' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Consumet test route
router.get('/consumet-test', async (req, res) => {
  try {
    const result = await AnimeService.testConsumetConnection();
    res.json({ status: 'ok', result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trending anime
router.get('/trending', getTrending);

// Search anime
router.get('/search/:query', searchAnime);

// Get streaming links
router.get('/watch/:episodeId', getStreamingLinks);

// Get single anime by ID
router.get('/:id', getAnimeById);

// HLS manifest proxy
router.get('/proxy/hls', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      throw new Error('No URL provided');
    }

    console.log('=== HLS Proxy Debug ===');
    console.log('Original URL:', url);

    const response = await axios.get(url);
    
    // Log the M3U8 content
    console.log('M3U8 Content:', response.data);
    console.log('=== End Debug ===');

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.send(response.data);
  } catch (error) {
    console.error('HLS proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// TS segment proxy
router.get('/proxy/ts', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      throw new Error('No URL provided');
    }

    console.log('Proxying TS segment:', url);

    const response = await axios({
      method: 'get',
      url: url,
      headers: {
        'Referer': 'https://gogoanime.cl/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Origin': 'https://gogoanime.cl'
      },
      responseType: 'stream',
      timeout: 10000
    });

    // Copy original headers
    const headers = response.headers;
    Object.keys(headers).forEach(key => {
      res.setHeader(key, headers[key]);
    });

    // Set required headers
    res.setHeader('Content-Type', 'video/mp2t');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length');
    
    // Pipe the response
    response.data.pipe(res);
  } catch (error) {
    console.error('TS proxy error:', {
      message: error.message,
      url: req.query.url,
      status: error.response?.status,
      headers: error.response?.headers
    });
    res.status(500).json({ 
      error: 'Failed to proxy TS segment',
      details: error.message,
      url: req.query.url
    });
  }
});

// Add health check endpoint
router.get('/health', async (req, res) => {
  try {
    const health = await AnimeService.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

module.exports = router; 