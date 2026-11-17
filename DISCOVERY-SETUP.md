# Homepage discovery and appointment calendar preview

The homepage now includes a Google map, city suggestions, matching practice cards and a link to the full finder. The map uses the existing shared Google map engine. Without a key/confirmed coordinates it displays a clearly labelled Google Maps search embed; it does not claim that Google's own search results equal Norbu's directory entries. Configured maps can display all matching directory points and clusters. See MAPS-SETUP.md for the pending key and coordinate setup. No PDOK bulk export has been performed.

City suggestions come from the existing practitioner `clinic` values. They require no Google Places key and do not transmit typed city searches to an autocomplete service. They support mouse selection, arrow keys, Enter, Escape and the native city dropdown. The main finder search still accepts free text for names and approaches. The Hague can match the directory's Den Haag label.

The appointment calendars on the homepage and profiles are explicitly **design previews**. Dates/dots/time buttons illustrate a possible layout, not real practice availability. Sample time buttons are disabled; no booking, reservation or appointment request is submitted. The original 1,806 records contain no appointment times or calendar URLs. Actual calendar integration has not been chosen: external calendars versus practice-managed slots remains a product decision. Real availability must not be enabled by relabelling these sample times.

Validation covers city suggestions (keyboard/mouse/dropdown/reset), homepage map city filtering/profile selection, preview month navigation and disabled sample times, real profile context, responsive layouts at 1440/1024/390/320 pixels, and shared navigation across all 14 pages.
