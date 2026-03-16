/**
 * Sanitizes image URLs to prevent Mixed Content errors and handles local development leftovers.
 * @param {string} url - The image URL from the database
 * @param {string} fallback - The fallback image URL (dicebear, etc)
 * @returns {string} - A safe, production-ready URL
 */
export const sanitizeImageUrl = (url, fallback = "https://api.dicebear.com/7.x/avataaars/svg?seed=Cooli") => {
  if (!url) return fallback;
  
  // If it's a localhost URL and we are NOT in development, it will definitely fail.
  // We check for "localhost" to block it in production.
  if (url.includes("localhost:5000") && !window.location.hostname.includes("localhost")) {
    return fallback;
  }

  // Ensure it's HTTPS if possible (Cloudinary is always HTTPS if requested so)
  if (url.startsWith("http://") && !url.includes("localhost")) {
     return url.replace("http://", "https://");
  }

  return url;
};
