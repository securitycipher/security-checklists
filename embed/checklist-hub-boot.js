(function () {
  'use strict';

  var DATA_URL = window.SC_CHECKLIST_HUB_DATA_URL
    || 'https://cdn.jsdelivr.net/gh/securitycipher/security-checklists@main/embed/checklist-hub-data.json';
  var STORAGE_KEY = 'sc-checklist-hub-v1';

  var ICONS = {
    web: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.8 4 6 4 9s-1.5 6.2-4 9M12 3c-2.5 2.8-4 6-4 9s1.5 6.2 4 9"/></svg>',
    mobile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18h2"/></svg>',
    aws: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.8 17.2 4 15.1l8.6-5.1-1.2-2 8.4 1.4-1.6 8.4-2-1.2-5.4 3.2z"/></svg>',
    azure: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5.2 18.4 13.1 4.2l2.2 7.4 3.5-1.2-8.6 8z"/></svg>',
    gcp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 4.5 19 8.5v7L12 19.5 5 15.5v-7z"/><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/></svg>',
    llm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 4 7.5v9L12 21l8-4.5v-9z"/><path d="M8.5 12h7M12 8.5v7"/></svg>',
    mcp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="7" height="6" rx="1.2"/><rect x="14" y="4" width="7" height="6" rx="1.2"/><rect x="8.5" y="14" width="7" height="6" rx="1.2"/><path d="M6.5 10v2.2c0 1 .8 1.8 1.8 1.8h7.4c1 0 1.8-.8 1.8-1.8V10"/></svg>',
    agent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="3.2"/><path d="M5 20c.8-3.2 3.4-5 7-5s6.2 1.8 7 5"/><path d="M4 11h3M17 11h3M12 4V2.5"/></svg>',
    api: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 8h10v8H7z"/><path d="M4 10v4M20 10v4"/></svg>',
    k8s: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 3 7v10l9 5 9-5V7z"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 18h11a4 4 0 0 0 .5-8 5.5 5.5 0 0 0-10.6-1.5A4 4 0 0 0 7 18z"/></svg>',
    ad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h4M7 12h10M7 16h7"/></svg>',
    network: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="M12 7v5M8.5 14.5 6.8 17M15.5 14.5l1.7 2.5"/></svg>',
    devops: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6h12v12H6z"/><path d="M9 9h6M9 12h4M9 15h6"/></svg>',
    osint: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    server: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="3" width="16" height="6" rx="1.5"/><rect x="4" y="11" width="16" height="6" rx="1.5"/><circle cx="8" cy="6" r="1" fill="currentColor"/><circle cx="8" cy="14" r="1" fill="currentColor"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 8 4 12l4 4M16 8l4 4-4 4"/></svg>'
  };

  var ICON_ALIASES = {
    kubernetes: 'k8s',
    'active-directory': 'ad',
    devsecops: 'devops',
    cicd: 'devops',
    infrastructure: 'server',
    'secure-code-review': 'code'
  };

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function excerpt(s, n) {
    s = String(s || '');
    if (s.length <= n) return s;
    return s.slice(0, n).trim() + '…';
  }

  function icon(name) {
    var key = ICON_ALIASES[name] || name;
    return ICONS[key] || ICONS.web;
  }

  function totalItems(categories) {
    var sum = 0;
    categories.forEach(function (c) { sum += c.item_count || 0; });
    return sum;
  }

  function renderItem(catId, itemIndex, item, secTitle) {
    var itemId = catId + '-' + itemIndex;
    var title = item.title || '';
    var description = item.description || item.desc || '';
    var summary = excerpt(description, 160);
    var howToFind = item.how_to_find || '';
    var howToFix = item.how_to_fix || '';
    var severity = item.severity || '';
    var tools = item.tools || [];
    var refs = item.references || [];
    var haystack = (title + ' ' + description + ' ' + howToFind + ' ' + howToFix + ' ' + tools.join(' ') + ' ' + secTitle).toLowerCase();
    var hasDetail = description || howToFind || howToFix || tools.length || refs.length;
    var html = '<li class="sc-chub-item' + (hasDetail ? ' has-detail' : '') + '" data-search="' + esc(haystack) + '" data-severity="' + esc(severity) + '">';
    html += '<div class="sc-chub-item-head"><label class="sc-chub-check">';
    html += '<input type="checkbox" data-check-id="' + esc(itemId) + '" />';
    html += '<span class="sc-chub-check-ui" aria-hidden="true"></span><span class="sc-chub-check-copy">';
    html += '<span class="sc-chub-item-title-row"><strong>' + esc(title) + '</strong>';
    if (severity) html += '<span class="sc-chub-severity sc-chub-severity-' + esc(severity) + '">' + esc(severity.charAt(0).toUpperCase() + severity.slice(1)) + '</span>';
    html += '</span>';
    if (description) html += '<small class="sc-chub-item-summary">' + esc(summary) + '</small>';
    html += '</span></label>';
    if (hasDetail) {
      html += '<button type="button" class="sc-chub-detail-toggle" aria-expanded="false" aria-controls="detail-' + esc(itemId) + '">';
      html += '<span class="sc-chub-detail-toggle-label">Details</span>';
      html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></button>';
    }
    html += '</div>';
    if (hasDetail) {
      html += '<div class="sc-chub-item-detail" id="detail-' + esc(itemId) + '" hidden>';
      if (description) html += '<div class="sc-chub-detail-block sc-chub-detail-overview"><h4>Overview</h4><p>' + esc(description) + '</p></div>';
      if (howToFind) html += '<div class="sc-chub-detail-block sc-chub-detail-find"><h4>How to find</h4><p>' + esc(howToFind) + '</p></div>';
      if (howToFix) html += '<div class="sc-chub-detail-block sc-chub-detail-fix"><h4>How to fix</h4><p>' + esc(howToFix) + '</p></div>';
      if (tools.length) {
        html += '<div class="sc-chub-detail-block sc-chub-detail-tools"><h4>Tools</h4><ul class="sc-chub-tool-list">';
        tools.forEach(function (t) { html += '<li>' + esc(t) + '</li>'; });
        html += '</ul></div>';
      }
      if (refs.length) {
        html += '<div class="sc-chub-detail-block sc-chub-detail-refs"><h4>References</h4><ul class="sc-chub-ref-list">';
        refs.forEach(function (r) {
          if (r && r.url) html += '<li><a href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' + esc(r.title || r.url) + '</a></li>';
        });
        html += '</ul></div>';
      }
      html += '</div>';
    }
    html += '</li>';
    return html;
  }

  function renderHub(data) {
    var categories = data.categories || [];
    var total = totalItems(categories);
    var html = '<main class="sc-page-main sc-checklist-hub-main" id="sc-checklist-hub">';
    html += '<section class="sc-chub-hero"><div class="wrap">';
    html += '<p class="sc-chub-kicker">SecurityCipher Resources</p>';
    html += '<h1>Security Checklists Hub</h1>';
    html += '<p class="sc-chub-lead">Detailed security checklists with descriptions, how to find each issue, remediation steps, and recommended tools. Content is maintained in our <a href="https://github.com/securitycipher/security-checklists">GitHub security-checklists repo</a>.</p>';
    html += '<div class="sc-chub-stats"><div class="sc-chub-stat"><strong data-count="' + categories.length + '" data-suffix="">0</strong><span>Domains</span></div>';
    html += '<div class="sc-chub-stat"><strong data-count="' + total + '" data-suffix="+">0</strong><span>Controls</span></div>';
    html += '<div class="sc-chub-stat"><strong id="sc-chub-done-pct">0%</strong><span>Your progress</span></div></div></div></section>';
    html += '<section class="sc-chub-toolbar band"><div class="wrap sc-chub-toolbar-inner">';
    html += '<label class="sc-chub-search-wrap" for="sc-chub-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';
    html += '<input type="search" id="sc-chub-search" placeholder="Search controls across all checklists..." autocomplete="off" /></label>';
    html += '<div class="sc-chub-toolbar-actions">';
    html += '<button type="button" class="sc-chub-btn sc-chub-btn-ghost" id="sc-chub-expand-details">Show all details</button>';
    html += '<button type="button" class="sc-chub-btn sc-chub-btn-ghost" id="sc-chub-expand-all">Expand sections</button>';
    html += '<button type="button" class="sc-chub-btn sc-chub-btn-ghost" id="sc-chub-collapse-all">Collapse sections</button>';
    html += '<button type="button" class="sc-chub-btn sc-chub-btn-danger" id="sc-chub-reset">Reset progress</button>';
    html += '</div></div></section>';
    html += '<div class="wrap sc-chub-layout"><aside class="sc-chub-nav"><p class="sc-chub-nav-label">Jump to</p><ul class="sc-chub-nav-list">';
    categories.forEach(function (cat) {
      html += '<li><a href="#checklist-' + esc(cat.id) + '" class="sc-chub-nav-link" data-nav-cat="' + esc(cat.id) + '" style="--cat-color:' + esc(cat.color || '#6d7bff') + '">';
      html += '<span class="sc-chub-nav-icon">' + icon(cat.icon || 'web') + '</span>';
      html += '<span class="sc-chub-nav-text">' + esc(cat.title) + '<em>' + (cat.item_count || 0) + ' items</em></span>';
      html += '<span class="sc-chub-nav-progress" data-nav-progress="' + esc(cat.id) + '">0%</span></a></li>';
    });
    html += '</ul></aside><div class="sc-chub-content"><div class="sc-chub-cards">';
    categories.forEach(function (cat) {
      html += '<a href="#checklist-' + esc(cat.id) + '" class="sc-chub-card" data-card-cat="' + esc(cat.id) + '" style="--cat-color:' + esc(cat.color || '#6d7bff') + '">';
      html += '<div class="sc-chub-card-icon">' + icon(cat.icon || 'web') + '</div>';
      html += '<h2>' + esc(cat.title) + '</h2><p>' + esc(cat.description || '') + '</p>';
      html += '<div class="sc-chub-card-meta"><span>' + (cat.item_count || 0) + ' controls</span>';
      html += '<span class="sc-chub-card-progress" data-card-progress="' + esc(cat.id) + '">0% done</span></div></a>';
    });
    html += '</div>';
    categories.forEach(function (cat) {
      var itemIndex = 0;
      html += '<section class="sc-chub-panel" id="checklist-' + esc(cat.id) + '" data-cat="' + esc(cat.id) + '" style="--cat-color:' + esc(cat.color || '#6d7bff') + '">';
      html += '<header class="sc-chub-panel-head"><div class="sc-chub-panel-title"><span class="sc-chub-panel-icon">' + icon(cat.icon || 'web') + '</span><div>';
      html += '<h2>' + esc(cat.title) + '</h2><p>' + esc(cat.description || '') + '</p></div></div>';
      html += '<div class="sc-chub-panel-actions"><div class="sc-chub-progress-bar"><span class="sc-chub-progress-fill" data-panel-progress="' + esc(cat.id) + '"></span></div>';
      html += '<span class="sc-chub-progress-label" data-panel-label="' + esc(cat.id) + '">0 / ' + (cat.item_count || 0) + '</span></div></header>';
      (cat.sections || []).forEach(function (section) {
        var secTitle = section.title || 'General';
        html += '<details class="sc-chub-section" open><summary><span>' + esc(secTitle) + '</span><em class="sc-chub-section-count"></em></summary><ul class="sc-chub-items">';
        (section.items || []).forEach(function (item) {
          itemIndex += 1;
          html += renderItem(cat.id, itemIndex, item, secTitle);
        });
        html += '</ul></details>';
      });
      html += '</section>';
    });
    html += '</div></div></main>';
    return html;
  }

  function initInteractivity(root) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function loadState() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch (e) { return {}; }
    }
    function saveState(state) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    }
    var state = loadState();
    var panels = [].slice.call(root.querySelectorAll('.sc-chub-panel'));
    var checks = [].slice.call(root.querySelectorAll('[data-check-id]'));
    var searchInput = document.getElementById('sc-chub-search');
    var donePctEl = document.getElementById('sc-chub-done-pct');

    root.querySelectorAll('[data-count]').forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count') || '0');
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduce || !target) { el.textContent = target + suffix; return; }
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / 1200, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });

    function updatePanel(cat) {
      var panel = root.querySelector('.sc-chub-panel[data-cat="' + cat + '"]');
      if (!panel) return;
      var items = [].slice.call(panel.querySelectorAll('[data-check-id]'));
      var done = 0;
      items.forEach(function (input) {
        var id = input.getAttribute('data-check-id');
        var checked = !!state[id];
        input.checked = checked;
        var li = input.closest('.sc-chub-item');
        if (li) li.classList.toggle('is-done', checked);
        if (checked) done++;
      });
      var pct = items.length ? Math.round((done / items.length) * 100) : 0;
      var fill = root.querySelector('[data-panel-progress="' + cat + '"]');
      var label = root.querySelector('[data-panel-label="' + cat + '"]');
      var navProg = root.querySelector('[data-nav-progress="' + cat + '"]');
      var cardProg = root.querySelector('[data-card-progress="' + cat + '"]');
      if (fill) fill.style.width = pct + '%';
      if (label) label.textContent = done + ' / ' + items.length;
      if (navProg) navProg.textContent = pct + '%';
      if (cardProg) cardProg.textContent = pct + '% done';
      panel.querySelectorAll('.sc-chub-section').forEach(function (sec) {
        var secChecks = [].slice.call(sec.querySelectorAll('[data-check-id]'));
        var secDone = secChecks.filter(function (c) { return state[c.getAttribute('data-check-id')]; }).length;
        var counter = sec.querySelector('.sc-chub-section-count');
        if (counter) counter.textContent = secDone + '/' + secChecks.length;
      });
    }

    function updateGlobal() {
      var total = checks.length;
      var done = checks.filter(function (c) { return state[c.getAttribute('data-check-id')]; }).length;
      if (donePctEl) donePctEl.textContent = (total ? Math.round((done / total) * 100) : 0) + '%';
      panels.forEach(function (p) { updatePanel(p.getAttribute('data-cat')); });
    }

    checks.forEach(function (input) {
      var id = input.getAttribute('data-check-id');
      if (state[id]) input.checked = true;
      input.addEventListener('change', function () {
        if (input.checked) state[id] = true; else delete state[id];
        saveState(state);
        updateGlobal();
      });
    });
    updateGlobal();

    function setItemDetailOpen(item, open) {
      var toggle = item.querySelector('.sc-chub-detail-toggle');
      var panel = item.querySelector('.sc-chub-item-detail');
      if (!toggle || !panel) return;
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.hidden = !open;
      item.classList.toggle('is-open', open);
      toggle.querySelector('.sc-chub-detail-toggle-label').textContent = open ? 'Hide' : 'Details';
    }

    root.querySelectorAll('.sc-chub-detail-toggle').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var item = btn.closest('.sc-chub-item');
        setItemDetailOpen(item, btn.getAttribute('aria-expanded') !== 'true');
      });
    });

    var expandDetailsBtn = document.getElementById('sc-chub-expand-details');
    if (expandDetailsBtn) {
      expandDetailsBtn.addEventListener('click', function () {
        var items = root.querySelectorAll('.sc-chub-item.has-detail');
        var allOpen = [].every.call(items, function (item) { return item.classList.contains('is-open'); });
        [].forEach.call(items, function (item) { setItemDetailOpen(item, !allOpen); });
        expandDetailsBtn.textContent = allOpen ? 'Show all details' : 'Hide all details';
      });
    }

    function runSearch() {
      var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
      panels.forEach(function (panel) {
        panel.classList.remove('is-dimmed', 'is-match', 'is-searching');
        var any = false;
        panel.querySelectorAll('.sc-chub-item').forEach(function (li) {
          var match = !q || (li.getAttribute('data-search') || '').indexOf(q) !== -1;
          li.classList.toggle('is-hidden', !match);
          if (match) any = true;
        });
        panel.querySelectorAll('.sc-chub-section').forEach(function (sec) {
          var visible = [].some.call(sec.querySelectorAll('.sc-chub-item'), function (li) {
            return !li.classList.contains('is-hidden');
          });
          sec.classList.toggle('has-match', visible);
          if (q && visible) sec.open = true;
        });
        if (q) {
          panel.classList.add('is-searching');
          panel.classList.toggle('is-match', any);
          panel.classList.toggle('is-dimmed', !any);
        }
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', runSearch);
    }

    var expandBtn = document.getElementById('sc-chub-expand-all');
    var collapseBtn = document.getElementById('sc-chub-collapse-all');
    var resetBtn = document.getElementById('sc-chub-reset');
    if (expandBtn) expandBtn.addEventListener('click', function () { root.querySelectorAll('.sc-chub-section').forEach(function (s) { s.open = true; }); });
    if (collapseBtn) collapseBtn.addEventListener('click', function () { root.querySelectorAll('.sc-chub-section').forEach(function (s) { s.open = false; }); });
    if (resetBtn) resetBtn.addEventListener('click', function () {
      if (!window.confirm('Clear all checklist progress saved in this browser?')) return;
      state = {};
      saveState(state);
      checks.forEach(function (c) { c.checked = false; });
      updateGlobal();
    });

    var navLinks = [].slice.call(root.querySelectorAll('.sc-chub-nav-link'));
    if (window.IntersectionObserver) {
      var navObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.getAttribute('data-cat');
          navLinks.forEach(function (a) {
            a.classList.toggle('is-active', a.getAttribute('data-nav-cat') === id);
          });
        });
      }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
      panels.forEach(function (p) { navObserver.observe(p); });
    }

    if (window.location.hash) {
      var hashTarget = document.querySelector(window.location.hash);
      if (hashTarget) {
        setTimeout(function () {
          hashTarget.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        }, 120);
      }
    }
  }

  function boot() {
    var mount = document.getElementById('sc-checklist-hub-mount');
    if (!mount) return;
    document.body.classList.add('sc-page-checklist-hub');
    fetch(DATA_URL, { credentials: 'omit' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        mount.innerHTML = renderHub(data);
        initInteractivity(mount.querySelector('#sc-checklist-hub'));
      })
      .catch(function (err) {
        mount.innerHTML = '<p class="sc-chub-error">Could not load checklists. ' + esc(err.message) + '</p>';
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
