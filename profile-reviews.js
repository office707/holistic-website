(() => {
  const status = document.getElementById('google-reviews-status');
  if (!status) return;
  const profiles = window.norbuPractitioners || [];
  const params = new URLSearchParams(location.search);
  const requestedId = params.get('id') || params.get('practitioner');
  const profile = requestedId ? profiles.find((item) => item.id === requestedId) : profiles[0];
  if (!profile) return;
  const key = window.norbuMapsConfig?.apiKey?.trim();
  const placeId = window.norbuGooglePlaces?.[profile.id] || profile.googlePlaceId;
  if (!key || !placeId) return;

  const content = document.getElementById('google-reviews-content');
  const list = document.getElementById('google-review-list');
  const summary = document.getElementById('google-review-rating');
  const googleLink = document.getElementById('profile-google-review-link');
  const safeUrl = (value) => {
    try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; }
    catch { return null; }
  };
  const text = (tag, value, className) => {
    const node = document.createElement(tag);
    node.textContent = value;
    if (className) node.className = className;
    return node;
  };
  const link = (label, uri) => {
    const url = safeUrl(uri);
    if (!url) return text('span', label);
    const node = text('a', label);
    node.href = url;
    node.target = '_blank';
    node.rel = 'noopener noreferrer';
    return node;
  };
  const fail = () => {
    content.hidden = true;
    status.textContent = 'Google reviews could not be loaded. View the practice on Google Maps to check its reviews.';
  };
  status.textContent = 'Loading reviews from Google…';
  const load = async () => {
    try {
      const { Place } = await google.maps.importLibrary('places');
      const place = new Place({ id: placeId });
      await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'googleMapsURI', 'rating', 'userRatingCount', 'reviews', 'attributions'] });
      const mapsUrl = safeUrl(place.googleMapsURI);
      if (mapsUrl) googleLink.href = mapsUrl;
      document.getElementById('google-review-practice').textContent = `Google listing: ${place.displayName || profile.practiceName || profile.name}${place.formattedAddress ? ` · ${place.formattedAddress}` : ''}`;
      if (Number.isFinite(place.rating)) {
        summary.append(text('strong', `${place.rating.toFixed(1)} / 5`));
        summary.append(text('span', Number.isFinite(place.userRatingCount) ? `${place.userRatingCount.toLocaleString()} Google reviews` : 'Google rating'));
      }
      const attributions = document.getElementById('google-review-attributions');
      (place.attributions || []).forEach((item) => attributions.append(link(item.provider || 'Data provider', item.providerURI)));
      (place.reviews || []).slice(0, 5).forEach((review) => {
        const article = document.createElement('article');
        article.className = 'google-review';
        const author = review.authorAttribution;
        article.append(link(author?.displayName || 'Google user', author?.uri));
        const details = [];
        if (Number.isFinite(review.rating)) details.push(`${review.rating} / 5`);
        if (review.relativePublishTimeDescription) details.push(review.relativePublishTimeDescription);
        article.append(text('p', details.join(' · '), 'google-review-meta'));
        if (review.text) article.append(text('p', review.text, 'google-review-text'));
        if (review.googleMapsURI) article.append(link('View review on Google Maps', review.googleMapsURI));
        list.append(article);
      });
      const hasReviews = list.children.length > 0;
      const hasRating = Number.isFinite(place.rating);
      content.hidden = !(hasReviews || hasRating);
      status.textContent = hasReviews ? 'A selection of reviews supplied by Google.'
        : hasRating ? 'Google has a rating for this practice, but returned no review text.'
        : 'Google returned no ratings or reviews for this listing. You can check the latest information on Google Maps.';
    } catch { fail(); }
  };
  window.gm_authFailure = fail;
  if (window.google?.maps?.importLibrary) { load(); return; }
  window.norbuInitReviews = load;
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&callback=norbuInitReviews&v=weekly`;
  script.async = true;
  script.onerror = fail;
  document.head.append(script);
})();
