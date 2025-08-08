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

function toYouTubeEmbed(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace('/', '');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname.startsWith('/embed/')) return url;
      const id = u.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {}
  return null;
}

function toVimeoEmbed(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {}
  return null;
}

function isEmbeddableVideo(url) {
  const isMedia = /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
  return Boolean(toYouTubeEmbed(url) || toVimeoEmbed(url) || isMedia);
}

function createEmbeddedVideoElement(src) {
  const yt = toYouTubeEmbed(src);
  if (yt) {
    const iframe = document.createElement('iframe');
    iframe.src = yt;
    iframe.title = 'YouTube video player';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    iframe.allowFullscreen = true;
    return iframe;
  }
  const vimeo = toVimeoEmbed(src);
  if (vimeo) {
    const iframe = document.createElement('iframe');
    iframe.src = vimeo;
    iframe.title = 'Vimeo video player';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
    iframe.allowFullscreen = true;
    return iframe;
  }
  // Fallback to HTML5 video for direct media files
  const isMedia = /\.(mp4|webm|ogg)(\?.*)?$/i.test(src);
  if (isMedia) {
    const v = document.createElement('video');
    v.src = src;
    v.controls = true;
    return v;
  }
  // Generic iframe fallback
  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.setAttribute('frameborder', '0');
  iframe.allowFullscreen = true;
  return iframe;
}

// Render Gallery (local fallback)
function renderGallery() {
  if (window.USE_SUPABASE) return; // Supabase handles rendering
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  const items = storage.get('galleryItems', []);
  grid.innerHTML = '';
  items.forEach((it) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'gallery-item';
    const shouldEmbed = it.type === 'video' || isEmbeddableVideo(it.src || '');
    if (shouldEmbed) {
      const embed = createEmbeddedVideoElement(it.src);
      wrapper.appendChild(embed);
    } else {
      const img = document.createElement('img');
      img.src = it.src;
      img.alt = it.alt || 'Gallery item';
      wrapper.appendChild(img);
    }
    grid.appendChild(wrapper);
  });
}

// Poll helpers: one-vote-per-browser per poll
function computePollKey(poll) {
  const base = `${poll.question}::${(poll.options || []).map(o => o.text).join('|')}`;
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    const chr = base.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return String(hash);
}

// Render Polls (local fallback)
function renderPolls() {
  if (window.USE_SUPABASE) return; // Supabase handles rendering
  const list = document.getElementById('pollsList');
  if (!list) return;
  const polls = storage.get('polls', []);
  const votedMap = storage.get('pollVotes', {});
  list.innerHTML = '';

  polls.forEach((poll, pollIndex) => {
    const pollKey = computePollKey(poll);
    const userChoice = votedMap[pollKey];

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
      if (typeof userChoice === 'number') {
        btn.disabled = true;
        if (userChoice === optIndex) btn.style.opacity = '1'; else btn.style.opacity = '0.7';
      }
      btn.addEventListener('click', () => {
        const currentVotes = storage.get('pollVotes', {});
        if (typeof currentVotes[pollKey] === 'number') return; // already voted
        const updatedPolls = storage.get('polls', []);
        updatedPolls[pollIndex].options[optIndex].votes = (updatedPolls[pollIndex].options[optIndex].votes || 0) + 1;
        storage.set('polls', updatedPolls);
        currentVotes[pollKey] = optIndex;
        storage.set('pollVotes', currentVotes);
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

// Note: Gallery and Polls rendering is now handled by index.html script
// This prevents conflicts between multiple rendering systems 