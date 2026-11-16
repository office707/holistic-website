(() => {
  const root = document.querySelector('.compass-home');
  if (!root) return;
  const profiles = window.norbuPractitioners || [];
  const cities = new Set(profiles.map((item) => item.clinic?.trim()).filter(Boolean));
  const format = (value) => new Intl.NumberFormat('en-GB').format(value);
  if (profiles.length) {
    root.querySelectorAll('[data-profile-count]').forEach((node) => { node.textContent = format(profiles.length); });
    root.querySelectorAll('[data-count-key]').forEach((node) => {
      const total = node.dataset.countKey === 'profiles' ? profiles.length : cities.size;
      node.dataset.countTarget = String(total);
      node.textContent = format(total);
    });
  }
  const featured = [
    ['ines-van-binsbergen-delft-t-nieuwe-punt', 'home-ines.jpg'],
    ['berline-geluk-peter-hellevoetsluis-a-touch-of-qi', 'home-berline.jpg'],
    ['felix-de-haas-voorburg-aaemc', 'home-felix.jpg'],
  ];
  const grid = document.getElementById('home-practices');
  const node = (tag, className, content) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.textContent = content;
    return element;
  };
  featured.forEach(([id, photo]) => {
    const profile = profiles.find((item) => item.id === id);
    if (!profile) return;
    const article = node('article', 'compass-practice-card');
    const picture = node('div', 'compass-practice-photo');
    const img = node('img');
    img.src = photo;
    img.alt = `Photo supplied by ${profile.name}'s source listing`;
    img.loading = 'lazy';
    img.width = 600;
    img.height = 460;
    picture.append(img);
    const body = node('div', 'compass-practice-body');
    body.append(node('span', 'compass-practice-city', profile.clinic), node('h3', '', profile.name), node('p', '', profile.practiceName));
    const tags = node('div', 'compass-practice-tags');
    (profile.therapies || [profile.specialty]).slice(0, 3).filter(Boolean).forEach((therapy) => tags.append(node('span', '', therapy)));
    const link = node('a', 'compass-text-link', 'Get to know this practice →');
    link.href = `practitioner-detail.html?id=${encodeURIComponent(profile.id)}`;
    body.append(tags, link);
    article.append(picture, body);
    grid.append(article);
  });
  if (!grid.children.length) {
    const link = node('a', 'compass-text-link', 'Explore practice profiles →');
    link.href = 'practitioners.html';
    grid.append(link);
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = document.getElementById('home-motion-toggle');
  let paused = reduced.matches;
  let frame = 0;
  let lastY = 0;
  const activeAnimations = new Set();
  const animate = (element, keyframes, timing) => {
    if (paused || reduced.matches || !element?.animate) return;
    const animation = element.animate(keyframes, timing);
    activeAnimations.add(animation);
    animation.finished.then(() => activeAnimations.delete(animation)).catch(() => activeAnimations.delete(animation));
    return animation;
  };
  const updateMotion = () => {
    document.body.dataset.homeMotion = paused || reduced.matches ? 'off' : 'on';
    motionButton.textContent = reduced.matches ? 'Reduced motion enabled' : paused ? 'Resume animation' : 'Pause animation';
    motionButton.disabled = reduced.matches;
    motionButton.setAttribute('aria-pressed', String(paused || reduced.matches));
    if (paused || reduced.matches) {
      activeAnimations.forEach((animation) => animation.cancel());
      cancelAnimationFrame(frame);
      frame = 0;
      document.querySelector('.compass-hero-photo').style.transform = '';
    }
  };
  updateMotion();
  motionButton.addEventListener('click', () => { paused = !paused; updateMotion(); });
  reduced.addEventListener('change', () => { paused = reduced.matches; updateMotion(); });

  root.querySelectorAll('.compass-hero-copy > *, .compass-hero h1 > *').forEach((element, index) => {
    animate(element, [{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'translateY(0)' }], {
      duration: 900, delay: Math.min(index * 70, 550), easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards',
    });
  });
  animate(root.querySelector('.compass-hero-art'), [{ opacity: 0, clipPath: 'inset(0 0 100% 0 round 24px)' }, { opacity: 1, clipPath: 'inset(0 0 0 0 round 0)' }], { duration: 1200, delay: 150, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });

  const steps = [
    { label: '01 / Explore', icon: '⌖', title: 'Your search starts with you.', copy: 'Enter a city or therapy in the finder. Compare the list with the map, or use the quiz to find a search direction.', link: 'practitioners.html', action: 'Start exploring →' },
    { label: '02 / Compare', icon: '◎', title: 'Look beyond a name.', copy: 'Read the listed approaches, practice background and source information. Compare the details that matter to you and check qualifications with the practice.', link: 'practitioners.html', action: 'Meet the practices →' },
    { label: '03 / Connect', icon: '→', title: 'Make the next step yours.', copy: 'Open the practice’s website or Google Maps to check details, read available reviews and contact the practice directly about an appointment.', link: 'practitioners.html', action: 'Find a practice →' },
  ];
  root.querySelectorAll('[data-home-step]').forEach((button) => button.addEventListener('click', () => {
    const step = steps[Number(button.dataset.homeStep)];
    root.querySelectorAll('[data-home-step]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    document.getElementById('home-step-label').textContent = step.label;
    document.getElementById('home-step-icon').textContent = step.icon;
    document.getElementById('home-step-title').textContent = step.title;
    document.getElementById('home-step-copy').textContent = step.copy;
    const link = document.getElementById('home-step-link');
    link.textContent = step.action;
    link.href = step.link;
    root.querySelectorAll('.compass-step-stage > :not(.compass-stage-decoration)').forEach((element, index) => {
      animate(element, [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 500, delay: index * 35, easing: 'cubic-bezier(.16,1,.3,1)' });
    });
  }));

  if (!('IntersectionObserver' in window)) return;
  const reveal = new IntersectionObserver((entries) => entries.forEach(({ target, isIntersecting }) => {
    if (!isIntersecting) return;
    animate(target, [{ opacity: 0, transform: 'translateY(56px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 950, easing: 'cubic-bezier(.16,1,.3,1)' });
    target.querySelectorAll('.compass-therapy-card, .compass-practice-card, .compass-city-links a').forEach((card, index) => {
      animate(card, [{ opacity: 0, transform: 'translateY(40px) rotate(1deg)' }, { opacity: 1, transform: 'translateY(0) rotate(0)' }], { duration: 800, delay: index * 100, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
    });
    reveal.unobserve(target);
  }), { threshold: 0.1 });
  root.querySelectorAll('[data-home-reveal]').forEach((element) => reveal.observe(element));

  const heroVisibility = new IntersectionObserver(([entry]) => {
    document.body.classList.toggle('home-motion-out-of-view', !entry.isIntersecting);
  });
  heroVisibility.observe(root.querySelector('.compass-hero'));
  window.addEventListener('scroll', () => {
    if (paused || reduced.matches || document.body.classList.contains('home-motion-out-of-view')) return;
    lastY = scrollY;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      root.querySelector('.compass-hero-photo').style.transform = `scale(1.06) translateY(${Math.min(lastY * 0.045, 18)}px)`;
      frame = 0;
    });
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      activeAnimations.forEach((animation) => animation.cancel());
      document.body.classList.add('home-motion-out-of-view');
    } else {
      const rect = root.querySelector('.compass-hero').getBoundingClientRect();
      document.body.classList.toggle('home-motion-out-of-view', rect.bottom < 0 || rect.top > innerHeight);
    }
  });
})();
