require('dotenv').config();
const AnimeService = require('../services/animeService');

async function testStreamingLinks() {
    console.log('🎬 Testing Streaming Links...\n');

    const testCases = [
        { id: '21', title: 'One Piece', episode: '1' },
        { id: '1735', title: 'Naruto: Shippuden', episode: '1' },
        { id: '54857', title: 'Re:Zero Season 3', episode: '1' }
    ];

    for (const test of testCases) {
        console.log(`\n🔍 Testing: ${test.title}`);
        try {
            const episodeId = `${test.id}-episode-${test.episode}`;
            const links = await AnimeService.getStreamingLinks(episodeId);
            
            console.log('Sources found:', links.sources.length);
            console.log('Available qualities:', links.sources.map(s => s.quality));
            console.log('First source:', {
                quality: links.sources[0].quality,
                isM3U8: links.sources[0].isM3U8,
                hasUrl: !!links.sources[0].url
            });
            
            console.log('✅ Test passed');
        } catch (error) {
            console.error('❌ Test failed:', error.message);
        }
    }
}

testStreamingLinks(); 