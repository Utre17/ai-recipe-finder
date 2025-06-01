import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - Raw HTML string
 * @param options - DOMPurify configuration options
 * @returns Sanitized HTML string safe for rendering
 */
export const sanitizeHtml = (html: string, options?: DOMPurify.Config): string => {
  // Default safe configuration for recipe content
  const defaultConfig: DOMPurify.Config = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'i', 'b', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
    FORCE_BODY: true,
  };

  const config = options ? { ...defaultConfig, ...options } : defaultConfig;
  
  return DOMPurify.sanitize(html, config as DOMPurify.Config & {PARSER_MEDIA_TYPE?: DOMParserSupportedType});
};

/**
 * Strips all HTML tags and returns plain text
 * @param html - Raw HTML string
 * @returns Plain text content
 */
export const stripHtml = (html: string): string => {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
};

/**
 * Sanitizes HTML for recipe instructions with safe formatting
 * @param html - Raw HTML string
 * @returns Sanitized HTML with basic formatting preserved
 */
export const sanitizeRecipeContent = (html: string): string => {
  return sanitizeHtml(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ol', 'ul', 'li'],
    ALLOWED_ATTR: [],
  });
}; 