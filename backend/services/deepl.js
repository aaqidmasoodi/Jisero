const axios = require('axios');

class DeepLService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api-free.deepl.com/v2';
  }

  async translate(text, targetLang = 'EN', sourceLang = null) {
    try {
      const params = {
        auth_key: this.apiKey,
        text: text,
        target_lang: targetLang.toUpperCase()
      };

      if (sourceLang) {
        params.source_lang = sourceLang.toUpperCase();
      }

      const response = await axios.post(`${this.baseURL}/translate`, null, {
        params: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const translation = response.data.translations[0];
      
      return {
        translatedText: translation.text,
        sourceLang: translation.detected_source_language?.toLowerCase() || sourceLang,
        targetLang: targetLang.toLowerCase(),
        confidence: 0.95,
        service: 'deepl'
      };
    } catch (error) {
      console.error('DeepL translation error:', error.response?.data || error.message);
      throw new Error(`DeepL translation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async detectLanguage(text) {
    // DeepL doesn't have a separate detect endpoint, but translation response includes detected language
    try {
      const result = await this.translate(text, 'EN');
      return result.sourceLang || 'en';
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en';
    }
  }

  async getUsage() {
    try {
      const response = await axios.get(`${this.baseURL}/usage`, {
        params: { auth_key: this.apiKey }
      });
      return response.data;
    } catch (error) {
      console.error('DeepL usage check error:', error);
      return null;
    }
  }
}

module.exports = DeepLService;
