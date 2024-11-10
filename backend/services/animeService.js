const axios = require('axios');
const NodeCache = require('node-cache');

class AnimeService {
  constructor() {
    this.cache = new NodeCache({ stdTTL: 300 });
    // Use environment variable for Consumet API URL
    this.baseURL = process.env.CONSUMET_API_URL || 'http://localhost:3000';
    
    console.log('AnimeService initialized with baseURL:', this.baseURL);
  }

  async getTrending(limit = 20) {
    try {
      console.log('Fetching trending from gogoanime:', `${this.baseURL}/anime/gogoanime/top-airing`);
      
      const response = await axios.get(`${this.baseURL}/anime/gogoanime/top-airing`, {
        params: { page: 1, limit },
        timeout: 30000
      });

      console.log('Gogoanime Response:', {
        status: response.status,
        hasData: !!response.data,
        dataLength: response.data?.results?.length || 0
      });

      return {
        results: response.data?.results || [],
        hasNextPage: response.data?.hasNextPage || false,
        currentPage: response.data?.currentPage || 1,
        totalPages: response.data?.totalPages || 1
      };
    } catch (error) {
      console.error('Error fetching trending from gogoanime:', error.message);
      throw error;
    }
  }

  async getAnimeInfo(id) {
    try {
      console.log('Fetching anime info:', `${this.baseURL}/info/${id}`);
      const response = await axios.get(`${this.baseURL}/info/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching anime info:', error);
      throw error;
    }
  }

  async getStreamingLinks(episodeId) {
    try {
      console.log('Fetching streaming links:', `${this.baseURL}/watch/${episodeId}`);
      const response = await axios.get(`${this.baseURL}/watch/${episodeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching streaming links:', error);
      throw error;
    }
  }
}

// Create and export a single instance
const animeService = new AnimeService();
module.exports = animeService;