(() => {
  if (!document.body.classList.contains('compass-page')) return;
  const main = document.querySelector('main');
  const button = document.getElementById('page-motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches;
  const animations = new Set();
  const syncMotion = () => {
    const off = paused || reduced.matches;
    document.body.dataset.pageMotion = off ? 'off' : 'on';
    button.textContent = reduced.matches ? 'Reduced motion enabled' : paused ? 'Resume animation' : 'Pause animation';
    button.disabled = reduced.matches;
    button.setAttribute('aria-pressed', String(off));
    if (off) animations.forEach((animation) => animation.cancel());
  };
  syncMotion();
  button.addEventListener('click', () => { paused = !paused; syncMotion(); });
  reduced.addEventListener('change', () => { paused = reduced.matches; syncMotion(); });
  const animate = (element, delay = 0) => {
    if (paused || reduced.matches || !element.animate) return;
    const animation = element.animate([
      { opacity: 0, transform: 'translateY(44px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration: 850, delay, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
    animations.add(animation);
    animation.finished.then(() => animations.delete(animation)).catch(() => animations.delete(animation));
  };
  const first = main.querySelector('section');
  if (first) {
    animate(first);
    first.querySelectorAll('h1, .cp-hero-copy > p, .catalog-hero-copy > p, .cp-actions, .profile-hero-copy > p').forEach((element, i) => animate(element, 100 + i * 85));
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      animate(target);
      const cards = target.querySelectorAll('.therapy-card, .blog-card, .cp-value-card, .cp-real-profile, .platform-board-card, .platform-role-card');
      cards.forEach((card, i) => animate(card, Math.min(i * 80, 400)));
      observer.unobserve(target);
    }), { threshold: 0.08 });
    main.querySelectorAll(':scope > section').forEach((section) => {
      // Keep the long, sticky map/results container free of transforms.
      if (section !== first && !section.classList.contains('directory-layout')) observer.observe(section);
    });
  }

  const search = document.getElementById('faq-search');
  if (search) {
    const questions = [...document.querySelectorAll('.cp-faq-item')];
    const filters = [...document.querySelectorAll('[data-faq-filter]')];
    let category = 'all';
    const render = () => {
      const query = search.value.trim().toLowerCase();
      let count = 0;
      questions.forEach((item) => {
        const match = (category === 'all' || item.dataset.faqCategory === category) && (!query || item.textContent.toLowerCase().includes(query));
        item.hidden = !match;
        if (match) count += 1;
      });
      document.getElementById('faq-empty').hidden = count > 0;
      document.getElementById('faq-count').textContent = `${count} ${count === 1 ? 'question' : 'questions'}`;
    };
    filters.forEach((filter) => filter.addEventListener('click', () => {
      category = filter.dataset.faqFilter;
      filters.forEach((item) => item.setAttribute('aria-pressed', String(item === filter)));
      render();
    }));
    search.addEventListener('input', render);
    render();
  }
  const quiz = document.getElementById('quiz-form');
  if (quiz) {
    const steps = [...quiz.querySelectorAll('fieldset')];
    const update = () => {
      const completed = steps.filter((step) => step.querySelector('input:checked')).length;
      document.getElementById('quiz-progress-copy').textContent = `${completed} of ${steps.length} sections completed`;
      document.getElementById('quiz-progress-bar').style.width = `${completed / steps.length * 100}%`;
    };
    quiz.addEventListener('change', update);
    document.getElementById('quiz-reset')?.addEventListener('click', update);
    update();
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) animations.forEach((animation) => animation.cancel());
  });
})();
