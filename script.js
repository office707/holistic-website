const menuShell = document.getElementById('site-shell');
const menuToggle = document.getElementById('menu-toggle');
const siteNav = document.getElementById('site-nav');

if (menuShell && menuToggle && siteNav) {
  const closeMenu = () => {
    menuShell.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = menuShell.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (event) => {
    if (!menuShell.contains(event.target)) {
      closeMenu();
    }
  });
}

const themeButtons = Array.from(document.querySelectorAll('.hero-theme-dot'));
const siteBody = document.body;

if (siteBody) {
  const storageKey = 'home-theme-choice';
  const fallbackThemes = ['dusk', 'sage', 'terracotta'];
  const buttonThemes = themeButtons.map((button) => button.dataset.themeChoice).filter(Boolean);
  const availableThemes = new Set(buttonThemes.length ? buttonThemes : fallbackThemes);
  const defaultTheme = siteBody.dataset.siteTheme || buttonThemes[0] || fallbackThemes[0];
  let storedTheme = null;

  try {
    storedTheme = window.localStorage.getItem(storageKey);
  } catch (error) {
    storedTheme = null;
  }

  const applySiteTheme = (themeName) => {
    const nextTheme = availableThemes.has(themeName) ? themeName : defaultTheme;
    siteBody.dataset.siteTheme = nextTheme;

    themeButtons.forEach((button) => {
      const isActive = button.dataset.themeChoice === nextTheme;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    try {
      window.localStorage.setItem(storageKey, nextTheme);
    } catch (error) {
      /* Ignore storage failures and keep the current in-memory theme. */
    }
  };

  applySiteTheme(availableThemes.has(storedTheme) ? storedTheme : defaultTheme);

  themeButtons.forEach((button) => {
    button.addEventListener('click', () => applySiteTheme(button.dataset.themeChoice));
  });
}

const roleLoginTriggers = Array.from(document.querySelectorAll('[data-role-login-trigger]'));

if (siteBody && roleLoginTriggers.length) {
  const currentRole = siteBody.dataset.portalRole || '';
  const roleOptions = [
    {
      id: 'admin',
      href: 'platform.html',
      label: 'Admin',
      eyebrow: 'Operations',
      icon: '▣',
      description: 'Manage roles, approvals, and internal operations across the protected areas.',
      bullets: [
        'Approvals, access, and system oversight',
        'The main control area for the platform team',
      ],
    },
    {
      id: 'user',
      href: 'user-dashboard.html',
      label: 'User',
      eyebrow: 'Personal space',
      icon: '◎',
      description: 'A calm private area for journaling, appointments, personal details, and guided resources.',
      bullets: [
        'Private journal entries and progress notes',
        'Appointments, resources, and personal details',
      ],
    },
    {
      id: 'doctor',
      href: 'doctor-dashboard.html',
      label: 'Doctor',
      eyebrow: 'Clinical area',
      icon: '◌',
      description: 'A focused workspace for daily sessions, patient context, clinical notes, and follow-up steps.',
      bullets: [
        'Today’s schedule and active cases',
        'Documentation, notes, and follow-up actions',
      ],
    },
  ];
  let activeTrigger = null;

  const modal = document.createElement('div');
  modal.className = 'role-login-modal';
  modal.hidden = true;
  modal.innerHTML = `
    <div class="role-login-modal__backdrop" data-role-login-close></div>
    <div class="role-login-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="role-login-title">
      <div class="role-login-modal__header">
        <div>
          <span class="role-login-modal__eyebrow">Protected Areas</span>
          <h2 id="role-login-title">Choose your login area</h2>
          <p>Select the admin dashboard, the user dashboard, or the doctor dashboard.</p>
        </div>
        <button class="role-login-modal__close" type="button" aria-label="Close role selection" data-role-login-close>×</button>
      </div>
      <div class="role-login-modal__grid">
        ${roleOptions.map((option) => {
          const isCurrent = option.id === currentRole;

          return `
            <a
              class="role-login-option role-login-option--${option.id}${isCurrent ? ' is-current' : ''}"
              href="${option.href}"
              ${isCurrent ? 'aria-current="page"' : ''}
            >
              <div class="role-login-option__top">
                <span class="role-login-option__icon" aria-hidden="true">${option.icon}</span>
                <span class="role-login-option__state">${isCurrent ? 'Current' : 'Open'}</span>
              </div>
              <span class="role-login-option__label">${option.eyebrow}</span>
              <h3>${option.label}</h3>
              <p>${option.description}</p>
              <ul>
                ${option.bullets.map((bullet) => `<li>${bullet}</li>`).join('')}
              </ul>
            </a>
          `;
        }).join('')}
      </div>
    </div>
  `;

  siteBody.appendChild(modal);

  const dialog = modal.querySelector('.role-login-modal__dialog');

  const getFocusableElements = () => Array.from(
    modal.querySelectorAll('a[href], button:not([disabled])'),
  );

  const closeRoleLoginModal = () => {
    modal.hidden = true;
    siteBody.classList.remove('has-role-login-open');

    if (activeTrigger) {
      activeTrigger.focus();
    }
  };

  const openRoleLoginModal = (trigger) => {
    activeTrigger = trigger;
    modal.hidden = false;
    siteBody.classList.add('has-role-login-open');
    window.requestAnimationFrame(() => {
      getFocusableElements()[0]?.focus();
    });
  };

  roleLoginTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openRoleLoginModal(trigger);
    });
  });

  modal.addEventListener('click', (event) => {
    if (event.target.closest('[data-role-login-close]')) {
      closeRoleLoginModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (modal.hidden) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeRoleLoginModal();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusable = getFocusableElements();
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!first || !last) {
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  dialog.addEventListener('click', (event) => {
    event.stopPropagation();
  });
}

const cards = Array.from(document.querySelectorAll('.directory-card'));
const searchInput = document.getElementById('filter-search');
const specialtyFilter = document.getElementById('filter-specialty');
const locationFilter = document.getElementById('filter-location');
const availabilityFilter = document.getElementById('filter-availability');
const resetButton = document.getElementById('filter-reset');
const resultsCopy = document.getElementById('directory-results-copy');
const mapFrame = document.getElementById('directory-map');
const mapLink = document.getElementById('directory-map-link');
const nameField = document.getElementById('directory-name');
const specialtyField = document.getElementById('directory-specialty');
const bioField = document.getElementById('directory-bio');
const reviewSummary = document.getElementById('directory-review-summary');

if (
  cards.length &&
  searchInput &&
  specialtyFilter &&
  locationFilter &&
  availabilityFilter &&
  resetButton &&
  resultsCopy &&
  mapFrame &&
  mapLink &&
  nameField &&
  specialtyField &&
  bioField
) {
  const reviewStorageKey = 'aurea-demo-reviews-en';
  const buildEmbedUrl = (query) => `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=13&output=embed`;
  const buildMapsUrl = (query) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  const getPractitionerReviews = (practitionerName) => {
    try {
      const reviews = JSON.parse(window.localStorage.getItem(reviewStorageKey) || '[]');
      return Array.isArray(reviews) ? reviews.filter((review) => review.practitioner === practitionerName) : [];
    } catch (error) {
      return [];
    }
  };

  const renderPractitionerRating = (card) => {
    const reviews = getPractitionerReviews(card.dataset.name);
    const existingBadge = card.querySelector('.directory-card-rating');

    if (!reviews.length) {
      existingBadge?.remove();
      return;
    }

    const average = reviews.reduce((total, review) => total + Number(review.rating), 0) / reviews.length;
    const badge = existingBadge || document.createElement('div');
    badge.className = 'directory-card-rating';
    badge.textContent = `${average.toFixed(1)} ★ · ${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}`;

    if (!existingBadge) {
      card.querySelector('.directory-card-body')?.appendChild(badge);
    }
  };

  const setActiveCard = (card) => {
    cards.forEach((item) => {
      const active = item === card;
      item.classList.toggle('is-selected', active);
      item.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    if (!card) {
      nameField.textContent = 'No practitioner matches these filters';
      specialtyField.textContent = 'Try a different specialty, location, or availability';
      bioField.textContent = 'Reset the filters to see the full directory again.';
      mapLink.removeAttribute('href');
      mapFrame.src = buildEmbedUrl('Holistic care clinic San Francisco, CA');
      if (reviewSummary) {
        reviewSummary.innerHTML = '<strong>No practitioner selected</strong><span>Select a practitioner to see their feedback summary.</span>';
      }
      return;
    }

    nameField.textContent = card.dataset.name;
    specialtyField.textContent = `${card.dataset.specialty} · ${card.dataset.clinic} · ${card.dataset.availability}`;
    bioField.textContent = card.dataset.bio;
    mapLink.href = buildMapsUrl(card.dataset.locationQuery);
    mapFrame.src = buildEmbedUrl(card.dataset.locationQuery);

    if (reviewSummary) {
      const reviews = getPractitionerReviews(card.dataset.name);

      if (!reviews.length) {
        reviewSummary.innerHTML = '<strong>No practitioner reviews yet</strong><span>Clinic reviews can optionally be connected to this practitioner.</span>';
      } else {
        const average = reviews.reduce((total, review) => total + Number(review.rating), 0) / reviews.length;
        reviewSummary.innerHTML = `<strong>${average.toFixed(1)} ★ from ${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}</strong><span>Feedback connected specifically to ${card.dataset.name}.</span>`;
      }
    }
  };

  const getVisibleCards = () => cards.filter((card) => card.style.display !== 'none');

  const applyFilters = () => {
    const query = searchInput.value.trim().toLowerCase();
    const specialty = specialtyFilter.value;
    const clinic = locationFilter.value;
    const availability = availabilityFilter.value;

    cards.forEach((card) => {
      const haystack = [
        card.dataset.name,
        card.dataset.focus,
        card.dataset.specialty,
        card.dataset.clinic,
      ].join(' ').toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      const matchesSpecialty = specialty === 'all' || card.dataset.specialty === specialty;
      const matchesClinic = clinic === 'all' || card.dataset.clinic === clinic;
      const matchesAvailability = availability === 'all' || card.dataset.availability === availability;
      const visible = matchesQuery && matchesSpecialty && matchesClinic && matchesAvailability;
      card.style.display = visible ? '' : 'none';
    });

    const visibleCards = getVisibleCards();
    resultsCopy.textContent = visibleCards.length === 1 ? 'Showing 1 practitioner' : `Showing ${visibleCards.length} practitioners`;

    const currentActive = document.querySelector('.directory-card.is-selected');
    if (!currentActive || currentActive.style.display === 'none') {
      setActiveCard(visibleCards[0] ?? null);
    }
  };

  cards.forEach((card) => {
    card.addEventListener('click', () => setActiveCard(card));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setActiveCard(card);
      }
    });
  });

  [searchInput, specialtyFilter, locationFilter, availabilityFilter].forEach((control) => {
    control.addEventListener('input', applyFilters);
    control.addEventListener('change', applyFilters);
  });

  resetButton.addEventListener('click', () => {
    searchInput.value = '';
    specialtyFilter.value = 'all';
    locationFilter.value = 'all';
    availabilityFilter.value = 'all';
    applyFilters();
  });

  cards.forEach(renderPractitionerRating);
  applyFilters();
}

const reviewModal = document.getElementById('review-modal');
const reviewForm = document.getElementById('review-form');
const testimonialsList = document.getElementById('testimonials-list');

if (reviewModal && reviewForm && testimonialsList) {
  const reviewStorageKey = 'aurea-demo-reviews-en';
  const openButtons = Array.from(document.querySelectorAll('[data-review-open]'));
  const closeButtons = Array.from(reviewModal.querySelectorAll('[data-review-close]'));
  const reviewName = document.getElementById('review-name');
  const reviewRating = document.getElementById('review-rating');
  const reviewPractitioner = document.getElementById('review-practitioner');
  const reviewMessage = document.getElementById('review-message');
  const reviewStatus = document.getElementById('review-form-status');
  let activeReviewTrigger = null;

  const escapeReviewContent = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

  const loadReviews = () => {
    try {
      const reviews = JSON.parse(window.localStorage.getItem(reviewStorageKey) || '[]');
      return Array.isArray(reviews) ? reviews : [];
    } catch (error) {
      return [];
    }
  };

  const saveReviews = (reviews) => {
    try {
      window.localStorage.setItem(reviewStorageKey, JSON.stringify(reviews));
    } catch (error) {
      /* Keep the submitted review visible for the current session. */
    }
  };

  const formatReviewDate = (dateValue) => new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateValue));

  const renderSubmittedReviews = (reviews) => {
    testimonialsList.querySelectorAll('[data-submitted-review]').forEach((review) => review.remove());

    reviews.forEach((review) => {
      const card = document.createElement('article');
      card.className = 'testimonial-card testimonial-card--submitted';
      card.dataset.submittedReview = review.id;
      card.innerHTML = `
        <div class="testimonial-head">
          <div class="testimonial-person">
            <div class="testimonial-avatar testimonial-avatar--initial" aria-hidden="true">${escapeReviewContent(review.name.charAt(0).toUpperCase())}</div>
            <div>
              <strong>${escapeReviewContent(review.name)}</strong>
              <div class="testimonial-stars">${'★'.repeat(Number(review.rating))}${'☆'.repeat(5 - Number(review.rating))}</div>
              ${review.practitioner ? `<span class="testimonial-practitioner">For ${escapeReviewContent(review.practitioner)}</span>` : '<span class="testimonial-practitioner">Clinic review</span>'}
            </div>
          </div>
          <div class="testimonial-date">${formatReviewDate(review.createdAt)}</div>
        </div>
        <p>${escapeReviewContent(review.message)}</p>
      `;
      testimonialsList.prepend(card);
    });
  };

  const closeReviewModal = () => {
    reviewModal.hidden = true;
    document.body.classList.remove('has-review-modal-open');
    activeReviewTrigger?.focus();
  };

  const openReviewModal = (trigger) => {
    activeReviewTrigger = trigger;
    reviewStatus.textContent = '';
    reviewModal.hidden = false;
    document.body.classList.add('has-review-modal-open');
    window.requestAnimationFrame(() => reviewName.focus());
  };

  openButtons.forEach((button) => button.addEventListener('click', () => openReviewModal(button)));
  closeButtons.forEach((button) => button.addEventListener('click', closeReviewModal));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !reviewModal.hidden) {
      closeReviewModal();
    }
  });

  reviewForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const nextReview = {
      id: `review-${Date.now()}`,
      name: reviewName.value.trim(),
      rating: Number(reviewRating.value),
      practitioner: reviewPractitioner.value,
      message: reviewMessage.value.trim(),
      createdAt: new Date().toISOString(),
    };
    const reviews = [nextReview, ...loadReviews()];
    saveReviews(reviews);
    renderSubmittedReviews(reviews);
    reviewForm.reset();
    reviewStatus.textContent = 'Thank you. Your review has been added.';
    closeReviewModal();
  });

  renderSubmittedReviews(loadReviews());
}

const portalDashboard = document.querySelector('[data-portal-dashboard]');

if (portalDashboard) {
  const journalStorageKey = 'aurea-demo-journal-en';
  const appointmentStorageKey = 'aurea-demo-appointments-en';
  const profileStorageKey = 'aurea-demo-profile-en';

  const journalForm = document.getElementById('journal-form');
  const journalTitle = document.getElementById('journal-title');
  const journalDate = document.getElementById('journal-date');
  const journalMood = document.getElementById('journal-mood');
  const journalPrompt = document.getElementById('journal-prompt');
  const journalText = document.getElementById('journal-text');
  const journalList = document.getElementById('journal-list');
  const journalSubmit = document.getElementById('journal-submit');
  const journalCancelEdit = document.getElementById('journal-cancel-edit');
  const journalEntryCount = document.getElementById('journal-entry-count');

  const appointmentList = document.getElementById('appointment-list');
  const appointmentDetailContent = document.getElementById('appointment-detail-content');
  const appointmentRequestButton = document.getElementById('appointment-request');
  const appointmentRescheduleForm = document.getElementById('appointment-reschedule-form');
  const appointmentDateInput = document.getElementById('appointment-date');
  const appointmentTimeInput = document.getElementById('appointment-time');
  const appointmentCancelReschedule = document.getElementById('appointment-cancel-reschedule');

  const profileName = document.getElementById('profile-name');
  const profileEmail = document.getElementById('profile-email');
  const profilePhone = document.getElementById('profile-phone');
  const profileEmergency = document.getElementById('profile-emergency');
  const profileForm = document.getElementById('profile-form');
  const profileEditToggle = document.getElementById('profile-edit-toggle');
  const profileCancelEdit = document.getElementById('profile-cancel-edit');
  const profileInputName = document.getElementById('profile-input-name');
  const profileInputEmail = document.getElementById('profile-input-email');
  const profileInputPhone = document.getElementById('profile-input-phone');
  const profileInputEmergency = document.getElementById('profile-input-emergency');

  const dashboardJournalTotal = document.getElementById('dashboard-journal-total');
  const dashboardNextAppointment = document.getElementById('dashboard-next-appointment');
  const dashboardNextAppointmentCopy = document.getElementById('dashboard-next-appointment-copy');
  const dashboardLatestMood = document.getElementById('dashboard-latest-mood');
  const progressMonthCount = document.getElementById('progress-month-count');
  const progressTopTag = document.getElementById('progress-top-tag');
  const progressAppointmentCount = document.getElementById('progress-appointment-count');
  const progressTimeline = document.getElementById('progress-timeline');

  const defaultProfile = {
    name: 'Lena Berger',
    email: 'lena.berger@example.com',
    phone: '+49 176 12345678',
    emergency: 'Jonas Berger - +49 171 9876543',
  };

  const defaultJournalEntries = [
    {
      id: 'journal-1',
      title: 'Feeling a little more grounded again',
      date: '2026-05-14',
      mood: 'Grateful',
      prompt: 'What helped me feel grounded today?',
      tags: ['Gratitude', 'Healing'],
      text: 'My walk this morning helped me settle into the day. I noticed my breathing soften as soon as I put my phone away on purpose.',
    },
    {
      id: 'journal-2',
      title: 'A small observation after the appointment',
      date: '2026-05-12',
      mood: 'Clear',
      prompt: 'What does my body need today?',
      tags: ['Reflection', 'Goals'],
      text: 'After the appointment I felt tired, but more internally organized. This week I want to take small pauses seriously instead of waiting until my body has to shout.',
    },
    {
      id: 'journal-3',
      title: 'Naming the tension instead of pushing it away',
      date: '2026-05-09',
      mood: 'Tense',
      prompt: 'What thought needs attention today?',
      tags: ['Stress', 'Reflection'],
      text: 'There was a lot happening today. Just naming the inner tension already made the pressure feel a little smaller. I want to notice what truly helps me between appointments.',
    },
  ];

  const defaultAppointments = [
    {
      id: 'appointment-1',
      title: 'Therapy follow-up',
      practitioner: 'Mira Hansen',
      type: 'Integrative support',
      date: '2026-05-18',
      time: '09:30',
      location: 'Norbu practice room 2',
      status: 'Confirmed',
      note: 'Please leave yourself 15 quiet minutes afterward.',
    },
    {
      id: 'appointment-2',
      title: 'Breathwork and regulation session',
      practitioner: 'Dr. Sofia Neumann',
      type: 'Therapeutic exercise',
      date: '2026-05-24',
      time: '15:00',
      location: 'Video session',
      status: 'Scheduled',
      note: 'The link will be shared by email 24 hours in advance.',
    },
    {
      id: 'appointment-3',
      title: 'Resource planning check-in',
      practitioner: 'Mira Hansen',
      type: 'Short session',
      date: '2026-05-29',
      time: '11:15',
      location: 'Norbu practice room 1',
      status: 'Requested',
      note: 'This appointment is still waiting for confirmation.',
    },
  ];

  const getTodayValue = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    const day = `${now.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDateTime = (dateValue, timeValue = '00:00') => {
    if (!dateValue) {
      return null;
    }

    return new Date(`${dateValue}T${timeValue}:00`);
  };

  const formatDate = (dateValue, options = {}) => {
    const date = parseDateTime(dateValue);

    if (!date || Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      ...options,
    }).format(date);
  };

  const formatDateTime = (dateValue, timeValue) => {
    const date = parseDateTime(dateValue, timeValue);

    if (!date || Number.isNaN(date.getTime())) {
      return `${dateValue} ${timeValue}`;
    }

    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const cloneState = (value) => JSON.parse(JSON.stringify(value));

  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

  const loadState = (storageKey, fallback) => {
    try {
      const raw = window.localStorage.getItem(storageKey);

      if (!raw) {
        return cloneState(fallback);
      }

      return JSON.parse(raw);
    } catch (error) {
      return cloneState(fallback);
    }
  };

  const saveState = (storageKey, value) => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
      /* Ignore demo storage failures. */
    }
  };

  let journalEntries = loadState(journalStorageKey, defaultJournalEntries);
  let appointments = loadState(appointmentStorageKey, defaultAppointments);
  let profile = loadState(profileStorageKey, defaultProfile);
  let editingJournalId = null;
  let selectedAppointmentId = appointments[0]?.id ?? null;
  let reschedulingAppointmentId = null;

  const getSortedJournalEntries = () => (
    [...journalEntries].sort((entryA, entryB) => {
      const timeA = parseDateTime(entryA.date)?.getTime() ?? 0;
      const timeB = parseDateTime(entryB.date)?.getTime() ?? 0;
      return timeB - timeA;
    })
  );

  const getSortedAppointments = () => (
    [...appointments].sort((itemA, itemB) => {
      const timeA = parseDateTime(itemA.date, itemA.time)?.getTime() ?? 0;
      const timeB = parseDateTime(itemB.date, itemB.time)?.getTime() ?? 0;
      return timeA - timeB;
    })
  );

  const resetJournalForm = () => {
    editingJournalId = null;
    journalForm.reset();
    journalDate.value = getTodayValue();
    journalMood.value = 'Calm';
    journalSubmit.textContent = 'Create journal entry';
    journalCancelEdit.hidden = true;
  };

  const fillJournalForm = (entry) => {
    editingJournalId = entry.id;
    journalTitle.value = entry.title;
    journalDate.value = entry.date;
    journalMood.value = entry.mood;
    journalPrompt.value = entry.prompt || '';
    journalText.value = entry.text;

    journalForm.querySelectorAll('input[name="tags"]').forEach((checkbox) => {
      checkbox.checked = entry.tags.includes(checkbox.value);
    });

    journalSubmit.textContent = 'Save entry';
    journalCancelEdit.hidden = false;
    journalForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const closeRescheduleForm = () => {
    reschedulingAppointmentId = null;
    appointmentRescheduleForm.hidden = true;
    appointmentRescheduleForm.reset();
  };

  const openRescheduleForm = (appointment) => {
    reschedulingAppointmentId = appointment.id;
    appointmentRescheduleForm.hidden = false;
    appointmentDateInput.value = appointment.date;
    appointmentTimeInput.value = appointment.time;
    appointmentRescheduleForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const openProfileForm = () => {
    profileForm.hidden = false;
    profileEditToggle.hidden = true;
    profileInputName.value = profile.name;
    profileInputEmail.value = profile.email;
    profileInputPhone.value = profile.phone;
    profileInputEmergency.value = profile.emergency;
  };

  const closeProfileForm = () => {
    profileForm.hidden = true;
    profileEditToggle.hidden = false;
  };

  const renderProfile = () => {
    profileName.textContent = profile.name;
    profileEmail.textContent = profile.email;
    profilePhone.textContent = profile.phone;
    profileEmergency.textContent = profile.emergency || 'Not provided';
  };

  const renderJournalList = () => {
    const entries = getSortedJournalEntries();
    const entryLabel = entries.length === 1 ? '1 entry' : `${entries.length} entries`;

    journalEntryCount.textContent = entryLabel;
    dashboardJournalTotal.textContent = `${entries.length}`;

    if (!entries.length) {
      journalList.innerHTML = `
        <article class="journal-entry journal-entry--empty">
          <strong>No entries yet</strong>
          <p>Start with a first thought, a small observation, or one quiet moment for yourself.</p>
        </article>
      `;
      return;
    }

    journalList.innerHTML = entries.map((entry) => `
      <article class="journal-entry" data-journal-id="${entry.id}">
        <div class="journal-entry-head">
          <div>
            <span class="journal-entry-date">${formatDate(entry.date)}</span>
            <h3>${escapeHtml(entry.title)}</h3>
          </div>
          <span class="journal-entry-mood">${escapeHtml(entry.mood)}</span>
        </div>
        ${entry.prompt ? `<p class="journal-entry-prompt">${escapeHtml(entry.prompt)}</p>` : ''}
        <p class="journal-entry-text">${escapeHtml(entry.text)}</p>
        <div class="journal-entry-footer">
          <div class="journal-entry-tags">
            ${entry.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}
          </div>
          <div class="journal-entry-actions">
            <button type="button" data-journal-action="edit">Edit</button>
            <button type="button" data-journal-action="delete">Delete</button>
          </div>
        </div>
      </article>
    `).join('');
  };

  const renderAppointmentDetail = () => {
    const appointment = appointments.find((item) => item.id === selectedAppointmentId);

    if (!appointment) {
      appointmentDetailContent.innerHTML = `
        <div class="appointment-detail-empty">
          <strong>No appointment selected</strong>
          <p>Select an appointment on the left to see details and next steps.</p>
        </div>
      `;
      return;
    }

    appointmentDetailContent.innerHTML = `
      <article class="appointment-detail-card">
        <span class="appointment-status">${appointment.status}</span>
        <h3>${appointment.title}</h3>
        <p>${appointment.type} with ${appointment.practitioner}</p>
        <dl class="appointment-detail-meta">
          <div><dt>When</dt><dd>${formatDateTime(appointment.date, appointment.time)}</dd></div>
          <div><dt>Location</dt><dd>${appointment.location}</dd></div>
          <div><dt>Note</dt><dd>${appointment.note}</dd></div>
        </dl>
      </article>
    `;
  };

  const renderAppointments = () => {
    const sortedAppointments = getSortedAppointments();
    const activeAppointments = sortedAppointments.filter((item) => item.status !== 'Cancelled');
    const nextAppointment = activeAppointments[0];

    if (!sortedAppointments.length) {
      appointmentList.innerHTML = `
        <article class="appointment-item appointment-item--empty">
          <strong>No appointments yet</strong>
          <p>You can request a new appointment at any time.</p>
        </article>
      `;
      selectedAppointmentId = null;
      dashboardNextAppointment.textContent = 'Not scheduled yet';
      dashboardNextAppointmentCopy.textContent = 'See your upcoming support sessions at a glance.';
      progressAppointmentCount.textContent = '0';
      renderAppointmentDetail();
      return;
    }

    if (!sortedAppointments.some((item) => item.id === selectedAppointmentId)) {
      selectedAppointmentId = sortedAppointments[0].id;
    }

    appointmentList.innerHTML = sortedAppointments.map((appointment) => `
      <article class="appointment-item ${appointment.id === selectedAppointmentId ? 'is-selected' : ''}" data-appointment-id="${appointment.id}">
        <div class="appointment-item-head">
          <div>
            <span class="appointment-status">${appointment.status}</span>
            <h3>${appointment.title}</h3>
          </div>
          <strong>${appointment.time}</strong>
        </div>
        <p>${formatDate(appointment.date)} · ${appointment.practitioner}</p>
        <div class="appointment-item-actions">
          <button type="button" data-appointment-action="view">View</button>
          <button type="button" data-appointment-action="reschedule">Reschedule</button>
          <button type="button" data-appointment-action="cancel">Cancel</button>
        </div>
      </article>
    `).join('');

    dashboardNextAppointment.textContent = nextAppointment ? formatDateTime(nextAppointment.date, nextAppointment.time) : 'Not scheduled yet';
    dashboardNextAppointmentCopy.textContent = nextAppointment
      ? `${nextAppointment.title} with ${nextAppointment.practitioner}`
      : 'There is currently no active appointment.';
    progressAppointmentCount.textContent = `${activeAppointments.length}`;

    renderAppointmentDetail();
  };

  const renderProgress = () => {
    const sortedEntries = getSortedJournalEntries();
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const entriesThisMonth = sortedEntries.filter((entry) => {
      const date = parseDateTime(entry.date);
      return date && date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });

    const tagCounter = sortedEntries.reduce((counter, entry) => {
      entry.tags.forEach((tag) => {
        counter[tag] = (counter[tag] ?? 0) + 1;
      });
      return counter;
    }, {});

    const topTagEntry = Object.entries(tagCounter).sort((entryA, entryB) => entryB[1] - entryA[1])[0];
    const latestEntry = sortedEntries[0];

    progressMonthCount.textContent = `${entriesThisMonth.length}`;
    progressTopTag.textContent = topTagEntry ? topTagEntry[0] : 'Not set yet';
    dashboardLatestMood.textContent = latestEntry ? latestEntry.mood : 'No entry yet';

    if (!sortedEntries.length) {
      progressTimeline.innerHTML = `
        <article class="timeline-item timeline-item--empty">
          <strong>Your timeline will begin with the first entry.</strong>
        </article>
      `;
      return;
    }

    progressTimeline.innerHTML = sortedEntries.slice(0, 4).map((entry) => `
      <article class="timeline-item">
        <div class="timeline-item-head">
          <strong>${escapeHtml(entry.mood)}</strong>
          <span>${formatDate(entry.date, { month: 'short', day: '2-digit' })}</span>
        </div>
        <p>${escapeHtml(entry.title)}</p>
      </article>
    `).join('');
  };

  const persistAndRender = () => {
    saveState(journalStorageKey, journalEntries);
    saveState(appointmentStorageKey, appointments);
    saveState(profileStorageKey, profile);
    renderProfile();
    renderJournalList();
    renderAppointments();
    renderProgress();
  };

  journalForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const tags = Array.from(journalForm.querySelectorAll('input[name="tags"]:checked')).map((checkbox) => checkbox.value);
    const nextEntry = {
      id: editingJournalId ?? `journal-${Date.now()}`,
      title: journalTitle.value.trim(),
      date: journalDate.value,
      mood: journalMood.value,
      prompt: journalPrompt.value,
      tags,
      text: journalText.value.trim(),
    };

    if (editingJournalId) {
      journalEntries = journalEntries.map((entry) => (entry.id === editingJournalId ? nextEntry : entry));
    } else {
      journalEntries = [nextEntry, ...journalEntries];
    }

    persistAndRender();
    resetJournalForm();
  });

  journalCancelEdit.addEventListener('click', resetJournalForm);

  journalList.addEventListener('click', (event) => {
    const actionButton = event.target.closest('[data-journal-action]');
    const entryElement = event.target.closest('[data-journal-id]');

    if (!actionButton || !entryElement) {
      return;
    }

    const entry = journalEntries.find((item) => item.id === entryElement.dataset.journalId);

    if (!entry) {
      return;
    }

    if (actionButton.dataset.journalAction === 'edit') {
      fillJournalForm(entry);
      return;
    }

    journalEntries = journalEntries.filter((item) => item.id !== entry.id);

    if (editingJournalId === entry.id) {
      resetJournalForm();
    }

    persistAndRender();
  });

  appointmentList.addEventListener('click', (event) => {
    const actionButton = event.target.closest('[data-appointment-action]');
    const appointmentElement = event.target.closest('[data-appointment-id]');

    if (!appointmentElement) {
      return;
    }

    const appointment = appointments.find((item) => item.id === appointmentElement.dataset.appointmentId);

    if (!appointment) {
      return;
    }

    selectedAppointmentId = appointment.id;

    if (!actionButton || actionButton.dataset.appointmentAction === 'view') {
      renderAppointments();
      return;
    }

    if (actionButton.dataset.appointmentAction === 'reschedule') {
      openRescheduleForm(appointment);
      renderAppointments();
      return;
    }

    if (actionButton.dataset.appointmentAction === 'cancel') {
      appointments = appointments.map((item) => (
        item.id === appointment.id
          ? { ...item, status: 'Cancelled', note: 'This appointment was cancelled in the demo dashboard.' }
          : item
      ));

      if (reschedulingAppointmentId === appointment.id) {
        closeRescheduleForm();
      }

      persistAndRender();
    }
  });

  appointmentRescheduleForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!reschedulingAppointmentId) {
      return;
    }

    appointments = appointments.map((item) => (
      item.id === reschedulingAppointmentId
        ? {
            ...item,
            date: appointmentDateInput.value,
            time: appointmentTimeInput.value,
            status: 'Reschedule requested',
            note: 'A new preferred time was saved for the clinic to review.',
          }
        : item
    ));

    selectedAppointmentId = reschedulingAppointmentId;
    closeRescheduleForm();
    persistAndRender();
  });

  appointmentCancelReschedule.addEventListener('click', closeRescheduleForm);

  appointmentRequestButton.addEventListener('click', () => {
    const baseDate = parseDateTime(getTodayValue()) ?? new Date();
    baseDate.setDate(baseDate.getDate() + 10);

    const year = baseDate.getFullYear();
    const month = `${baseDate.getMonth() + 1}`.padStart(2, '0');
    const day = `${baseDate.getDate()}`.padStart(2, '0');
    const requestedDate = `${year}-${month}-${day}`;

    const requestedAppointment = {
      id: `appointment-${Date.now()}`,
      title: 'New appointment request',
      practitioner: 'Norbu Team',
      type: 'Request',
      date: requestedDate,
      time: '10:00',
      location: 'To be confirmed',
      status: 'Requested',
      note: 'The clinic is reviewing suitable times and will follow up with a confirmation.',
    };

    appointments = [...appointments, requestedAppointment];
    selectedAppointmentId = requestedAppointment.id;
    persistAndRender();
  });

  profileEditToggle.addEventListener('click', openProfileForm);
  profileCancelEdit.addEventListener('click', closeProfileForm);

  profileForm.addEventListener('submit', (event) => {
    event.preventDefault();

    profile = {
      name: profileInputName.value.trim(),
      email: profileInputEmail.value.trim(),
      phone: profileInputPhone.value.trim(),
      emergency: profileInputEmergency.value.trim(),
    };

    closeProfileForm();
    persistAndRender();
  });

  resetJournalForm();
  closeProfileForm();
  closeRescheduleForm();
  persistAndRender();
}

const doctorJournalList = document.getElementById('doctor-journal-list');
const doctorJournalCount = document.getElementById('doctor-journal-count');
const doctorJournalPatientName = document.getElementById('doctor-journal-patient-name');

if (doctorJournalList && doctorJournalCount && doctorJournalPatientName) {
  const journalStorageKey = 'aurea-demo-journal-en';
  const profileStorageKey = 'aurea-demo-profile-en';
  const defaultProfile = { name: 'Lena Berger' };
  const defaultJournalEntries = [
    {
      id: 'journal-1',
      title: 'Feeling a little more grounded again',
      date: '2026-05-14',
      mood: 'Grateful',
      prompt: 'What helped me feel grounded today?',
      tags: ['Gratitude', 'Healing'],
      text: 'My walk this morning helped me settle into the day. I noticed my breathing soften as soon as I put my phone away on purpose.',
    },
    {
      id: 'journal-2',
      title: 'A small observation after the appointment',
      date: '2026-05-12',
      mood: 'Clear',
      prompt: 'What does my body need today?',
      tags: ['Reflection', 'Goals'],
      text: 'After the appointment I felt tired, but more internally organized. This week I want to take small pauses seriously instead of waiting until my body has to shout.',
    },
    {
      id: 'journal-3',
      title: 'Naming the tension instead of pushing it away',
      date: '2026-05-09',
      mood: 'Tense',
      prompt: 'What thought needs attention today?',
      tags: ['Stress', 'Reflection'],
      text: 'There was a lot happening today. Just naming the inner tension already made the pressure feel a little smaller. I want to notice what truly helps me between appointments.',
    },
  ];

  const escapeClinicalContent = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

  const loadClinicalState = (storageKey, fallback) => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(storageKey) || 'null');
      return stored ?? fallback;
    } catch (error) {
      return fallback;
    }
  };

  const formatClinicalDate = (dateValue) => new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${dateValue}T00:00:00`));

  const profile = loadClinicalState(profileStorageKey, defaultProfile);
  const journalEntries = loadClinicalState(journalStorageKey, defaultJournalEntries)
    .slice()
    .sort((entryA, entryB) => String(entryB.date).localeCompare(String(entryA.date)));

  doctorJournalPatientName.textContent = profile.name || defaultProfile.name;
  doctorJournalCount.textContent = journalEntries.length === 1 ? '1 entry' : `${journalEntries.length} entries`;

  if (!journalEntries.length) {
    doctorJournalList.innerHTML = `
      <article class="journal-entry journal-entry--empty">
        <strong>No patient journal entries yet</strong>
        <p>New observations will appear here after the patient saves them.</p>
      </article>
    `;
  } else {
    doctorJournalList.innerHTML = journalEntries.map((entry) => `
      <article class="journal-entry journal-entry--clinical">
        <div class="journal-entry-head">
          <div>
            <span class="journal-entry-date">${formatClinicalDate(entry.date)}</span>
            <h3>${escapeClinicalContent(entry.title)}</h3>
          </div>
          <span class="journal-entry-mood">${escapeClinicalContent(entry.mood)}</span>
        </div>
        ${entry.prompt ? `<p class="journal-entry-prompt">${escapeClinicalContent(entry.prompt)}</p>` : ''}
        <p class="journal-entry-text">${escapeClinicalContent(entry.text)}</p>
        <div class="journal-entry-tags">
          ${(entry.tags || []).map((tag) => `<span>${escapeClinicalContent(tag)}</span>`).join('')}
        </div>
      </article>
    `).join('');
  }
}
