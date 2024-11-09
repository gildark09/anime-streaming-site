const axios = require('axios');
const NodeCache = require('node-cache');

class AnimeService {
  constructor() {
    this.cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache
    this.baseURL = 'https://api.consumet.org/anime/gogoanime';
  }

  async getTrending(limit = 20) {
    try {
      const response = await axios.get(`${this.baseURL}/top-airing`, {
        params: { page: 1, limit }
      });
      
      // Add error checking and default values
      if (!response || !response.data) {
        throw new Error('Invalid response from Consumet API');
      }

      return {
        results: response.data.results || [],
        hasNextPage: response.data.hasNextPage || false,
        currentPage: response.data.currentPage || 1,
        totalPages: response.data.totalPages || 1
      };
    } catch (error) {
      console.error('Error fetching trending:', error);
      // Return empty results instead of throwing
      return {
        results: [],
        hasNextPage: false,
        currentPage: 1,
        totalPages: 1
      };
    }
  }

  async searchAnime(query, page = 1) {
    try {
      const response = await axios.get(`${this.baseURL}/${query}`, {
        params: { page }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching anime:', error);
      throw new Error('Failed to search anime');
    }
  }

  async getAnimeInfo(id) {
    try {
      const response = await axios.get(`${this.baseURL}/info/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching anime info:', error);
      throw new Error('Failed to fetch anime info');
    }
  }

  async getStreamingLinks(episodeId) {
    try {
      const response = await axios.get(`${this.baseURL}/watch/${episodeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching streaming links:', error);
      throw new Error('Failed to fetch streaming links');
    }
  }

  async testConsumetConnection() {
    try {
      const response = await axios.get(`${this.baseURL}/top-airing`);
      return {
        status: 'ok',
        data: response.data
      };
    } catch (error) {
      console.error('Failed to connect to Consumet:', error);
      throw new Error('Failed to connect to Consumet API');
    }
  }

  async healthCheck() {
    try {
      const consumet = await this.testConsumetConnection();
      return {
        status: 'ok',
        consumet
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }
}

// Create and export a single instance
const animeService = new AnimeService();
module.exports = animeService;