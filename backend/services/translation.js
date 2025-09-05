const DeepLService = require('./deepl');
const GroqService = require('./groq');

class TranslationService {
  constructor(deepLApiKey, groqApiKey) {
    this.deepL = new DeepLService(deepLApiKey);
    this.groq = new GroqService(groqApiKey);
    this.defaultService = 'deepl'; // Prefer DeepL for better quality
  }

  async translate(text, targetLang = 'en', service = null) {
    const selectedService = service || this.defaultService;
    
    try {
      if (selectedService === 'deepl') {
        return await this.deepL.translate(text, targetLang);
      } else if (selectedService === 'groq') {
        return await this.groq.translate(text, targetLang);
      } else {
        throw new Error('Invalid translation service');
      }
    } catch (error) {
      // Fallback to other service if primary fails
      console.log(`${selectedService} failed, trying fallback...`);
      
      if (selectedService === 'deepl') {
        return await this.groq.translate(text, targetLang);
      } else {
        return await this.deepL.translate(text, targetLang);
      }
    }
  }

  async detectLanguage(text, service = null) {
    const selectedService = service || this.defaultService;
    
    try {
      if (selectedService === 'deepl') {
        return await this.deepL.detectLanguage(text);
      } else {
        return await this.groq.detectLanguage(text);
      }
    } catch (error) {
      console.error('Language detection failed:', error);
      return 'en';
    }
  }

  async getUsage() {
    try {
      const deepLUsage = await this.deepL.getUsage();
      return {
        deepl: deepLUsage,
        groq: 'Usage not available'
      };
    } catch (error) {
      return { error: 'Could not fetch usage data' };
    }
  }
}

module.exports = TranslationService;
