// Mobile navigation toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.addEventListener('click', (e) => {
    if (e.target instanceof HTMLElement && e.target.tagName === 'A') {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// Smooth scroll
const internalLinks = document.querySelectorAll('a[href^="#"]');
internalLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    const targetId = (link.getAttribute('href') || '').substring(1);
    const section = document.getElementById(targetId);
    if (section) {
      e.preventDefault();
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Dynamic year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Content storage helpers
const storage = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || '') ?? fallback; } catch { return fallback; }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Render Gallery
function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  const items = storage.get('galleryItems', []);
  grid.innerHTML = '';
  items.forEach((it, idx) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'gallery-item';
    if (it.type === 'video') {
      const v = document.createElement('video');
      v.src = it.src;
      v.controls = true;
      wrapper.appendChild(v);
    } else {
      const img = document.createElement('img');
      img.src = it.src;
      img.alt = it.alt || 'Gallery item';
      wrapper.appendChild(img);
    }
    grid.appendChild(wrapper);
  });
}

// Render Polls
function renderPolls() {
  const list = document.getElementById('pollsList');
  if (!list) return;
  const polls = storage.get('polls', []);
  list.innerHTML = '';
  polls.forEach((poll, pollIndex) => {
    const card = document.createElement('div');
    card.className = 'poll-card';

    const title = document.createElement('h3');
    title.textContent = poll.question;
    card.appendChild(title);

    const optionsWrap = document.createElement('div');
    optionsWrap.className = 'poll-options';

    const totalVotes = poll.options.reduce((s, o) => s + (o.votes || 0), 0) || 0;

    poll.options.forEach((opt, optIndex) => {
      const btn = document.createElement('button');
      const percent = totalVotes ? Math.round((opt.votes || 0) * 100 / totalVotes) : 0;
      btn.innerHTML = `${opt.text} — ${percent}% (${opt.votes || 0})`;
      btn.addEventListener('click', () => {
        const updated = storage.get('polls', []);
        updated[pollIndex].options[optIndex].votes = (updated[pollIndex].options[optIndex].votes || 0) + 1;
        storage.set('polls', updated);
        renderPolls();
      });
      optionsWrap.appendChild(btn);
    });

    const bar = document.createElement('div');
    bar.className = 'poll-progress';
    const fill = document.createElement('span');
    const topPercent = totalVotes ? Math.max(...poll.options.map(o => Math.round((o.votes || 0) * 100 / totalVotes))) : 0;
    fill.style.width = `${topPercent}%`;
    bar.appendChild(fill);

    card.appendChild(optionsWrap);
    card.appendChild(bar);
    list.appendChild(card);
  });
}

renderGallery();
renderPolls();

// Handle messages from admin.html for content updates
window.addEventListener('message', (event) => {
  if (!event.data || typeof event.data !== 'object') return;
  const { type, payload } = event.data;
  if (type === 'updateGallery') {
    storage.set('galleryItems', payload || []);
    renderGallery();
  }
  if (type === 'updatePolls') {
    storage.set('polls', payload || []);
    renderPolls();
  }
}); 