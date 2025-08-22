/**
 * Fetches the user's current geolocation coordinates.
 * Wraps the browser's Geolocation API in a Promise for easier async/await usage.
 */
export const fetchGeolocation = (): Promise<{
  latitude: number;
  longitude: number;
}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(error.message));
        }
      );
    }
  });
};

/**
 * --- UPDATED: Now uses the Geoapify API for better reliability ---
 * Fetches the pincode for a given latitude and longitude.
 * Includes a 10-second timeout.
 * @param latitude - The latitude coordinate.
 * @param longitude - The longitude coordinate.
 * @returns The pincode as a string, or null if not found or if the request fails/times out.
 */
export const fetchPincode = async (
  latitude: number,
  longitude: number
): Promise<string | null> => {
  // Retrieve the API key from environment variables
  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

  if (!apiKey) {
    console.error(
      "Geoapify API key is missing. Please check your .env.local file."
    );
    // Fail gracefully so the form isn't completely blocked
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${apiKey}`,
      {
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Geoapify API failed with status: ${response.status}`);
    }

    const data = await response.json();

    // Geoapify's response structure is different. The pincode is in features[0].properties.postcode
    if (
      data.features &&
      data.features.length > 0 &&
      data.features[0].properties.postcode
    ) {
      return data.features[0].properties.postcode;
    } else {
      console.warn("Pincode not found in Geoapify API response:", data);
      return null;
    }
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      console.error(
        "Error fetching pincode from Geoapify: The request timed out."
      );
    } else {
      console.error("Error fetching pincode from Geoapify:", error);
    }

    return null;
  }
};
