const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

class AnimeService {
  constructor() {
    // Initialize cache with 15 minutes TTL
    this.cache = new NodeCache({ 
      stdTTL: 900,
      checkperiod: 120
    });
    
    this.consumetClient = axios.create({
      baseURL: process.env.CONSUMET_API_URL || 'http://localhost:3000',
      timeout: 5000
    });

    // Add request interceptor for logging
    this.consumetClient.interceptors.request.use(config => {
      console.log(`Making ${config.method.toUpperCase()} request to: ${config.url}`);
      return config;
    });

    // Add response interceptor for caching
    this.consumetClient.interceptors.response.use(response => {
      const cacheKey = this.getCacheKey(response.config);
      this.cache.set(cacheKey, response.data);
      return response;
    });
  }

  // Generate cache key from request
  getCacheKey(config) {
    return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
  }

  // Check cache before making request
  async makeRequest(config) {
    const cacheKey = this.getCacheKey(config);
    const cachedData = this.cache.get(cacheKey);

    if (cachedData) {
      console.log('Cache hit:', cacheKey);
      return cachedData;
    }

    console.log('Cache miss:', cacheKey);
    const response = await this.consumetClient(config);
    return response.data;
  }

  async searchAnime(query, filters = {}) {
    try {
      console.log('Searching anime:', query);
      const searchQuery = isNaN(query) ? query : 'bleach';
      
      const data = await this.makeRequest({
        method: 'get',
        url: `/anime/gogoanime/search/${searchQuery}`,
        params: filters
      });
      
      // Transform the data
      const results = data.results.map(anime => ({
        id: anime.id,
        title: anime.title,
        image: anime.image,
        rating: anime.rating || 'N/A',
        releaseDate: anime.releaseDate || '',
        description: anime.description || '',
        genres: anime.genres || [],
        status: anime.subOrDub || 'Unknown'
      }));

      return {
        results,
        hasNextPage: data.hasNextPage
      };
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  // Add batch processing for multiple requests
  async batchProcess(requests) {
    try {
      const results = await Promise.all(
        requests.map(req => this.makeRequest(req))
      );
      return results;
    } catch (error) {
      console.error('Batch processing error:', error);
      throw error;
    }
  }

  // Add health check method
  async healthCheck() {
    try {
      const start = Date.now();
      await this.consumetClient.get('/');
      const latency = Date.now() - start;
      
      return {
        status: 'healthy',
        latency,
        cacheStats: this.cache.getStats()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  async getTrending() {
    try {
      console.log('Fetching trending anime from Consumet...');
      const data = await this.makeRequest({
        method: 'get',
        url: '/anime/gogoanime/top-airing'
      });
      
      // Transform the data
      const results = data.results.map(anime => ({
        id: anime.id,
        title: anime.title,
        image: anime.image,
        rating: anime.rating || 'N/A',
        releaseDate: anime.releaseDate || '',
        description: anime.description || '',
        genres: anime.genres || [],
        status: anime.subOrDub || 'Unknown'
      }));

      return {
        results,
        hasNextPage: data.hasNextPage
      };
    } catch (error) {
      console.error('Error fetching trending:', error);
      throw error;
    }
  }

  async getStreamingLinks(episodeId) {
    try {
      console.log('Fetching streaming links for:', episodeId);
      
      const data = await this.makeRequest({
        method: 'get',
        url: `/anime/gogoanime/watch/${episodeId}`
      });

      if (!data || !data.sources) {
        throw new Error('No streaming sources available');
      }

      return {
        sources: data.sources.map(source => ({
          url: source.url,
          quality: source.quality,
          isM3U8: source.url.includes('.m3u8'),
          headers: data.headers || {}
        }))
      };
    } catch (error) {
      console.error('Streaming error:', error);
      throw error;
    }
  }

  async getAnimeInfo(id) {
    try {
      console.log('Fetching anime info for ID:', id);
      
      if (!id) {
        throw new Error('Anime ID is required');
      }

      // Try to get from cache first
      const cacheKey = `animeInfo:${id}`;
      const cachedData = this.cache.get(cacheKey);
      if (cachedData) {
        console.log('Cache hit for anime info:', id);
        return cachedData;
      }

      let animeId = id;
      let data;

      try {
        // First try direct fetch
        data = await this.makeRequest({
          method: 'get',
          url: `/anime/gogoanime/info/${animeId}`
        });
      } catch (error) {
        // If direct fetch fails, try search
        console.log('Direct fetch failed, trying search...');
        const searchResults = await this.searchAnime(id);
        
        if (!searchResults?.results?.length) {
          throw new Error('Anime not found');
        }
        
        animeId = searchResults.results[0].id;
        data = await this.makeRequest({
          method: 'get',
          url: `/anime/gogoanime/info/${animeId}`
        });
      }

      if (!data) {
        throw new Error('Anime not found');
      }

      // Transform the data
      const transformedData = {
        id: data.id,
        title: data.title,
        image: data.image,
        description: data.description || '',
        genres: data.genres || [],
        status: data.status || 'Unknown',
        rating: data.rating || 'N/A',
        episodes: data.episodes?.map(ep => ({
          id: ep.id,
          number: ep.number,
          title: ep.title || `Episode ${ep.number}`
        })) || []
      };

      // Cache the transformed data
      this.cache.set(cacheKey, transformedData);

      return transformedData;
    } catch (error) {
      console.error('Error fetching anime info:', error);
      if (error.response?.status === 404 || error.message.includes('not found')) {
        const notFoundError = new Error('Anime not found');
        notFoundError.status = 404;
        throw notFoundError;
      }
      throw error;
    }
  }
}

module.exports = new AnimeService();