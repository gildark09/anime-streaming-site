const axios = require('axios');
const NodeCache = require('node-cache');

class AnimeService {
  constructor() {
    this.cache = new NodeCache({ stdTTL: 300 });
    this.baseURL = 'https://api.consumet.org/meta/anilist';
  }

  async getTrending(limit = 20) {
    try {
      console.log('Fetching trending from AniList...');
      
      const response = await axios.get(`${this.baseURL}/trending`, {
        params: {
          page: 1,
          perPage: limit,
          provider: 'gogoanime'
        }
      });

      console.log('AniList Response:', {
        status: response.status,
        hasData: !!response.data,
        dataLength: response.data?.results?.length || 0,
        firstItem: response.data?.results?.[0]
      });

      if (!response?.data?.results?.length) {
        // Try popular as fallback
        console.log('Trying popular anime...');
        const popularResponse = await axios.get(`${this.baseURL}/popular`, {
          params: {
            page: 1,
            perPage: limit,
            provider: 'gogoanime'
          }
        });

        if (popularResponse?.data?.results?.length) {
          return {
            results: popularResponse.data.results,
            hasNextPage: popularResponse.data.hasNextPage || false,
            currentPage: popularResponse.data.currentPage || 1,
            totalPages: popularResponse.data.totalPages || 1
          };
        }
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
        console.error('API Error Details:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
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