const axios = require('axios');
const NodeCache = require('node-cache');

class AnimeService {
  constructor() {
    this.cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache
    this.consumetClient = axios.create({
      baseURL: 'https://api.consumet.org',
      timeout: 5000
    });
  }

  // Get cache key
  getCacheKey(config) {
    return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
  }

  async getTrending(limit = 20) {
    try {
      const response = await axios.get(`https://api.consumet.org/anime/gogoanime/top-airing`, {
        params: { page: 1, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trending:', error);
      throw error;
    }
  }

  async searchAnime(query) {
    try {
      const response = await axios.get(`https://api.consumet.org/anime/gogoanime/${query}`);
      return response.data;
    } catch (error) {
      console.error('Error searching anime:', error);
      throw error;
    }
  }

  async getAnimeInfo(id) {
    try {
      const response = await axios.get(`https://api.consumet.org/anime/gogoanime/info/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching anime info:', error);
      throw error;
    }
  }

  async getStreamingLinks(episodeId) {
    try {
      const response = await axios.get(`https://api.consumet.org/anime/gogoanime/watch/${episodeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching streaming links:', error);
      throw error;
    }
  }

  async testConsumetConnection() {
    try {
      const response = await axios.get('https://api.consumet.org/anime/gogoanime/top-airing');
      return {
        status: 'ok',
        data: response.data
      };
    } catch (error) {
      throw new Error('Failed to connect to Consumet API');
    }
  }

  async healthCheck() {
    return {
      status: 'ok',
      consumet: await this.testConsumetConnection()
    };
  }
}

// Create and export a single instance
const animeService = new AnimeService();
module.exports = animeService;