const express = require('express');
const router = express.Router();

function createTranslationRoutes(translationController) {
  // POST /api/translate
  router.post('/translate', (req, res) => {
    translationController.translate(req, res);
  });

  // POST /api/detect-language
  router.post('/detect-language', (req, res) => {
    translationController.detectLanguage(req, res);
  });

  // GET /api/usage
  router.get('/usage', (req, res) => {
    translationController.getUsage(req, res);
  });

  return router;
}

module.exports = createTranslationRoutes;
