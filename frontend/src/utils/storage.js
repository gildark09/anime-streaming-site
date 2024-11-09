const FAVORITES_KEY = 'favorites'
const WATCH_HISTORY_KEY = 'watchHistory'
const MAX_HISTORY_ITEMS = 10 // Limit history items

export const storage = {
  getFavorites() {
    try {
      const favorites = localStorage.getItem(FAVORITES_KEY)
      return favorites ? JSON.parse(favorites) : []
    } catch (error) {
      console.error('Error getting favorites from localStorage:', error)
      return []
    }
  },

  saveFavorites(favorites) {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
      return true
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error)
      return false
    }
  },

  addFavorite(anime) {
    try {
      const favorites = this.getFavorites()
      if (!favorites.find(f => f.id === anime.id)) {
        favorites.push(anime)
        this.saveFavorites(favorites)
      }
      return true
    } catch (error) {
      console.error('Error adding favorite:', error)
      return false
    }
  },

  removeFavorite(animeId) {
    try {
      const favorites = this.getFavorites()
      const updatedFavorites = favorites.filter(f => f.id !== animeId)
      this.saveFavorites(updatedFavorites)
      return true
    } catch (error) {
      console.error('Error removing favorite:', error)
      return false
    }
  },

  clearFavorites() {
    try {
      localStorage.removeItem(FAVORITES_KEY)
      return true
    } catch (error) {
      console.error('Error clearing favorites:', error)
      return false
    }
  },

  checkStorageAvailability() {
    try {
      const testKey = '__storage_test__'
      localStorage.setItem(testKey, testKey)
      localStorage.removeItem(testKey)
      return true
    } catch (e) {
      return false
    }
  },

  isAvailable() {
    return this.checkStorageAvailability()
  },

  // Watch History Methods
  getWatchHistory() {
    try {
      const history = localStorage.getItem(WATCH_HISTORY_KEY)
      return history ? JSON.parse(history) : []
    } catch (error) {
      console.error('Error getting watch history:', error)
      return []
    }
  },

  addToWatchHistory(anime) {
    try {
      let history = this.getWatchHistory()
      
      // Handle both MAL and Gogoanime IDs
      const animeId = anime.mal_id || anime.id
      
      // Remove if already exists (to move it to top)
      history = history.filter(item => (item.mal_id || item.id) !== animeId)
      
      // Add to beginning of array with normalized ID
      history.unshift({
        ...anime,
        id: animeId, // Ensure we always have an id property
        mal_id: anime.mal_id, // Keep MAL ID if it exists
        lastWatched: new Date().toISOString()
      })

      // Limit the history size
      if (history.length > MAX_HISTORY_ITEMS) {
        history = history.slice(0, MAX_HISTORY_ITEMS)
      }

      localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(history))
      return true
    } catch (error) {
      console.error('Error adding to watch history:', error)
      return false
    }
  },

  clearWatchHistory() {
    try {
      localStorage.removeItem(WATCH_HISTORY_KEY)
      return true
    } catch (error) {
      console.error('Error clearing watch history:', error)
      return false
    }
  }
} 