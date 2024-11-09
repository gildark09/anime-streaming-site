import axios from 'axios';

const API_URL = 'http://localhost:5000/api/anime';

export default {
  async getTrending(limit = 50) {
    try {
      console.log('Making request to:', `${API_URL}/trending?limit=${limit}`);
      const response = await axios.get(`${API_URL}/trending?limit=${limit}`);
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

  async searchAnime(query, filters = {}) {
    try {
      console.log('Frontend searching for:', query, 'with filters:', filters);
      const response = await axios.get(`${API_URL}/search/${query}`, { params: filters });
      console.log('Search response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Frontend search error:', error);
      throw error;
    }
  },

  async getAnimeInfo(id) {
    try {
      console.log('Fetching anime info for ID:', id)
      
      // Validate ID
      if (!id) {
        throw new Error('Invalid anime ID')
      }
      
      const response = await axios.get(`${API_URL}/${id}`)
      console.log('Anime info response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching anime info:', error)
      throw error
    }
  },

  async getStreamingLinks(episodeId) {
    try {
      console.log('\n=== Frontend Service: getStreamingLinks ===');
      console.log('Backend API URL:', API_URL);
      console.log('Requesting streaming links for:', episodeId);
      
      if (!episodeId.includes('-episode-')) {
        throw new Error('Invalid episode ID format');
      }

      const response = await axios.get(`${API_URL}/watch/${episodeId}`);
      console.log('Backend response:', {
        status: response.status,
        hasData: !!response.data,
        sourcesCount: response.data?.sources?.length,
        firstSource: response.data?.sources?.[0]
      });

      if (!response.data?.sources?.length) {
        throw new Error('No streaming sources available');
      }

      return response.data;
    } catch (error) {
      console.error('Frontend streaming error:', error);
      throw new Error('Failed to load video sources. Please try again later.');
    }
  },

  async getAnimeByFilters(filters) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    const response = await axios.get(`${API_URL}/filter?${params.toString()}`)
    return response.data
  },

  async testStreamingUrl(episodeId) {
    try {
      console.log('\n=== Testing Streaming URL ===');
      console.log('Testing episode:', episodeId);
      
      // First test backend connection
      console.log('Testing backend connection...');
      const testResponse = await axios.get(`${API_URL}/test`);
      console.log('Backend connection:', testResponse.status === 200 ? 'OK' : 'Failed');

      // Then test Consumet connection through backend
      console.log('\nTesting Consumet connection...');
      const consumetTest = await axios.get(`${API_URL}/consumet-test`);
      console.log('Consumet connection:', consumetTest.status === 200 ? 'OK' : 'Failed');

      // Finally test streaming links
      console.log('\nTesting streaming links...');
      const response = await axios.get(`${API_URL}/watch/${episodeId}`);
      console.log('Streaming response:', {
        status: response.status,
        hasData: !!response.data,
        sourcesCount: response.data?.sources?.length,
        firstSource: response.data?.sources?.[0]
      });

      return response.data;
    } catch (error) {
      console.error('Test failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method
        }
      });
      throw error;
    }
  }
}; 