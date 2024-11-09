const { app, request } = require('./setup')

describe('Anime API Endpoints', () => {
  describe('GET /api/anime/trending', () => {
    it('should return trending anime list', async () => {
      const res = await request(app)
        .get('/api/anime/trending')
        .expect(200)

      expect(res.body).toHaveProperty('results')
      expect(Array.isArray(res.body.results)).toBeTruthy()
    }, 10000)
  })

  describe('GET /api/anime/search/:query', () => {
    it('should search anime by query', async () => {
      const query = 'naruto'
      const res = await request(app)
        .get(`/api/anime/search/${query}`)
        .expect(200)

      expect(res.body).toHaveProperty('results')
      expect(Array.isArray(res.body.results)).toBeTruthy()
    }, 10000)

    it('should handle empty search results', async () => {
      const res = await request(app)
        .get('/api/anime/search/xxxxxxxxxxx')
        .expect(200)

      expect(res.body.results).toEqual([])
    }, 10000)
  })

  describe('GET /api/anime/:id', () => {
    let animeId;

    beforeAll(async () => {
      // Get a valid anime ID first
      const searchRes = await request(app)
        .get('/api/anime/search/naruto')
        .expect(200)
      animeId = searchRes.body.results[0].id
    })

    it('should return anime details', async () => {
      const res = await request(app)
        .get(`/api/anime/${animeId}`)
        .expect(200)

      expect(res.body).toHaveProperty('id')
      expect(res.body).toHaveProperty('title')
    }, 10000)

    it('should handle invalid anime ID', async () => {
      const res = await request(app)
        .get('/api/anime/invalid-id')
        .expect(404)

      expect(res.body).toHaveProperty('error')
    })
  })

  describe('Rate Limiting', () => {
    it('should limit requests when threshold exceeded', async () => {
      const requests = Array(150).fill().map(() => 
        request(app).get('/api/anime/trending')
      )
      
      const responses = await Promise.all(requests)
      const tooManyRequests = responses.some(res => res.status === 429)
      
      expect(tooManyRequests).toBeTruthy()
    }, 30000)
  })
}) 