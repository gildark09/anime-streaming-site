const axios = require('axios');
const BASE_URL = 'http://localhost:5000/api/anime';

async function testEndpoints() {
    try {
        console.log('Testing API endpoints...\n');

        // Test trending
        console.log('1. Testing trending endpoint...');
        const trending = await axios.get(`${BASE_URL}/trending`);
        console.log('✅ Trending endpoint working\n');

        // Test search
        console.log('2. Testing search endpoint...');
        const search = await axios.get(`${BASE_URL}/search/naruto`);
        console.log('✅ Search endpoint working\n');

        // Test anime details
        if (search.data.results && search.data.results.length > 0) {
            const animeId = search.data.results[0].id;
            console.log('3. Testing anime details endpoint...');
            const details = await axios.get(`${BASE_URL}/${animeId}`);
            console.log('✅ Anime details endpoint working\n');
        }

        console.log('All tests completed successfully! 🎉');
    } catch (error) {
        console.error('❌ Error during testing:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Status code:', error.response.status);
        }
    }
}

testEndpoints(); 