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

## Google reviews on individual profiles

`practitioner-detail.html` includes a Google review panel shared by all practitioner profiles. It loads Google's rating, rating count, and up to five Google-selected reviews through the Maps JavaScript **Places Library (New)**. Reviews show author attribution and source links, plus Google's listing name and address so practice-level reviews are not presented as independently verified reviews of a specific doctor. Missing configuration, missing data, and API failures retain a Google Maps link without inventing ratings.

To activate reviews:

1. Enable **Places API (New)** in the Google Cloud project in addition to the APIs used by the finder. Allow it in the browser key's API restrictions. Review Google's current pricing: requesting rating/review fields can incur Places charges separately from map loads.
2. Verify the Google listing for each practitioner, using the practice name, full address, and website. A shared practice listing contains practice reviews; confirm that it is appropriate for that profile.
3. Add the verified association in `google-places.js`, keyed by the existing Norbu profile ID and valued with the Google Place ID. Alternatively an individual practitioner record may supply `googlePlaceId`. There are no verified Place IDs in the supplied dataset; no automatic name-only matching is performed.
4. Configure the restricted browser key in `maps-config.js`. Add the site's public privacy policy and terms links as required by Google's current Maps Platform terms before activating Places in production, and verify Google/provider/author attribution against those terms.
5. Test an actual mapped profile on the approved domain, including its listing identity, Google links, rating and reviews. No rating or review content is persisted by this integration.

Local Chromium tests with mocked Google responses cover no key, no mapping, five-review rendering, safe review text, author/provider attribution, rating-only results, empty results, API failure, JavaScript errors, and mobile overflow. These tests do not validate live Google access or the identity of any practice listing; both require the setup above.
