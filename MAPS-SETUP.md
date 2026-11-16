# Finder map setup

The finder works with no API key: selecting a profile updates the Google Maps embed, and mobile visitors can switch between list and map. The embed shows a Google search result; its position is not independently verified by Norbu.

To enable the shared map with clickable markers:

1. Create a Google Cloud project, enable billing, and enable **Maps JavaScript API** and **Geocoding API**.
2. Create a browser API key. Restrict it to the website's exact HTTP referrers (including the www variant if used), and restrict API access to the two APIs above. Browser keys are public by design; never use an unrestricted server key.
3. Enter the restricted key as `apiKey` in `maps-config.js`.
4. Set Google Cloud usage quotas and billing alerts appropriate to the expected traffic.
5. Test the production domain: filter a city, click a marker, switch result pages, and test mobile list/map switching. An API loading or authorization failure restores the embed.

Only addresses on the current results page (at most ten) are geocoded, sequentially. Results are kept in memory for that page session. Records without a street address and postal code, partial matches, and city-level matches do not get exact-location markers. The status below the map reports how many records could be located; all profiles retain a Google Maps search link.

## Validation for this change

Local Chromium checks used all 1,806 existing profiles: ten visible results per page, profile selection, empty search, reset, pagination, mobile view switching, mobile width, and reduced-motion behavior. No browser JavaScript errors occurred. External network requests were blocked in this test environment, so live Google map tiles, production referrer restrictions, and geocoding must be checked after adding a key. The multi-marker integration is prepared but cannot be validated against Google without a configured project.
