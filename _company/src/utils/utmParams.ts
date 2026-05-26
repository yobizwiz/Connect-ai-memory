/**
 * @fileoverview Extracts and validates UTM parameters from the current URL.
 * Must be used client-side only as it relies on browser URL object.
 */

// Key UTM parameters we care about for risk tracking
export interface UtmParameters {
  source?: string; // e.g., facebook, google
  medium?: string; // e.g., cpc, organic
  campaign?: string; // e.g., spring_sale, q1_audit
  content?: string; // specific content identifier
}

/**
 * Extracts UTM parameters from the browser's current URL search query.
 * @returns {UtmParameters} An object containing detected UTM values.
 */
export const getUtmParams = (): UtmParameters | null => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    
    const params: UtmParameters = {};

    // Check for specific, required parameters first
    if (urlParams.has('utm_source')) {
      params.source = urlParams.get('utm_source') || null;
    }
    if (urlParams.has('utm_medium')) {
      params.medium = urlParams.get('utm_medium') || null;
    }
    if (urlParams.has('utm_campaign')) {
      params.campaign = urlParams.get('utm_campaign') || null;
    }
    // Add other necessary parameters if required later (e.g., utm_content)

    // Simple validation: Ensure at least one key parameter was found
    if (!params.source && !params.medium && !params.campaign) {
      console.warn("⚠️ UTM Parameters not found in URL. Proceeding with default risk analysis.");
      return null;
    }
    
    return params;

  } catch (error) {
    // This catches issues if window or URLSearchParams is unavailable (e.g., server-side rendering context)
    console.error("Error reading UTM parameters:", error);
    return null;
  }
};