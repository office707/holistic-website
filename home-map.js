(() => {
  const root = document.getElementById('explore-map');
  if (!root) return;
  const profiles = window.norbuPractitioners || [];
  const city = document.getElementById('home-map-city');
  const counts = new Map();
  profiles.forEach((profile) => { if (profile.clinic) counts.set(profile.clinic, (counts.get(profile.clinic) || 0) + 1); });
  [...counts.keys()].sort((a,b)=>a.localeCompare(b)).forEach((name) => {
    const option = document.createElement('option'); option.value = name; option.textContent = `${name} (${counts.get(name)})`; city.append(option);
  });
  let matches = profiles, selected = null;
  const list = document.getElementById('home-map-practices');
  const preview = document.getElementById('finder-map-preview');
  const iframe = document.getElementById('directory-map');
  const publish = () => window.dispatchEvent(new CustomEvent('norbu:directory', { detail: { profiles: matches, selectedId: selected?.id || null } }));
  const text = (tag, value) => { const element = document.createElement(tag); element.textContent = value; return element; };
  const renderCards = () => {
    list.replaceChildren();
    const shown = selected && !matches.slice(0,3).includes(selected) ? [selected, ...matches.filter((profile)=>profile !== selected).slice(0,2)] : matches.slice(0,3);
    shown.forEach((profile) => {
      const article = document.createElement('article'); article.className = 'home-map-card';
      if (selected?.id === profile.id) article.classList.add('is-selected');
      const info = document.createElement('div'); info.append(text('span', profile.clinic), text('h3', profile.name), text('p', profile.practiceName || profile.specialty));
      const button = text('button', 'Show on map →'); button.type='button'; button.addEventListener('click',()=>select(profile));
      const link = text('a','View profile'); link.href=`practitioner-detail.html?id=${encodeURIComponent(profile.id)}`;
      const actions = document.createElement('div'); actions.className='home-map-card-actions'; actions.append(button,link);
      article.append(info,actions); list.append(article);
    });
  };
  const select = (profile) => {
    selected = profile;
    document.getElementById('directory-name').textContent=profile.name;
    document.getElementById('directory-specialty').textContent=`${profile.practiceName || profile.specialty} · ${profile.clinic}`;
    document.getElementById('directory-profile-link').href=`practitioner-detail.html?id=${encodeURIComponent(profile.id)}`;
    document.getElementById('directory-map-link').href=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.locationQuery || profile.clinic)}`;
    iframe.src=`https://www.google.com/maps?q=${encodeURIComponent(profile.locationQuery || profile.clinic)}&z=13&output=embed`;
    preview.hidden=false;renderCards();publish();
    window.dispatchEvent(new CustomEvent('norbu:focus-practice', { detail: { id: profile.id } }));
  };
  const filter = () => {
    matches = city.value === 'all' ? profiles : profiles.filter((profile)=>profile.clinic===city.value);
    selected=null;preview.hidden=true;
    document.getElementById('home-map-results-count').textContent=`${matches.length.toLocaleString('en-GB')} profiles`;
    const href='practitioners.html'+(city.value==='all'?'':`?city=${encodeURIComponent(city.value)}`);
    document.getElementById('home-map-all-link').href=href;document.getElementById('home-map-more-link').href=href;
    const query=`acupuncture ${city.value==='all'?'Netherlands':city.value}`;
    iframe.src=`https://www.google.com/maps?q=${encodeURIComponent(query)}&z=${city.value==='all'?7:12}&output=embed`;
    renderCards();publish();
  };
  city.addEventListener('change',filter);
  root.querySelector('.finder-preview-close').addEventListener('click',()=>{preview.hidden=true;});
  window.addEventListener('norbu:select-practitioner',(event)=>{const profile=matches.find((item)=>item.id===event.detail.id);if(profile)select(profile);});
  filter();
})();
