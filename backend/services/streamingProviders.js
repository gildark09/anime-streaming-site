const axios = require('axios');

class StreamingProvider {
  constructor(name, baseURL) {
    this.name = name;
    this.api = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  async isAvailable() {
    try {
      await this.api.get('/');
      return true;
    } catch {
      return false;
    }
  }
}

const providers = {
  consumet: new StreamingProvider('Consumet', process.env.CONSUMET_API_URL),
  enime: new StreamingProvider('Enime', process.env.ENIME_API_URL),
  gogoanime: new StreamingProvider('Gogoanime', process.env.GOGOANIME_BASE_URL)
};

module.exports = providers;
