// Input validation and sanitization utilities
const ValidationUtils = {
  // Sanitize HTML to prevent XSS
  sanitizeHTML: (str) => {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate message content
  isValidMessage: (message) => {
    if (!message || typeof message !== 'string') return false;
    const trimmed = message.trim();
    return trimmed.length > 0 && trimmed.length <= 1000;
  },

  // Validate search term
  isValidSearchTerm: (term) => {
    if (!term || typeof term !== 'string') return true; // Empty search is valid
    return term.length <= 100;
  },

  // Sanitize message for display
  sanitizeMessage: (message) => {
    if (!message) return '';
    return ValidationUtils.sanitizeHTML(message.trim());
  }
};

window.ValidationUtils = ValidationUtils;
