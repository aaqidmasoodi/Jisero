// Translation service that communicates with backend
class TranslationManager {
  constructor() {
    this.preferSocket = true; // Prefer socket for real-time, fallback to HTTP
  }

  async translate(text, targetLang = 'en', service = null) {
    try {
      // Try socket first if available and connected
      if (this.preferSocket && window.socketService && window.socketService.connected) {
        return await window.socketService.translate(text, targetLang, service);
      }
      
      // Fallback to HTTP API
      if (window.apiService) {
        return await window.apiService.translate(text, targetLang, service);
      }
      
      throw new Error('No translation service available');
    } catch (error) {
      console.error('Translation failed:', error);
      return {
        translatedText: text,
        sourceLang: 'auto',
        targetLang: targetLang,
        confidence: 0.0,
        error: error.message,
        service: 'fallback'
      };
    }
  }

  async detectLanguage(text, service = null) {
    try {
      // Try socket first if available and connected
      if (this.preferSocket && window.socketService && window.socketService.connected) {
        return await window.socketService.detectLanguage(text, service);
      }
      
      // Fallback to HTTP API
      if (window.apiService) {
        return await window.apiService.detectLanguage(text, service);
      }
      
      throw new Error('No language detection service available');
    } catch (error) {
      console.error('Language detection failed:', error);
      return 'en';
    }
  }

  async getUsage() {
    try {
      if (window.apiService) {
        return await window.apiService.getUsage();
      }
      return null;
    } catch (error) {
      console.error('Usage check failed:', error);
      return null;
    }
  }
}

// Create global instance (replacing the old groqTranslator)
window.translationManager = new TranslationManager();

// For backward compatibility
window.groqTranslator = {
  translate: (text, targetLang) => window.translationManager.translate(text, targetLang),
  detectLanguage: (text) => window.translationManager.detectLanguage(text)
};
