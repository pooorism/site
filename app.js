(async function () {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const STORAGE = {
    theme: 'bersad_theme',
    products: 'bersad_products',
    site: 'bersad_site_settings'
  };

  const state = { products: [], filtered: [], site: {}, basePath: '' };

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  function getBasePath() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    if (!parts.length) return '';
    const first = `/${parts[0]}`;
    if (['/catalog', '/about', '/contact', '/product'].includes(first)) return '';
    if (parts[1] && ['catalog', 'about', 'contact', 'product'].includes(parts[1])) return `/${parts[0]}`;
    return '';
  }

  function routePath() {
    const clean = window.location.pathname.replace(state.basePath, '') || '/';
    return clean.startsWith('/') ? clean : `/${clean}`;
  }

  function setTheme(theme) {
    const next = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE.theme, next);
  }

  function fmtPrice(n) {
    const val = Number(n);
    if (!val || val <= 0) return 'تماس بگیرید';
    return `${new Intl.NumberFormat('fa-IR').format(val)} تومان`;
  }

  async function loadJson(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Fetch failed: ${url}`);
    return res.json();
  }

  function normalizeProduct(p, i) {
    return {
      id: String(p.id || `p${String(i + 1).padStart(3, '0')}`),
      name: p.name || 'محصول برساد',
      brand: p.brand || 'Bersad',
      sku: p.sku || `BRS-${String(i + 1).padStart(3, '0')}`,
      price: Number(p.price || 0),
      image: p.image || 'assets/product-placeholder.svg',
      description: p.description || 'کالکشن عطرهای لوکس برساد.'
    };
  }

  function applySite(site) {
    const merged = {
      theme_default: 'dark',
      hero_bg: 'assets/hero.svg',
      site_bg: 'assets/bg1.svg',
      catalog_bg: 'assets/bg2.svg',
      catalog_vector: 'assets/perfume-vector.svg',
      logo: 'assets/logo.svg',
      ...site
    };

    document.documentElement.style.setProperty('--site-bg', `url('${merged.site_bg}')`);
    document.documentElement.style.setProperty('--hero-bg', `url('${merged.hero_bg}')`);
    document.documentElement.style.setProperty('--catalog-bg', `url('${merged.catalog_bg}')`);
    document.documentElement.style.setProperty('--catalog-vector', `url('${merged.catalog_vector}')`);
    $('#logoImg').src = merged.logo;
    $('#footerLogo').src = merged.logo;
    $('#heroImg').src = merged.hero_bg;
    state.site = merged;
  }

  function persistSeed(defaultProducts, defaultSite) {
    if (!localStorage.getItem(STORAGE.products)) {
      localStorage.setItem(STORAGE.products, JSON.stringify(defaultProducts.slice(0, 50).map(normalizeProduct)));
    }
    if (!localStorage.getItem(STORAGE.site)) {
      localStorage.setItem(STORAGE.site, JSON.stringify(defaultSite));
    }
  }

  function readData() {
    state.products = JSON.parse(localStorage.getItem(STORAGE.products) || '[]').map(normalizeProduct);
    state.filtered = state.products.slice();
    applySite(JSON.parse(localStorage.getItem(STORAGE.site) || '{}'));
  }

  function buildBrandOptions() {
    const sel = $('#brand');
    sel.innerHTML = '<option value="">همه برندها</option>';
    Array.from(new Set(state.products.map((p) => p.brand))).sort().forEach((brand) => {
      const option = document.createElement('option');
      option.value = brand;
      option.textContent = brand;
      sel.appendChild(option);
    });
  }

  function cardTpl(p) {
    return `<article class="card" data-id="${p.id}">
      <div class="card__img"><img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy"></div>
      <div class="card__body">
        <h3 class="card__name">${escapeHtml(p.name)}</h3>
        <div class="card__meta"><span>${escapeHtml(p.brand)}</span><span>${escapeHtml(p.sku)}</span></div>
        <div class="card__price">${fmtPrice(p.price)}</div>
      </div>
    </article>`;
  }

  function renderGrid() {
    $('#grid').innerHTML = state.filtered.map(cardTpl).join('');
    $('#empty').classList.toggle('hidden', state.filtered.length > 0);
    $$('.card').forEach((el) => el.addEventListener('click', () => navigate(`/product/${el.dataset.id}`)));
  }

  function filterProducts() {
    const q = ($('#q').value || '').trim().toLowerCase();
    const b = $('#brand').value;
    state.filtered = state.products.filter((p) => {
      const target = `${p.name} ${p.brand} ${p.sku}`.toLowerCase();
      return (!q || target.includes(q)) && (!b || p.brand === b);
    });
    renderGrid();
    initRevealAnimations();
  }

  function renderProductPage(path) {
    const id = path.split('/')[2] || '';
    const p = state.products.find((item) => item.id === id);
    if (!p) {
      $('#productView').innerHTML = '<div class="empty">محصول مورد نظر پیدا نشد.</div>';
      return;
    }
    $('#productView').innerHTML = `<div class="product-view__grid">
      <div class="product-view__image"><img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy"></div>
      <div class="product-view__content">
        <div class="pill pill--gold">${escapeHtml(p.brand)}</div>
        <h2>${escapeHtml(p.name)}</h2>
        <p>کد محصول: <strong>${escapeHtml(p.sku)}</strong></p>
        <div class="price">${fmtPrice(p.price)}</div>
        <p class="product-view__desc">${escapeHtml(p.description)}</p>
        <div class="hero__cta">
          <a class="btn btn--gold" href="https://wa.me/989122135489?text=${encodeURIComponent(`سلام، برای ${p.name} با کد ${p.sku} موجودی می‌خواستم.`)}" target="_blank" rel="noopener">استعلام در واتساپ</a>
          <a class="btn btn--purple" href="/catalog" data-route>بازگشت به کاتالوگ</a>
        </div>
      </div>
    </div>`;
    $$('[data-route]').forEach((a) => a.addEventListener('click', routeClick));
    initRevealAnimations();
  }

  function showRoute() {
    const path = routePath();
    $$('.route-section').forEach((section) => section.classList.add('hidden'));

    if (path.startsWith('/product/')) {
      $('#productSection').classList.remove('hidden');
      renderProductPage(path);
      return;
    }

    const map = { '/': '#heroSection', '/catalog': '#catalogSection', '/about': '#aboutSection', '/contact': '#contactSection' };
    const target = map[path] || '#heroSection';
    $(target).classList.remove('hidden');
  }

  function navigate(path, replace = false) {
    const fullPath = `${state.basePath}${path === '/' ? '/' : path}`;
    if (replace) window.history.replaceState({}, '', fullPath);
    else window.history.pushState({}, '', fullPath);
    showRoute();
    initRevealAnimations();
  }

  function routeClick(e) {
    const href = e.currentTarget.getAttribute('href');
    if (!href || !href.startsWith('/')) return;
    e.preventDefault();
    navigate(href);
    $('#nav').classList.add('hidden-mobile');
  }



  function initRevealAnimations() {
    const els = $$('.hero__card, .hero__frame, .card, .about__card, .contact__card, .product-view');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach((el) => {
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  function bind() {
    $('#themeBtn').addEventListener('click', () => setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));
    $('#q').addEventListener('input', filterProducts);
    $('#brand').addEventListener('change', filterProducts);
    $('#menuBtn').addEventListener('click', () => $('#nav').classList.toggle('hidden-mobile'));
    $$('[data-route]').forEach((a) => a.addEventListener('click', routeClick));
    window.addEventListener('popstate', showRoute);
  }

  async function init() {
    state.basePath = getBasePath();
    const [siteData, productData] = await Promise.all([loadJson('data/site.json'), loadJson('data/products.json')]);
    persistSeed(productData.products || [], siteData || {});
    readData();
    setTheme(localStorage.getItem(STORAGE.theme) || state.site.theme_default || 'dark');
    buildBrandOptions();
    renderGrid();
    bind();
    showRoute();
  }

  init().catch((err) => {
    console.error(err);
    $('#grid').innerHTML = '<div class="empty">خطا در بارگذاری اطلاعات.</div>';
  });
})();
