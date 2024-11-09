const axios = require('axios');
const CONSUMET_API = 'https://api.consumet.org/anime/gogoanime';

class AnimeService {
  static async getTrending(limit = 20) {
    try {
      const response = await axios.get(`${CONSUMET_API}/top-airing`, {
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
      const response = await axios.get(`${CONSUMET_API}/${query}`);
      return response.data;
    } catch (error) {
      console.error('Error searching anime:', error);
      throw error;
    }
  }

  static async getAnimeInfo(id) {
    try {
      const response = await axios.get(`${CONSUMET_API}/info/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching anime info:', error);
      throw error;
    }
  }

  static async getStreamingLinks(episodeId) {
    try {
      const response = await axios.get(`${CONSUMET_API}/watch/${episodeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching streaming links:', error);
      throw error;
    }
  }
}

module.exports = AnimeService;