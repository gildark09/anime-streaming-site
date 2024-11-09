const AnimeService = require('../services/animeService');

module.exports = {
    getTrending: async (req, res) => {
        try {
            console.log('Processing trending request...');
            const trending = await AnimeService.getTrending();
            console.log('Trending data received:', {
                hasData: !!trending,
                resultsCount: trending?.results?.length || 0
            });
            res.json(trending);
        } catch (error) {
            console.error('Controller error in getTrending:', error);
            res.status(500).json({ 
                message: 'Error fetching trending anime',
                error: error.message 
            });
        }
    },

    searchAnime: async (req, res) => {
        try {
            const { query } = req.params;
            const filters = req.query;
            
            console.log('Processing search request for:', query, 'with filters:', filters);
            const results = await AnimeService.searchAnime(query, filters);
            
            console.log('Search results:', {
                hasResults: !!results?.results,
                count: results?.results?.length || 0
            });
            
            res.json(results);
        } catch (error) {
            console.error('Controller error in searchAnime:', error);
            res.status(500).json({ 
                message: 'Error searching anime',
                error: error.message 
            });
        }
    },

    getAnimeById: async (req, res, next) => {
        try {
            console.log('=== Controller: getAnimeById ===');
            console.log('Requested ID:', req.params.id);
            
            if (!req.params.id) {
                const error = new Error('Anime ID is required');
                error.status = 400;
                return next(error);
            }

            try {
                const anime = await AnimeService.getAnimeInfo(req.params.id);
                if (!anime) {
                    const error = new Error('Anime not found');
                    error.status = 404;
                    return next(error);
                }
                res.json(anime);
            } catch (error) {
                if (error.message.includes('not found')) {
                    error.status = 404;
                    return next(error);
                }
                throw error;
            }
        } catch (error) {
            console.error('Controller error:', error);
            next(error);
        }
    },

    getStreamingLinks: async (req, res, next) => {
        try {
            console.log('=== Controller: getStreamingLinks ===');
            console.log('Episode ID:', req.params.episodeId);

            if (!req.params.episodeId) {
                const error = new Error('Episode ID is required');
                error.status = 400;
                return next(error);
            }

            try {
                const links = await AnimeService.getStreamingLinks(req.params.episodeId);
                if (!links?.sources?.length) {
                    const error = new Error('No streaming sources found');
                    error.status = 404;
                    return next(error);
                }
                res.json(links);
            } catch (error) {
                if (error.message.includes('not found')) {
                    error.status = 404;
                    return next(error);
                }
                throw error;
            }
        } catch (error) {
            console.error('Controller error:', error);
            next(error);
        }
    }
}; 