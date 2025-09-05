class TranslationController {
  constructor(translationService) {
    this.translationService = translationService;
  }

  async translate(req, res) {
    try {
      const { text, targetLang = 'en', service } = req.body;

      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }

      const result = await this.translationService.translate(text, targetLang, service);
      res.json(result);
    } catch (error) {
      console.error('Translation error:', error);
      res.status(500).json({ 
        error: 'Translation failed',
        message: error.message 
      });
    }
  }

  async detectLanguage(req, res) {
    try {
      const { text, service } = req.body;

      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }

      const language = await this.translationService.detectLanguage(text, service);
      res.json({ language });
    } catch (error) {
      console.error('Language detection error:', error);
      res.status(500).json({ 
        error: 'Language detection failed',
        message: error.message 
      });
    }
  }

  async getUsage(req, res) {
    try {
      const usage = await this.translationService.getUsage();
      res.json(usage);
    } catch (error) {
      console.error('Usage check error:', error);
      res.status(500).json({ 
        error: 'Could not fetch usage data',
        message: error.message 
      });
    }
  }
}

module.exports = TranslationController;
