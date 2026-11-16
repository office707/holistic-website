// Keep a broken remote image from leaving an empty or broken frame.
(() => {
  const fallback = 'image-placeholder.svg';
  const replaceUnavailableImage = (img) => {
    if (!(img instanceof HTMLImageElement) || !img.getAttribute('src')) return;
    if (new URL(img.src, document.baseURI).pathname.endsWith('/' + fallback)) return;
    img.src = fallback;
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
  };
  document.addEventListener('error', (event) => replaceUnavailableImage(event.target), true);
  document.querySelectorAll('img').forEach((img) => {
    if (img.complete && img.naturalWidth === 0) replaceUnavailableImage(img);
  });
})();

// Shared footer housekeeping; anchor navigation works without JavaScript too.
document.querySelectorAll('[data-footer-year]').forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});
