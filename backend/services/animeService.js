const axios = require('axios');
const NodeCache = require('node-cache');

class AnimeService {
  constructor() {
    this.cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache
    this.consumetClient = axios.create({
      baseURL: process.env.CONSUMET_API_URL || 'https://api.consumet.org',
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

  static async getTrending(limit = 20) {
    try {
      const response = await this.consumetClient.get('/anime/gogoanime/top-airing', {
        params: { page: 1, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trending:', error);
      throw error;
    }
  }

  static async searchAnime(query) {
    try {
      const response = await this.consumetClient.get(`/anime/gogoanime/${query}`);
      return response.data;
    } catch (error) {
      console.error('Error searching anime:', error);
      throw error;
    }
  }

  static async getAnimeInfo(id) {
    try {
      const response = await this.consumetClient.get(`/anime/gogoanime/info/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching anime info:', error);
      throw error;
    }
  }

  static async getStreamingLinks(episodeId) {
    try {
      const response = await this.consumetClient.get(`/anime/gogoanime/watch/${episodeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching streaming links:', error);
      throw error;
    }
  }
}

module.exports = AnimeService;