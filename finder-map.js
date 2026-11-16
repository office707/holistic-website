(() => {
  const layout = document.querySelector('.directory-layout');
  if (!layout) return;
  const buttons = [...document.querySelectorAll('[data-finder-view][type="button"]')];
  buttons.forEach((button) => button.addEventListener('click', () => {
    layout.dataset.finderView = button.dataset.finderView;
    buttons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    if (map) google.maps.event.trigger(map, 'resize');
  }));

  const container = document.getElementById('finder-google-map');
  const fallback = document.getElementById('directory-map').parentElement;
  const status = document.getElementById('finder-map-status');
  let map;
  let geocoder;
  let state = { profiles: [], selectedId: null };
  let generation = 0;
  let running = false;
  let markers = [];
  // Session-only results avoid repeated requests while selecting a visible profile.
  const locations = new Map();
  const failures = new Set();
  const showFallback = () => {
    generation += 1;
    map = null;
    container.hidden = true;
    fallback.hidden = false;
    status.textContent = 'Showing the selected practice. Open Google Maps for location details.';
  };
  const highlight = () => markers.forEach(({ marker, profile }) => {
    const selected = profile.id === state.selectedId;
    marker.setZIndex(selected ? 100 : 1);
    marker.setIcon({
      path: google.maps.SymbolPath.CIRCLE,
      scale: selected ? 14 : 10,
      fillColor: selected ? '#195764' : '#ffffff',
      fillOpacity: 1, strokeColor: '#195764', strokeWeight: 3,
    });
  });
  const render = async () => {
    if (!map || running) return;
    running = true;
    const version = generation;
    const profiles = state.profiles.slice();
    status.textContent = profiles.length ? 'Locating practices on this results page…' : 'No practices match these filters.';
    // Requests are sequential and limited to the current page (at most ten).
    for (const profile of profiles) {
      if (version !== generation || !map) break;
      if (locations.has(profile.id) || failures.has(profile.id)) continue;
      const address = [profile.address, profile.postalCode, profile.clinic, 'Netherlands'].filter(Boolean).join(', ');
      if (!profile.address || !profile.postalCode) {
        failures.add(profile.id);
        continue; // Do not present a city centre as an exact practice location.
      }
      try {
        const result = await geocoder.geocode({ address, region: 'NL', componentRestrictions: { country: 'NL' } });
        const match = result.results[0];
        if (match && !match.partial_match && ['ROOFTOP', 'RANGE_INTERPOLATED'].includes(match.geometry.location_type)) {
          locations.set(profile.id, match.geometry.location);
        } else failures.add(profile.id);
      } catch { failures.add(profile.id); }
    }
    running = false;
    if (!map) return;
    if (version !== generation) { render(); return; }
    markers.forEach(({ marker }) => marker.setMap(null));
    markers = [];
    const bounds = new google.maps.LatLngBounds();
    profiles.forEach((profile, index) => {
      const position = locations.get(profile.id);
      if (!position) return;
      const marker = new google.maps.Marker({ map, position, title: profile.name, label: String(index + 1) });
      marker.addListener('click', () => window.dispatchEvent(new CustomEvent('norbu:select-practitioner', { detail: { id: profile.id } })));
      markers.push({ marker, profile });
      bounds.extend(position);
    });
    highlight();
    if (markers.length) {
      map.fitBounds(bounds, 55);
      if (markers.length === 1) map.setZoom(14);
    } else { map.setCenter({ lat: 52.15, lng: 5.3 }); map.setZoom(7); }
    status.textContent = `${markers.length} of ${profiles.length} practices on this page located. Select a marker to view its profile.${markers.length < profiles.length ? ' Some addresses could not be placed precisely; use their Google Maps links.' : ''}`;
  };
  window.addEventListener('norbu:directory', (event) => {
    const changed = state.profiles.map((p) => p.id).join('|') !== event.detail.profiles.map((p) => p.id).join('|');
    state = event.detail;
    if (changed) { generation += 1; render(); }
    else highlight();
  });

  const key = window.norbuMapsConfig?.apiKey?.trim();
  if (!key) return;
  window.norbuInitMap = () => {
    map = new google.maps.Map(container, {
      center: { lat: 52.15, lng: 5.3 }, zoom: 7,
      mapTypeControl: false, streetViewControl: false, gestureHandling: 'cooperative',
    });
    geocoder = new google.maps.Geocoder();
    container.hidden = false;
    fallback.hidden = true;
    render();
  };
  window.gm_authFailure = showFallback;
  const loader = document.createElement('script');
  loader.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&callback=norbuInitMap&v=weekly`;
  loader.async = true;
  loader.onerror = showFallback;
  document.head.append(loader);
})();
