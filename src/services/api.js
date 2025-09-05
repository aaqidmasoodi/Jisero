class ApiService {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  async translate(text, targetLang = 'en', service = null) {
    try {
      const response = await fetch(`${this.baseURL}/api/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLang,
          service
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Translation API error:', error);
      throw error;
    }
  }

  async detectLanguage(text, service = null) {
    try {
      const response = await fetch(`${this.baseURL}/api/detect-language`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          service
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.language;
    } catch (error) {
      console.error('Language detection API error:', error);
      return 'en';
    }
  }

  async getUsage() {
    try {
      const response = await fetch(`${this.baseURL}/api/usage`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Usage API error:', error);
      return null;
    }
  }
}

// Create global instance
window.apiService = new ApiService();
