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

const siteBody = document.body;

const directoryList = document.getElementById('directory-list');
const practitionersForDirectory = window.norbuPractitioners || [];
const escapeDirectoryHtml = (value) => String(value || '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

if (directoryList && practitionersForDirectory.length) {
  directoryList.innerHTML = practitionersForDirectory.map((practitioner, index) => {
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(practitioner.locationQuery || practitioner.clinic)}`;

    return `
      <article class="directory-card ${index === 0 ? 'is-selected' : ''}" tabindex="0" data-id="${escapeDirectoryHtml(practitioner.id)}" data-name="${escapeDirectoryHtml(practitioner.name)}" data-specialty="${escapeDirectoryHtml(practitioner.specialty)}" data-clinic="${escapeDirectoryHtml(practitioner.clinic)}" data-availability="${escapeDirectoryHtml(practitioner.availability)}" data-location-query="${escapeDirectoryHtml(practitioner.locationQuery)}" data-focus="${escapeDirectoryHtml(practitioner.focus)}" data-bio="${escapeDirectoryHtml(practitioner.bio)}">
        <img src="${escapeDirectoryHtml(practitioner.image)}" alt="${escapeDirectoryHtml(practitioner.name)} portrait">
        <div class="directory-card-body">
          <div class="directory-card-top">
            <span class="practitioner-badge">${escapeDirectoryHtml(practitioner.specialty)}</span>
            <span class="directory-availability">${escapeDirectoryHtml(practitioner.availability)}</span>
          </div>
          <h3>${escapeDirectoryHtml(practitioner.name)}</h3>
          <p>${escapeDirectoryHtml(practitioner.focus)}</p>
          <div class="directory-meta"><span>${escapeDirectoryHtml(practitioner.clinic)}</span><span>${escapeDirectoryHtml(practitioner.experience)} background</span></div>
          <div class="directory-card-actions"><a class="btn btn-secondary" href="practitioner-detail.html?id=${escapeDirectoryHtml(practitioner.id)}">View profile</a><a class="btn btn-primary" href="${mapUrl}" target="_blank" rel="noreferrer">Open Google Maps</a></div>
        </div>
      </article>
    `;
  }).join('');
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
const directoryProfileLink = document.getElementById('directory-profile-link');
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
  const buildEmbedUrl = (query) => `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=12&output=embed`;
  const buildMapsUrl = (query) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  const setActiveCard = (card) => {
    cards.forEach((item) => {
      const active = item === card;
      item.classList.toggle('is-selected', active);
      item.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    if (!card) {
      nameField.textContent = 'No profile matches these filters';
      specialtyField.textContent = 'Try another specialization, city, or listing status';
      bioField.textContent = 'Reset the filters to see the full Netherlands acupuncture directory again.';
      mapLink.removeAttribute('href');
      directoryProfileLink?.removeAttribute('href');
      mapFrame.src = buildEmbedUrl('acupuncture Netherlands');
      if (reviewSummary) {
        reviewSummary.innerHTML = '<strong>No profile selected</strong><span>Select a profile to open the matching Google Maps search.</span>';
      }
      return;
    }

    nameField.textContent = card.dataset.name;
    specialtyField.textContent = `${card.dataset.specialty} - ${card.dataset.clinic} - ${card.dataset.availability}`;
    bioField.textContent = card.dataset.bio;
    mapLink.href = buildMapsUrl(card.dataset.locationQuery);
    if (directoryProfileLink) directoryProfileLink.href = `practitioner-detail.html?id=${card.dataset.id}`;
    mapFrame.src = buildEmbedUrl(card.dataset.locationQuery);

    if (reviewSummary) {
      reviewSummary.innerHTML = '<strong>Google Maps</strong><span>Open Google Maps to check location details and any reviews available on Google.</span>';
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
    resultsCopy.textContent = visibleCards.length === 1 ? 'Showing 1 profile' : `Showing ${visibleCards.length} profiles`;

    const currentActive = document.querySelector('.directory-card.is-selected');
    if (!currentActive || currentActive.style.display === 'none') {
      setActiveCard(visibleCards[0] ?? null);
    }
  };

  cards.forEach((card) => {
    card.addEventListener('click', (event) => {
      if (event.target.closest('a')) return;
      setActiveCard(card);
    });
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

  const directoryParams = new URLSearchParams(window.location.search);
  const presetSpecialty = directoryParams.get('specialty');
  const presetCity = directoryParams.get('city');
  const presetAvailability = directoryParams.get('availability');

  if (presetSpecialty && [...specialtyFilter.options].some((option) => option.value === presetSpecialty)) {
    specialtyFilter.value = presetSpecialty;
  }

  if (presetCity && [...locationFilter.options].some((option) => option.value === presetCity)) {
    locationFilter.value = presetCity;
  }

  if (presetAvailability && [...availabilityFilter.options].some((option) => option.value === presetAvailability)) {
    availabilityFilter.value = presetAvailability;
  }

  applyFilters();
}

const quizForm = document.getElementById('quiz-form');
const quizResult = document.getElementById('quiz-result');

if (quizForm && quizResult) {
  const resultTitle = document.getElementById('quiz-result-title');
  const resultCopy = document.getElementById('quiz-result-copy');
  const resultLink = document.getElementById('quiz-result-link');
  const resetQuiz = document.getElementById('quiz-reset');

  quizForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!quizForm.reportValidity()) return;

    const formData = new FormData(quizForm);
    const specialty = String(formData.get('goal') || '');
    const city = String(formData.get('city') || 'all');
    const availability = String(formData.get('availability') || 'all');
    const params = new URLSearchParams();

    if (specialty) params.set('specialty', specialty);
    if (city !== 'all') params.set('city', city);
    if (availability !== 'all') params.set('availability', availability);

    if (resultTitle) resultTitle.textContent = specialty || 'Start with the finder';
    if (resultCopy) {
      const cityCopy = city === 'all' ? 'all listed cities' : city;
      const statusCopy = availability === 'all' ? 'all listing statuses' : availability.toLowerCase();
      resultCopy.textContent = `Start by browsing ${specialty} profiles in ${cityCopy} with ${statusCopy}. This is only a search direction, not a medical recommendation.`;
    }
    if (resultLink) resultLink.href = `practitioners.html?${params.toString()}`;

    quizResult.hidden = false;
    quizResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  resetQuiz?.addEventListener('click', () => {
    quizForm.reset();
    quizResult.hidden = true;
  });
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
        <p>${formatDate(appointment.date)} - ${appointment.practitioner}</p>
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

// Therapy and blog directory filters.
(() => {
  const setupCatalog = ({ searchId, gridId, countId, emptyId, resetId, itemSelector, label, singular }) => {
    const search = document.getElementById(searchId);
    const grid = document.getElementById(gridId);
    if (!search || !grid) return;

    const scope = grid.previousElementSibling;
    const items = [...grid.querySelectorAll(itemSelector)];
    const count = document.getElementById(countId);
    const empty = document.getElementById(emptyId);
    const reset = document.getElementById(resetId);
    const groups = scope ? [...scope.querySelectorAll('[data-filter-group]')] : [];
    const activeFilters = Object.fromEntries(groups.map((group) => [group.dataset.filterGroup, 'all']));

    const render = () => {
      const query = search.value.trim().toLowerCase();
      let visible = 0;

      items.forEach((item) => {
        const terms = (item.dataset.search || item.textContent).toLowerCase();
        const matchesSearch = !query || terms.includes(query);
        const matchesGroups = Object.entries(activeFilters).every(([name, value]) => {
          if (value === 'all') return true;
          return (item.dataset[name] || '').split(' ').includes(value);
        });
        item.hidden = !(matchesSearch && matchesGroups);
        if (!item.hidden) visible += 1;
      });

      if (count) count.textContent = `${visible} ${visible === 1 ? singular : label}`;
      if (empty) empty.hidden = visible !== 0;
    };

    groups.forEach((group) => {
      const buttons = [...group.querySelectorAll('.catalog-filter')];
      buttons.forEach((button) => {
        button.addEventListener('click', () => {
          activeFilters[group.dataset.filterGroup] = button.dataset.value || 'all';
          buttons.forEach((filter) => filter.classList.toggle('is-active', filter === button));
          render();
        });
      });
    });

    search.addEventListener('input', render);
    reset?.addEventListener('click', () => {
      search.value = '';
      Object.keys(activeFilters).forEach((name) => { activeFilters[name] = 'all'; });
      groups.forEach((group) => {
        group.querySelectorAll('.catalog-filter').forEach((filter) => filter.classList.toggle('is-active', filter.dataset.value === 'all'));
      });
      render();
      search.focus();
    });

    render();
  };

  setupCatalog({ searchId: 'therapy-search', gridId: 'therapy-grid', countId: 'therapy-result-count', emptyId: 'therapy-empty', resetId: 'therapy-reset', itemSelector: '.therapy-card', label: 'categories', singular: 'category' });
  setupCatalog({ searchId: 'blog-search', gridId: 'blog-grid', countId: 'blog-result-count', emptyId: 'blog-empty', resetId: 'blog-reset', itemSelector: '.blog-card', label: 'articles', singular: 'article' });

  const newsletter = document.querySelector('.blog-newsletter-form');
  newsletter?.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = newsletter.querySelector('button');
    if (button) button.textContent = 'Subscribed';
  });
})();
// Practitioner profiles and appointment booking.
(() => {
  const practitioners = window.norbuPractitioners || [];
  if (!practitioners.length) return;

  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get('id') || params.get('practitioner');
  const selected = practitioners.find((practitioner) => practitioner.id === requestedId) || practitioners[0];
  const text = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };

  const profileRoot = document.getElementById('practitioner-profile');
  if (profileRoot) {
    document.title = `${selected.name} | Norbu`;
    const image = document.getElementById('profile-image');
    if (image) {
      image.src = selected.image;
      image.alt = `${selected.name} portrait`;
    }
    text('profile-breadcrumb-name', selected.name);
    text('profile-availability', selected.availability);
    text('profile-specialty', selected.specialty);
    text('profile-name', selected.name);
    text('profile-focus', selected.focus);
    text('profile-bio', selected.bio);
    text('profile-experience', selected.experience);
    text('profile-clinic', selected.clinic);
    text('profile-languages', selected.languages);
    text('profile-approach', `${selected.name}'s profile lists focus areas, background, languages, and a Google Maps search link. Use it as a comparison point before checking external map and review details on Google.`);
    text('profile-first-name', selected.name.replace(/^Dr\.\s+/, '').split(' ')[0]);

    const therapyList = document.getElementById('profile-therapies');
    if (therapyList) therapyList.innerHTML = selected.therapies.map((therapy) => `<span>${therapy}</span>`).join('');
    const educationList = document.getElementById('profile-education');
    if (educationList) educationList.innerHTML = selected.education.map((item) => `<li>${item}</li>`).join('');
    const profileMap = document.getElementById('profile-map');
    const profileMapLink = document.getElementById('profile-map-link');
    const profileGoogleReviewLink = document.getElementById('profile-google-review-link');
    if (profileMap && selected.locationQuery) {
      profileMap.src = `https://www.google.com/maps?q=${encodeURIComponent(selected.locationQuery)}&z=12&output=embed`;
    }
    if (profileMapLink && selected.locationQuery) {
      profileMapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.locationQuery)}`;
    }
    const profileMapHeroLink = document.getElementById('profile-map-link-hero');
    if (profileMapHeroLink && selected.locationQuery) {
      profileMapHeroLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.locationQuery)}`;
    }
    if (profileGoogleReviewLink && selected.locationQuery) {
      profileGoogleReviewLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.locationQuery)}`;
    }
  }

  const bookingForm = document.getElementById('booking-form');
  if (!bookingForm) return;

  const practitionerSelect = document.getElementById('booking-practitioner');
  const typeSelect = document.getElementById('booking-type');
  const dateInput = document.getElementById('booking-date');
  const timeOptions = document.getElementById('booking-time-options');
  const summaryImage = document.getElementById('booking-summary-image');
  const profileLink = document.getElementById('booking-profile-link');
  let activePractitioner = selected;
  let activeTime = '';

  practitionerSelect.innerHTML = practitioners.map((practitioner) => `<option value="${practitioner.id}">${practitioner.name} - ${practitioner.specialty}</option>`).join('');
  practitionerSelect.value = selected.id;
  dateInput.min = new Date().toISOString().split('T')[0];

  const renderPractitioner = () => {
    activePractitioner = practitioners.find((practitioner) => practitioner.id === practitionerSelect.value) || practitioners[0];
    activeTime = '';
    summaryImage.src = activePractitioner.image;
    summaryImage.alt = `${activePractitioner.name} portrait`;
    text('booking-summary-name', activePractitioner.name);
    text('booking-summary-specialty', `${activePractitioner.specialty} - ${activePractitioner.focus}`);
    text('booking-summary-clinic', activePractitioner.clinic);
    profileLink.href = `practitioner-detail.html?id=${activePractitioner.id}`;
    timeOptions.innerHTML = activePractitioner.times.map((time, index) => `<label><input type="radio" name="time" value="${time}" ${index === 0 ? 'required' : ''}><span>${time}</span></label>`).join('');
  };

  practitionerSelect.addEventListener('change', renderPractitioner);
  typeSelect.addEventListener('change', () => text('booking-summary-type', typeSelect.value));
  dateInput.addEventListener('change', () => {
    const date = dateInput.value ? new Date(`${dateInput.value}T12:00:00`) : null;
    text('booking-summary-date', date ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date) : 'Choose a date');
  });
  timeOptions.addEventListener('change', (event) => {
    if (event.target.matches('input[name="time"]')) {
      activeTime = event.target.value;
      text('booking-summary-time', activeTime);
    }
  });

  bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!bookingForm.reportValidity()) return;
    const patientName = new FormData(bookingForm).get('patientName');
    const confirmation = document.getElementById('booking-confirmation');
    const copy = document.getElementById('booking-confirmation-copy');
    if (copy) copy.textContent = `${patientName}, your request with ${activePractitioner.name} for ${dateInput.value} at ${activeTime} is ready. A live scheduling backend can send this request once connected.`;
    if (confirmation) {
      confirmation.hidden = false;
      confirmation.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  renderPractitioner();
})();




