// Suggestions from listed cities; does not send typed text to an external API.
(() => {
  const counts = new Map();
  (window.norbuPractitioners || []).forEach((profile) => {
    if (profile.clinic) counts.set(profile.clinic, (counts.get(profile.clinic) || 0) + 1);
  });
  const normalize = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const all = [...counts.keys()];
  document.querySelectorAll('[data-city-picker]').forEach((root) => {
    const input = root.querySelector('input');
    const list = root.querySelector('[role=listbox]');
    const status = root.querySelector('[role=status]');
    const target = document.getElementById(root.dataset.cityTarget);
    if (!input || !list || !target) return;
    const freeText = root.hasAttribute('data-city-free-text');
    let suggestions = [], active = -1, lastChosen = '';
    const close = () => {
      list.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      active = -1;
    };
    const choose = (city) => {
      input.value = city;
      lastChosen = city;
      target.value = city;
      target.dispatchEvent(new Event('change', { bubbles: true }));
      if (freeText) input.dispatchEvent(new Event('input', { bubbles: true }));
      close();
      status.textContent = `${city} selected`;
    };
    const render = () => {
      const query = normalize(input.value);
      const terms = (city) => normalize(city) + (/^(den haag|'s-gravenhage)$/i.test(city) ? ' the hague' : '');
      suggestions = all.filter((city) => !query || terms(city).includes(query)).sort((a,b) => {
        const aPrefix = normalize(a).startsWith(query), bPrefix = normalize(b).startsWith(query);
        return Number(bPrefix) - Number(aPrefix) || counts.get(b) - counts.get(a) || a.localeCompare(b);
      }).slice(0,8);
      list.replaceChildren(); active = -1;
      suggestions.forEach((city, index) => {
        const item = document.createElement('li');
        item.id = `${list.id}-${index}`;
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', 'false');
        const name = document.createElement('strong'); name.textContent = city;
        const count = document.createElement('span'); count.textContent = `${counts.get(city)} listed profiles`;
        item.append(name, count);
        item.addEventListener('mousedown', (event) => event.preventDefault());
        item.addEventListener('click', () => choose(city));
        list.append(item);
      });
      list.hidden = !suggestions.length;
      input.setAttribute('aria-expanded', String(suggestions.length > 0));
      input.removeAttribute('aria-activedescendant');
      status.textContent = suggestions.length ? `${suggestions.length} city suggestions. Use the arrow keys to choose.` : freeText ? '' : 'No listed city matches. Try another name.';
    };
    input.addEventListener('focus', render);
    input.addEventListener('input', () => {
      if (!input.value.trim() && !freeText) { target.value = 'all'; target.dispatchEvent(new Event('change', { bubbles:true })); }
      render();
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') { close(); return; }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (list.hidden) render();
        if (!suggestions.length) return;
        active = active < 0 ? (event.key === 'ArrowDown' ? 0 : suggestions.length - 1) : (active + (event.key === 'ArrowDown' ? 1 : -1) + suggestions.length) % suggestions.length;
        [...list.children].forEach((item, index) => item.setAttribute('aria-selected', String(index === active)));
        input.setAttribute('aria-activedescendant', list.children[active].id);
        list.children[active].scrollIntoView({block:'nearest'});
      } else if (event.key === 'Enter' && !list.hidden && active >= 0) {
        event.preventDefault(); choose(suggestions[active]);
      }
    });
    input.addEventListener('blur', () => setTimeout(close, 100));
    target.addEventListener('change', () => {
      if (!freeText) input.value = target.value === 'all' ? '' : target.value;
      else if (lastChosen && input.value === lastChosen && target.value !== lastChosen) {
        input.value = ''; lastChosen = ''; input.dispatchEvent(new Event('input', {bubbles:true}));
      }
      close();
    });
    document.getElementById('filter-reset')?.addEventListener('click', () => { input.value = ''; lastChosen = ''; close(); status.textContent = ''; });
    if (!freeText && target.value !== 'all') input.value = target.value;
  });
})();
