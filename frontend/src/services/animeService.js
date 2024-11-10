import axios from 'axios';

const API_URL = import.meta.env.DEV 
  ? 'http://localhost:5000/api/anime'
  : import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Increase timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

export default {
  async getTrending(limit = 50) {
    try {
      console.log('Making request to:', `${API_URL}/trending?limit=${limit}`);
      const response = await api.get(`/trending?limit=${limit}`);
      console.log('Frontend service response:', {
        status: response.status,
        hasData: !!response.data,
        results: response.data?.results?.length || 0,
        rawData: response.data
      });
      return response.data;
    } catch (error) {
      console.error('Error in frontend getTrending:', error);
      throw error;
    }
  },

  async getAnimeInfo(id) {
    try {
      console.log('Fetching anime info for ID:', id);
      const response = await api.get(`/info/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching anime info:', error);
      throw error;
    }
  },

  async getStreamingLinks(episodeId) {
    try {
      console.log('Requesting streaming links for:', episodeId);
      const response = await api.get(`/watch/${episodeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching streaming links:', error);
      throw error;
    }
  }
}; 