(() => {
  const layout = document.querySelector('.directory-layout');
  if (!layout) return;
  const container = document.getElementById('finder-google-map');
  const fallback = document.getElementById('directory-map').parentElement;
  const status = document.getElementById('finder-map-status');
  const buttons = [...document.querySelectorAll('[data-finder-view][type="button"]')];
  const locationData = window.norbuPracticeLocations || { locations: {} };
  const locations = locationData.locations || {};
  let map;
  let info;
  let markers = [];
  let drawTimer = 0;
  let signature = '';
  let state = { profiles: [], selectedId: null };
  const select = (profile) => window.dispatchEvent(new CustomEvent('norbu:select-practitioner', { detail: { id: profile.id } }));

  buttons.forEach((button) => button.addEventListener('click', () => {
    layout.dataset.finderView = button.dataset.finderView;
    buttons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    if (map) {
      google.maps.event.trigger(map, 'resize');
      fitResults();
    }
  }));
  const clearMarkers = () => {
    markers.forEach(({ marker }) => marker.setMap(null));
    markers = [];
  };
  const showFallback = () => {
    clearTimeout(drawTimer);
    clearMarkers();
    info?.close();
    map = null;
    container.hidden = true;
    fallback.hidden = false;
    status.textContent = 'Showing the selected practice. Open Google Maps for location details.';
  };
  const highlight = () => markers.forEach(({ marker, group }) => {
    const active = group.profiles.some((profile) => profile.id === state.selectedId);
    const cluster = group.profiles.length > 1;
    marker.setZIndex(active ? 100 : 1);
    marker.setIcon({
      path: google.maps.SymbolPath.CIRCLE,
      scale: cluster ? 20 : active ? 13 : 10,
      fillColor: active ? '#194e46' : cluster ? '#e3edda' : '#ffffff',
      fillOpacity: 1, strokeColor: '#194e46', strokeWeight: active ? 3 : 2,
    });
    marker.setLabel(cluster ? { text: String(group.profiles.length), color: active ? '#ffffff' : '#194e46', fontWeight: '700', fontSize: '12px' } : null);
  });
  const showSharedLocation = (group, marker) => {
    const content = document.createElement('div');
    content.className = 'finder-cluster-list';
    const heading = document.createElement('strong');
    heading.textContent = `${group.profiles.length} practices in this area`;
    content.append(heading);
    group.profiles.forEach((profile) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `${profile.name} · ${profile.clinic || ''}`;
      button.addEventListener('click', () => { select(profile); info.close(); });
      content.append(button);
    });
    info.setContent(content);
    info.open({ map, anchor: marker });
  };
  const draw = () => {
    if (!map || !window.norbuClusterPractices) return;
    clearMarkers();
    const groups = window.norbuClusterPractices(state.profiles, locations, map.getZoom() ?? 7);
    groups.forEach((group) => {
      const cluster = group.profiles.length > 1;
      const marker = new google.maps.Marker({
        map, position: { lat: group.lat, lng: group.lng },
        title: cluster ? `${group.profiles.length} practices. Select to explore this area.` : group.profiles[0].name,
        optimized: true,
      });
      marker.addListener('click', () => {
        if (!cluster) { info.close(); select(group.profiles[0]); return; }
        const sameLocation = group.positions.every((position) => Math.abs(position.lat - group.lat) < .00002 && Math.abs(position.lng - group.lng) < .00002);
        if (sameLocation || map.getZoom() >= 18) showSharedLocation(group, marker);
        else { info.close(); map.setCenter({ lat: group.lat, lng: group.lng }); map.setZoom(Math.min(map.getZoom() + 2, 19)); }
      });
      markers.push({ marker, group });
    });
    highlight();
    const placed = groups.reduce((total, group) => total + group.profiles.length, 0);
    status.textContent = !state.profiles.length ? 'No practices match these filters.'
      : `${placed.toLocaleString('en-GB')} of ${state.profiles.length.toLocaleString('en-GB')} matching practices on the map. Select a group to explore.${placed < state.profiles.length ? ' Some listings have no confirmed map position; their Google Maps links remain available.' : ''}`;
  };
  const fitResults = () => {
    if (!map) return;
    const positions = state.profiles.map((profile) => locations[profile.id]).filter((point) => point && Number.isFinite(point.lat) && Number.isFinite(point.lng));
    if (!positions.length) { map.setCenter({ lat: 52.15, lng: 5.3 }); map.setZoom(7); draw(); return; }
    const bounds = new google.maps.LatLngBounds();
    positions.forEach((position) => bounds.extend(position));
    map.fitBounds(bounds, 55);
    if (positions.length === 1) map.setZoom(14);
    draw();
  };
  window.addEventListener('norbu:directory', (event) => {
    state = event.detail;
    const nextSignature = state.profiles.map((profile) => profile.id).join('|');
    if (signature !== nextSignature) {
      signature = nextSignature;
      info?.close();
      fitResults();
    } else highlight();
  });

  const key = window.norbuMapsConfig?.apiKey?.trim();
  if (!key) return;
  window.norbuInitMap = () => {
    container.hidden = false;
    fallback.hidden = true;
    map = new google.maps.Map(container, {
      center: { lat: 52.15, lng: 5.3 }, zoom: 7,
      mapTypeControl: false, streetViewControl: false,
      gestureHandling: 'cooperative', maxZoom: 20,
    });
    info = new google.maps.InfoWindow();
    map.addListener('idle', () => { clearTimeout(drawTimer); drawTimer = setTimeout(draw, 60); });
    const source = document.getElementById('finder-location-source');
    if (source && Object.keys(locations).length) source.hidden = false;
    fitResults();
  };
  window.gm_authFailure = showFallback;
  const loader = document.createElement('script');
  loader.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&callback=norbuInitMap&v=weekly`;
  loader.async = true;
  loader.onerror = showFallback;
  document.head.append(loader);
})();
