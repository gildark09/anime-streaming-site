const express = require('express');
const router = express.Router();
const animeService = require('../services/animeService');

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ status: 'ok', message: 'Anime API is working' });
});

// Get trending anime
router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const data = await animeService.getTrending(limit);
    res.json(data);
  } catch (error) {
    console.error('Error in trending route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch trending anime',
      details: error.message 
    });
  }
});

// Get anime info
router.get('/info/:id', async (req, res) => {
  try {
    const data = await animeService.getAnimeInfo(req.params.id);
    res.json(data);
  } catch (error) {
    console.error('Error in info route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch anime info',
      details: error.message 
    });
  }
});

// Get streaming links
router.get('/watch/:episodeId', async (req, res) => {
  try {
    const data = await animeService.getStreamingLinks(req.params.episodeId);
    res.json(data);
  } catch (error) {
    console.error('Error in watch route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch streaming links',
      details: error.message 
    });
  }
});

module.exports = router; 