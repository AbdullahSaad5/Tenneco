// ============================================================================
// Media URL Utility
// ============================================================================

/**
 * Constructs full media URL from API response
 * Handles relative URLs from CMS by prefixing with API base URL
 *
 * @param relativeUrl - The relative or absolute URL from the CMS
 * @returns Full URL or undefined if no URL provided
 *
 * @example
 * getMediaUrl('/api/media/file/image.png')
 * // => 'http://localhost:3001/api/media/file/image.png'
 *
 * getMediaUrl('https://example.com/image.png')
 * // => 'https://example.com/image.png'
 */
export function getMediaUrl(relativeUrl?: string): string | undefined {
  if (!relativeUrl) return undefined;

  // If the URL is already absolute (starts with http:// or https://), return as-is
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }

  // If the URL is relative (starts with /), prefix it with the API base URL
  if (relativeUrl.startsWith('/')) {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';
    return `${apiBaseUrl}${relativeUrl}`;
  }

  // Return as-is for other cases
  return relativeUrl;
}

/**
 * Constructs full media URL from media ID
 * Uses the standard CMS media endpoint format
 *
 * @param mediaId - The media ID from the CMS
 * @returns Full URL to access the media or undefined if no ID provided
 *
 * @example
 * getMediaUrlById('6984bdba74dc408e427908a5')
 * // => 'http://localhost:3001/api/media/6984bdba74dc408e427908a5'
 */
export function getMediaUrlById(mediaId?: string): string | undefined {
  if (!mediaId) return undefined;

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';
  return `${apiBaseUrl}/api/media/${mediaId}`;
}
