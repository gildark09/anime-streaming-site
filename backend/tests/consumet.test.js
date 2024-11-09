const axios = require('axios');
const BASE_URL = process.env.CONSUMET_API_URL || 'http://localhost:3000';

async function testConsumetConnection() {
    try {
        console.log('Testing Consumet API connection...\n');

        // Test if server is running first
        console.log('Checking if Consumet API server is running...');
        try {
            await axios.get(BASE_URL);
        } catch (error) {
            throw new Error(`Consumet API server is not running on ${BASE_URL}. Please start the server first.`);
        }

        // Test root endpoint
        console.log('1. Testing root endpoint...');
        const rootResponse = await axios.get(BASE_URL);
        console.log('Root endpoint:', {
            status: rootResponse.status,
            data: rootResponse.data
        });

        // Test search with a specific anime
        console.log('\n2. Testing search endpoint...');
        const searchResponse = await axios.get(`${BASE_URL}/anime/gogoanime/search/bleach`);
        console.log('Search response:', {
            status: searchResponse.status,
            hasResults: searchResponse.data?.results?.length > 0,
            resultCount: searchResponse.data?.results?.length || 0,
            firstResult: searchResponse.data?.results?.[0]?.title || 'No results'
        });

        // If search successful, test info endpoint
        if (searchResponse.data?.results?.[0]?.id) {
            const animeId = searchResponse.data.results[0].id;
            console.log('\n3. Testing info endpoint with ID:', animeId);
            const infoResponse = await axios.get(`${BASE_URL}/anime/gogoanime/info/${animeId}`);
            console.log('Info response:', {
                status: infoResponse.status,
                title: infoResponse.data?.title,
                episodeCount: infoResponse.data?.episodes?.length || 0
            });

            // Test streaming endpoint if episodes exist
            if (infoResponse.data?.episodes?.[0]?.id) {
                const episodeId = infoResponse.data.episodes[0].id;
                console.log('\n4. Testing streaming endpoint for episode:', episodeId);
                const streamResponse = await axios.get(`${BASE_URL}/anime/gogoanime/watch/${episodeId}`);
                console.log('Streaming response:', {
                    status: streamResponse.status,
                    hasStreams: streamResponse.data?.sources?.length > 0,
                    qualities: streamResponse.data?.sources?.map(s => s.quality)
                });
            }
        }

        return true;
    } catch (error) {
        console.error('\n❌ Test failed:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            endpoint: error.config?.url,
            details: error.cause || 'No additional details'
        });
        
        // Provide helpful instructions
        if (!error.response) {
            console.log('\nTroubleshooting steps:');
            console.log('1. Make sure Consumet API is running: cd api.consumet.org && npm run dev');
            console.log('2. Make sure the port 3000 is not in use');
            console.log('3. Check if .env files are configured correctly');
        }
        
        return false;
    }
}

// Add check for environment
if (!process.env.NODE_ENV) {
    console.log('Warning: NODE_ENV not set, using development settings');
}

// Run the test
console.log(`Starting tests for ${BASE_URL}...`);
testConsumetConnection();