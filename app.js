/**
 * Playamigos — App Hub
 * Loads site config & apps from JSON, renders cards, handles search.
 */

(function () {
  'use strict';

  // ── DOM refs ──
  const appGrid = document.getElementById('app-grid');
  const searchInput = document.getElementById('search-input');
  const blogLink = document.getElementById('blog-link');
  const taglineEl = document.getElementById('tagline');
  const footerEl = document.getElementById('site-footer');

  // ── State ──
  let apps = [];
  let activeCategory = 'All';
  let searchQuery = '';

  // ── Init ──
  async function init() {
    // Load layout settings in background (non-blocking)
    loadSiteConfig();

    // Load and render app tiles instantly
    await loadApps();
    renderCategoryFilters();
    renderCards(apps);
    bindSearch();
    bindAboutModal();
  }

  // ── Load site.json ──
  async function loadSiteConfig() {
    try {
      const res = await fetch('site.json');
      const config = await res.json();

      if (blogLink && config.blogUrl) {
        blogLink.href = config.blogUrl;
      }
      if (taglineEl && typeof config.tagline === 'string') {
        if (config.tagline) {
          taglineEl.textContent = config.tagline;
          taglineEl.style.display = 'block';
        } else {
          taglineEl.style.display = 'none';
        }
      }
      if (footerEl && config.footerText) {
        footerEl.innerHTML = config.footerText;
      }

      // Fill modal configs dynamically
      const modalTagline = document.getElementById('modal-tagline');
      const modalBlogLink = document.getElementById('modal-blog-link');

      if (modalBlogLink && config.blogUrl) {
        modalBlogLink.href = config.blogUrl;
      }
      if (modalTagline && typeof config.tagline === 'string') {
        if (config.tagline) {
          modalTagline.textContent = config.tagline;
          modalTagline.style.display = 'block';
        } else {
          modalTagline.style.display = 'none';
        }
      }
    } catch (err) {
      console.warn('Could not load site.json:', err);
    }
  }

  // ── Load apps.json ──
  async function loadApps() {
    try {
      const res = await fetch('apps.json');
      apps = await res.json();

      // Inject custom fonts
      const fontStyles = new Set();
      apps.forEach(app => {
        if (app.fontFamily && app.fontUrl) {
          const rule = `@font-face { font-family: '${app.fontFamily}'; src: url('${app.fontUrl}'); font-display: swap; }`;
          fontStyles.add(rule);
        }
      });

      if (fontStyles.size > 0) {
        const styleEl = document.createElement('style');
        styleEl.textContent = Array.from(fontStyles).join('\n');
        document.head.appendChild(styleEl);
      }
    } catch (err) {
      console.warn('Could not load apps.json:', err);
      apps = [];
    }
  }

  // ── Render Category Filters ──
  function renderCategoryFilters() {
    const filterContainer = document.getElementById('filter-section');
    if (!filterContainer) return;

    // Extract all unique categories dynamically
    const categories = ['All'];
    apps.forEach(app => {
      if (app.category && !categories.includes(app.category)) {
        categories.push(app.category);
      }
    });

    filterContainer.innerHTML = '';
    categories.forEach(cat => {
      const pill = document.createElement('button');
      pill.className = `filter-pill ${activeCategory === cat ? 'filter-pill--active' : ''}`;
      pill.textContent = cat;
      pill.addEventListener('click', () => {
        activeCategory = cat;
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('filter-pill--active'));
        pill.classList.add('filter-pill--active');
        filterApps();
      });
      filterContainer.appendChild(pill);
    });
  }

  // ── Combined Filtering ──
  function filterApps() {
    let filtered = apps;

    if (activeCategory !== 'All') {
      filtered = filtered.filter(app => app.category === activeCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(app => {
        const haystack = [
          app.title,
          app.description,
          app.category || ''
        ].join(' ').toLowerCase();
        return searchQuery.split(/\s+/).every(word => haystack.includes(word));
      });
    }

    renderCards(filtered);
  }

  // ── Render app cards ──
  function renderCards(list) {
    appGrid.innerHTML = '';

    if (list.length === 0) {
      appGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">🔍</div>
          <p class="empty-state__text">No apps found</p>
        </div>
      `;
      return;
    }

    const fragment = document.createDocumentFragment();

    list.forEach((app, i) => {
      const card = document.createElement('a');
      card.className = 'app-card';
      card.href = app.url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.style.animationDelay = `${i * 0.06}s`;
      card.setAttribute('aria-label', `Open ${app.title}`);

      card.innerHTML = `
        <img
          class="app-card__logo"
          src="${escapeHtml(app.logo)}"
          alt="${escapeHtml(app.title)} logo"
          width="36"
          height="36"
          loading="lazy"
          onerror="this.style.display='none'"
        >
        <div class="app-card__info">
          <span class="app-card__title" ${app.fontFamily ? `style="font-family: '${escapeHtml(app.fontFamily)}';"` : ''}>${escapeHtml(app.title)}</span>
          <span class="app-card__desc">${escapeHtml(app.description)}</span>
          ${app.category ? `<span class="app-card__category">${escapeHtml(app.category)}</span>` : ''}
        </div>
      `;

      fragment.appendChild(card);
    });

    appGrid.appendChild(fragment);
  }

  // ── Search ──
  function bindSearch() {
    let debounceTimer;

    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchQuery = searchInput.value.trim().toLowerCase();
        filterApps();
      }, 150);
    });

    // Clear search on Escape
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        searchQuery = '';
        filterApps();
        searchInput.blur();
      }
    });
  }

  // ── About Modal ──
  function bindAboutModal() {
    const aboutLink = document.getElementById('about-link');
    const aboutModal = document.getElementById('about-modal');
    const modalClose = document.getElementById('modal-close');

    if (aboutLink && aboutModal) {
      aboutLink.addEventListener('click', (e) => {
        e.preventDefault();
        aboutModal.showModal();
      });
    }

    if (modalClose && aboutModal) {
      modalClose.addEventListener('click', () => {
        aboutModal.close();
      });
    }

    // Close when clicking outside of modal card (on backdrop)
    if (aboutModal) {
      aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
          aboutModal.close();
        }
      });
    }
  }

  // ── Utils ──
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Idle Greet Bubble ──
  function initGreetBubble() {
    const logo = document.getElementById('site-logo');
    const bubble = document.getElementById('greet-bubble');
    if (!logo || !bubble) return;

    let idleTime = 0;
    let idleInterval = null;
    let bubbleTimer;

    const messages = [
      "👋 Hola, Amigo!",
      "Welcome to PlayAmigos! 🚀",
      "Ready to learn something new today?",
      "Boost your productivity! ⚡",
      "Fact: Our apps use ZERO tracking. 🛡️",
      "100% Ad-Free experiences. Always. 🚫📺",
      "Most of our apps are completely free! 💸",
      "Enjoy our generous lifelong free plans! 🎁",
      "Your privacy is our priority. 🔒",
      "Explore curated tools just for you! 🔍",
      "We build with ❤️ for learners.",
      "Stay focused, stay productive. 🎯",
      "No hidden fees, no surprises. ✨",
      "Building habits made simple. 🧱",
      "Hello there! Have a great day! ☀️",
      "Fact: We don't sell your data. Ever. 🛑",
      "Level up your daily workflow! 📈",
      "Tools designed for elegance and simplicity. 🎨",
      "Greetings from the PlayAmigos team! 👋",
      "Discover your next favorite app today! 💡"
    ];

    const showBubble = (specificMsg = null) => {
      const msg = specificMsg || messages[Math.floor(Math.random() * messages.length)];
      bubble.textContent = msg;
      bubble.classList.add('show');
      clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(() => {
        bubble.classList.remove('show');
      }, 4000);
    };

    const triggerGlitch = () => {
      document.body.classList.add('glitch-active');
      setTimeout(() => {
        document.body.classList.remove('glitch-active');
        showBubble("The glitch is just to alert you, never mind! 😅");
      }, 450); // Match new animation duration
    };

    const startIdleTracking = () => {
      if (idleInterval) clearInterval(idleInterval);
      idleTime = 0;
      idleInterval = setInterval(() => {
        idleTime++;
        if (idleTime % 20 === 0) {
          triggerGlitch();
        } else if (idleTime % 5 === 0) {
          showBubble();
        }
      }, 1000);
    };

    const resetIdle = () => {
      startIdleTracking();
    };

    logo.addEventListener('click', () => {
      showBubble();
    });

    const events = ['mousemove', 'mousedown', 'keypress', 'touchmove', 'scroll'];
    events.forEach(evt => document.addEventListener(evt, resetIdle, true));

    // Start initial timer
    startIdleTracking();
  }

  // ── Go ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      initGreetBubble();
    });
  } else {
    init();
    initGreetBubble();
  }
})();
