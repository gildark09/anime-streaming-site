import { createStore } from 'vuex';
import animeService from '../services/animeService';
import { storage } from '../utils/storage'

export default createStore({
  state: {
    trendingAnime: [],
    searchResults: [],
    currentAnime: null,
    currentEpisode: null,
    streamingLinks: null,
    loading: false,
    error: null,
    filteredAnime: [],
    favorites: storage.getFavorites(),
    watchHistory: JSON.parse(localStorage.getItem('watchHistory') || '[]'),
    searchLoading: false,
    searchError: null
  },
  mutations: {
    SET_TRENDING_ANIME(state, data) {
      console.log('Setting trending data:', data);
      state.trendingAnime = Array.isArray(data.results) ? data.results : [];
      console.log('Updated trending state:', state.trendingAnime);
    },
    SET_SEARCH_RESULTS(state, results) {
      state.searchResults = results;
    },
    SET_CURRENT_ANIME(state, anime) {
      state.currentAnime = anime;
    },
    SET_CURRENT_EPISODE(state, episode) {
      state.currentEpisode = episode;
    },
    SET_STREAMING_LINKS(state, links) {
      state.streamingLinks = links;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_FILTERED_ANIME(state, anime) {
      state.filteredAnime = anime;
    },
    ADD_TO_FAVORITES(state, anime) {
      if (storage.addFavorite(anime)) {
        state.favorites = storage.getFavorites()
      }
    },
    REMOVE_FROM_FAVORITES(state, animeId) {
      if (storage.removeFavorite(animeId)) {
        state.favorites = storage.getFavorites()
      }
    },
    CLEAR_FAVORITES(state) {
      if (storage.clearFavorites()) {
        state.favorites = []
      }
    },
    SET_WATCH_HISTORY(state, history) {
      state.watchHistory = history
    },
    ADD_TO_WATCH_HISTORY(state, episode) {
      state.watchHistory = state.watchHistory.filter(e => e.id !== episode.id)
      
      state.watchHistory.unshift({
        ...episode,
        timestamp: new Date().toISOString(),
        animeId: episode.animeId,
        animeTitle: episode.animeTitle,
        episodeNumber: episode.episodeNumber
      })

      if (state.watchHistory.length > 50) {
        state.watchHistory.pop()
      }

      localStorage.setItem('watchHistory', JSON.stringify(state.watchHistory))
    },
    CLEAR_WATCH_HISTORY(state) {
      state.watchHistory = []
      localStorage.removeItem('watchHistory')
    },
    SET_SEARCH_RESULTS(state, results) {
      state.searchResults = results
    },
    SET_SEARCH_LOADING(state, loading) {
      state.searchLoading = loading
    },
    SET_SEARCH_ERROR(state, error) {
      state.searchError = error
    }
  },
  actions: {
    async fetchTrending({ commit }, { limit = 50 } = {}) {
      try {
        commit('SET_LOADING', true)
        const data = await animeService.getTrending(limit)
        commit('SET_TRENDING_ANIME', data)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async searchAnime({ commit }, { query, filters = {} }) {
      try {
        commit('SET_SEARCH_LOADING', true);
        commit('SET_SEARCH_ERROR', null);
        
        const response = await animeService.searchAnime(query, filters);
        
        if (!response || !response.results) {
          throw new Error('Invalid search response format');
        }

        commit('SET_SEARCH_RESULTS', response.results);
        return response.results;
      } catch (error) {
        console.error('Search error:', error);
        commit('SET_SEARCH_ERROR', error.message || 'Failed to search anime');
        throw error;
      } finally {
        commit('SET_SEARCH_LOADING', false);
      }
    },
    async fetchAnimeDetails({ commit }, id) {
      try {
        commit('SET_LOADING', true);
        const animeInfo = await animeService.getAnimeInfo(id);
        commit('SET_CURRENT_ANIME', animeInfo);
        return animeInfo;
      } catch (error) {
        console.error('Error fetching anime details:', error);
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async fetchEpisode({ commit }, { animeId, episodeId }) {
      try {
        commit('SET_LOADING', true);
        const episode = await animeService.getEpisode(episodeId);
        commit('SET_CURRENT_EPISODE', episode);
        return episode;
      } catch (error) {
        console.error('Error fetching episode:', error);
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async fetchStreamingLinks({ commit }, episodeId) {
      try {
        console.log('=== Store: Fetching Streaming Links ===');
        console.log('Episode ID:', episodeId);
        
        commit('SET_LOADING', true);
        const data = await animeService.getStreamingLinks(episodeId);
        
        console.log('Raw streaming response:', data);
        
        if (!data || !data.sources || !data.sources.length) {
          throw new Error('No streaming sources available in response');
        }
        
        console.log('Streaming links received:', {
          hasData: !!data,
          sources: data?.sources?.length,
          firstSource: data?.sources?.[0]
        });
        
        commit('SET_STREAMING_LINKS', data);
        return data;
      } catch (error) {
        console.error('Store error:', error);
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async fetchFilteredAnime({ commit }, filters) {
      try {
        commit('SET_LOADING', true)
        const data = await animeService.getAnimeByFilters(filters)
        commit('SET_FILTERED_ANIME', data)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    addToFavorites({ commit, state }, anime) {
      if (!state.favorites.find(a => a.id === anime.id)) {
        commit('ADD_TO_FAVORITES', anime)
      }
    },
    removeFromFavorites({ commit }, animeId) {
      commit('REMOVE_FROM_FAVORITES', animeId)
    },
    clearFavorites({ commit }) {
      commit('CLEAR_FAVORITES')
    },
    addToWatchHistory({ commit }, { episode, anime }) {
      if (!anime || !episode) {
        console.error('Missing data for watch history:', { anime, episode });
        return;
      }

      const historyEntry = {
        id: episode.id || `${anime.id}-episode-${episode.number}`,
        animeId: anime.id,
        animeTitle: anime.title,
        episodeNumber: episode.number,
        thumbnail: anime.image || anime.thumbnail,
        watchedAt: new Date().toISOString()
      };

      console.log('Adding to watch history:', historyEntry);
      commit('ADD_TO_WATCH_HISTORY', historyEntry);
    },
    clearWatchHistory({ commit }) {
      commit('CLEAR_WATCH_HISTORY')
    }
  },
  getters: {
    isLoading: state => state.loading,
    hasError: state => state.error !== null,
    getTrendingAnime: state => state.trendingAnime,
    getSearchResults: state => state.searchResults,
    getCurrentAnime: state => state.currentAnime,
    getStreamingLinks: state => state.streamingLinks,
    getFilteredAnime: state => state.filteredAnime,
    isFavorite: state => id => state.favorites.some(anime => anime.id === id),
    getFavorites: state => state.favorites,
    getFavoritesCount: state => state.favorites.length,
    getWatchHistory: state => state.watchHistory
  }
}); 