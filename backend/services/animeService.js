const axios = require('axios');
const NodeCache = require('node-cache');

class AnimeService {
  constructor() {
    this.cache = new NodeCache({ stdTTL: 300 });
    this.baseURL = 'https://api.consumet.org/anime/gogoanime';
    this.fallbackURL = 'https://api.consumet.org/anime/zoro';
  }

  async getTrending(limit = 20) {
    try {
      console.log('Trying gogoanime endpoint...');
      let response = await axios.get(`${this.baseURL}/top-airing`, {
        params: { page: 1, limit }
      });
      
      console.log('Gogoanime Response:', {
        status: response.status,
        hasData: !!response.data,
        dataLength: response.data?.results?.length || 0
      });

      if (!response?.data?.results?.length) {
        console.log('No results from top-airing, trying recent episodes...');
        response = await axios.get(`${this.baseURL}/recent-episodes`);
        console.log('Recent Episodes Response:', {
          status: response.status,
          hasData: !!response.data,
          dataLength: response.data?.results?.length || 0
        });
      }

      if (!response?.data?.results?.length) {
        console.log('Trying fallback provider (Zoro)...');
        response = await axios.get(`${this.fallbackURL}/top-airing`, {
          params: { page: 1, limit }
        });
        console.log('Zoro Response:', {
          status: response.status,
          hasData: !!response.data,
          dataLength: response.data?.results?.length || 0
        });
      }

      return {
        results: response.data?.results || [],
        hasNextPage: response.data?.hasNextPage || false,
        currentPage: response.data?.currentPage || 1,
        totalPages: response.data?.totalPages || 1
      };
    } catch (error) {
      console.error('Error fetching trending:', error.message);
      if (error.response) {
        console.error('API Error Response:', {
          status: error.response.status,
          data: error.response.data
        });
      }
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