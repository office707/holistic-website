# Google Maps overview and profile reviews

## Current activation status

- The selected-practice Google Maps embed works without a browser API key.
- The all-results map implementation is ready, but `maps-config.js` still has an empty key.
- `practitioner-locations.js` has no coordinates yet. No bulk address export has been performed. Explicit data-owner permission to transmit the practitioner addresses to PDOK is pending.
- Profile reviews also need verified Google Place IDs and Places API (New). No review associations are configured.

## Overview map behaviour

The finder publishes **every matching profile**, independent of the ten-item list page. The map clusters nearby points by screen position. Clicking a group zooms in; co-located practices can be selected from a list. Selecting a practice marker changes the list to the correct page and highlights its profile preview. Changing list pages keeps the complete matching map set. Filters update both views.

Only profiles with confirmed coordinates are placed. The map status reports the located count and the full matching count. Missing/incomplete/ambiguous addresses stay in the list with their Google Maps search link; no city-centre points are invented. The provider is Google Maps throughout.

## Coordinate preparation (separate from Google reviews)

The prepared script `scripts/build_practice_locations.py` sends only the street address and postcode components to the public Dutch PDOK Locatieserver/BAG service. It does not send emails, phone numbers or review content. This is an external address export and requires the data owner's explicit permission to use PDOK. Do not run it before that permission is given.

After permission, run from the repository root:

```sh
python3 scripts/build_practice_locations.py --allow-pdok-export
```

It accepts only unique matches with the exact street, postcode, house number and house letter, with no unexpected unit suffix, inside the Netherlands. Unsupported formats and ambiguous matches are left unplaced. Requests are rate-limited and checkpointed to `/tmp/norbu-pdok-address-cache.json`; failed requests are not cached and can be retried. It writes `practitioner-locations.js`, which must then be committed and deployed. The frontend makes no per-visitor geocoding calls. PDOK/BAG attribution is displayed above the Google attribution area.

If PDOK is not authorised, supply verified coordinates from an authorised source in the same `{locations: {profileId: {lat, lng}}}` format instead. Do not use the empty dataset as evidence that no real practice exists at an address.

## Enable the Google overview

1. Create a Google Cloud project with billing and enable **Maps JavaScript API**.
2. Create a browser key restricted to the production HTTP referrers, including `https://norbu-compass.com/*` and the www domain if used, and restrict its API access. Browser keys are public by design; never use an unrestricted server key.
3. Configure the restricted key as `apiKey` in `maps-config.js` and deploy the prepared locations.
4. Configure usage quotas and billing alerts. Budget alerts alone do not cap costs.
5. Test the real domain: national results, city filters, zooming clusters, selecting a marker on another list page, mobile list/map switching, and an API failure. Loading/authentication failures restore the embed.

Geocoding API is not required for this precomputed-coordinate overview. Google Maps usage can still incur charges.

## Google reviews on individual profiles

Enable **Places API (New)** and allow it in the browser key restrictions. Requesting ratings/review fields can incur separate Google Places charges.

Add verified associations in `google-places.js`, keyed by the existing profile ID and valued with its Google Place ID, or supply `googlePlaceId` on the profile record. The planned automatic Google practice matching is a separate unfinished task. Do not match on name alone.

The profile panel shows Google's rating/count and up to five Google-selected reviews, author/provider attribution, listing name/address and source links. Practice-level reviews must not be represented as independently verified reviews of an individual doctor. Missing configuration/data and API failures retain a Google Maps link. No review content is persisted. Check the applicable Google attribution, privacy and terms requirements before activating Places in production.

## Validation

Local Chromium tests with simulated Google Maps and simulated coordinates covered all 1,806 matching profiles, clustering, independence from list pagination, marker selection across list pages, filtering, zero results, group zooming and authentication fallback. Offline address-matching tests covered exact matches, wrong house letters, unexpected units and ambiguous matches; they made no network calls. These tests do not validate real Google access or real practice positions. Those checks remain pending the required key, authorised coordinate source and deployment of confirmed data.
