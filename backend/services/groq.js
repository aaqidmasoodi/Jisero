const axios = require('axios');

class GroqService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.groq.com/openai/v1/chat/completions';
  }

  async translate(text, targetLang = 'en') {
    try {
      const prompt = `Translate the following text to ${targetLang}. Only return the translation, nothing else: "${text}"`;
      
      const response = await axios.post(this.baseURL, {
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        max_completion_tokens: 1024,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        }
      });

      const translatedText = response.data.choices[0]?.message?.content?.trim() || text;

      return {
        translatedText,
        sourceLang: 'auto',
        targetLang: targetLang,
        confidence: 0.90,
        service: 'groq'
      };
    } catch (error) {
      console.error('Groq translation error:', error.response?.data || error.message);
      throw new Error(`Groq translation failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async detectLanguage(text) {
    try {
      const prompt = `Detect the language of this text and return only the ISO 639-1 language code (like 'en', 'es', 'fr', etc.): "${text}"`;
      
      const response = await axios.post(this.baseURL, {
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        max_completion_tokens: 10,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        }
      });

      const langCode = response.data.choices[0]?.message?.content?.trim().toLowerCase() || 'en';
      
      return langCode.length === 2 ? langCode : 'en';
    } catch (error) {
      console.error('Groq language detection error:', error);
      return 'en';
    }
  }
}

module.exports = GroqService;
