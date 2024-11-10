const axios = require('axios');

async function checkRegionAccess() {
  try {
    const response = await axios.get('https://ipapi.co/json/');
    const country = response.data.country_code;
    
    // Add restricted countries here
    const restrictedCountries = ['XX', 'YY'];
    
    return !restrictedCountries.includes(country);
  } catch (error) {
    console.error('Error checking region:', error);
    return true; // Allow access on error
  }
}

module.exports = { checkRegionAccess };
