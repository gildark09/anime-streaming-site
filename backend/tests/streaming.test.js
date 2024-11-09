const { app, request } = require('./setup');

describe('Streaming API Endpoints', () => {
  let animeId;
  let episodeId;

  beforeAll(async () => {
    // Get a valid anime and episode ID first
    const searchRes = await request(app)
      .get('/api/anime/search/naruto')
      .expect(200);
    
    animeId = searchRes.body.results[0].id;
    
    const animeInfo = await request(app)
      .get(`/api/anime/${animeId}`)
      .expect(200);
    
    episodeId = animeInfo.body.episodes[0].id;
  });

  describe('GET /api/anime/watch/:episodeId', () => {
    it('should return streaming links', async () => {
      const res = await request(app)
        .get(`/api/anime/watch/${episodeId}`)
        .expect(200);

      expect(res.body).toHaveProperty('sources');
      expect(Array.isArray(res.body.sources)).toBeTruthy();
      expect(res.body.sources.length).toBeGreaterThan(0);
      expect(res.body.sources[0]).toHaveProperty('url');
      expect(res.body.sources[0]).toHaveProperty('quality');
    }, 15000);

    it('should handle invalid episode ID', async () => {
      const res = await request(app)
        .get('/api/anime/watch/invalid-episode')
        .expect(404);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/anime/proxy/hls', () => {
    it('should proxy HLS manifest', async () => {
      // Get a valid streaming URL first
      const linksRes = await request(app)
        .get(`/api/anime/watch/${episodeId}`)
        .expect(200);

      const m3u8Url = linksRes.body.sources.find(s => s.isM3U8)?.url;
      if (!m3u8Url) {
        console.log('No HLS source found, skipping test');
        return;
      }

      const res = await request(app)
        .get('/api/anime/proxy/hls')
        .query({ url: m3u8Url })
        .expect(200);

      expect(res.headers['content-type']).toBe('application/vnd.apple.mpegurl');
      expect(res.text).toContain('#EXTM3U');
    }, 15000);

    it('should handle missing URL parameter', async () => {
      const res = await request(app)
        .get('/api/anime/proxy/hls')
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/anime/proxy/ts', () => {
    it('should proxy TS segments', async () => {
      // Get a valid streaming URL first
      const linksRes = await request(app)
        .get(`/api/anime/watch/${episodeId}`)
        .expect(200);

      const m3u8Url = linksRes.body.sources.find(s => s.isM3U8)?.url;
      if (!m3u8Url) {
        console.log('No HLS source found, skipping test');
        return;
      }

      // Get the M3U8 manifest
      const manifestRes = await request(app)
        .get('/api/anime/proxy/hls')
        .query({ url: m3u8Url })
        .expect(200);

      // Extract first TS segment URL
      const tsUrl = manifestRes.text
        .split('\n')
        .find(line => line.endsWith('.ts'));

      if (!tsUrl) {
        console.log('No TS segment found, skipping test');
        return;
      }

      const res = await request(app)
        .get('/api/anime/proxy/ts')
        .query({ url: tsUrl })
        .expect(200);

      expect(res.headers['content-type']).toBe('video/mp2t');
    }, 20000);

    it('should handle missing URL parameter', async () => {
      const res = await request(app)
        .get('/api/anime/proxy/ts')
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });
  });
});

describe('Caching Mechanism', () => {
  it('should cache streaming links', async () => {
    // First request
    const res1 = await request(app)
      .get(`/api/anime/watch/${episodeId}`)
      .expect(200)

    // Second request should be faster due to caching
    const startTime = Date.now()
    const res2 = await request(app)
      .get(`/api/anime/watch/${episodeId}`)
      .expect(200)
    const endTime = Date.now()

    expect(endTime - startTime).toBeLessThan(1000) // Should be fast
    expect(res2.body).toEqual(res1.body)
  }, 15000)
})

describe('Error Handling', () => {
  it('should handle timeout gracefully', async () => {
    const res = await request(app)
      .get('/api/anime/watch/timeout-test')
      .expect(504)

    expect(res.body).toHaveProperty('error')
    expect(res.body.error).toContain('timeout')
  })
}) 