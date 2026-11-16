// Screen-grid clustering for the Google map; keeps dense results selectable.
window.norbuClusterPractices = (profiles, locations, zoom, cellSize = 68) => {
  const scale = 256 * 2 ** zoom;
  const groups = new Map();
  profiles.forEach((profile) => {
    const position = locations[profile.id];
    if (!position || !Number.isFinite(position.lat) || !Number.isFinite(position.lng)) return;
    const latitude = Math.max(-85, Math.min(85, position.lat));
    const sin = Math.sin(latitude * Math.PI / 180);
    const x = (position.lng + 180) / 360 * scale;
    const y = (.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale;
    const key = `${Math.floor(x / cellSize)}:${Math.floor(y / cellSize)}`;
    if (!groups.has(key)) groups.set(key, { profiles: [], positions: [], lat: 0, lng: 0 });
    const group = groups.get(key);
    group.profiles.push(profile);
    group.positions.push({ lat: position.lat, lng: position.lng });
    group.lat += position.lat;
    group.lng += position.lng;
  });
  return [...groups.values()].map((group) => ({ ...group, lat: group.lat / group.profiles.length, lng: group.lng / group.profiles.length }));
};
