(() => {
  const ADMIN_USER = 'admin';
  const ADMIN_PASS = 'bersad1234';
  const K = { auth: 'bersad_admin_auth', products: 'bersad_products', site: 'bersad_site_settings' };
  const $ = (s) => document.querySelector(s);

  const normalize = (p, i = 0) => ({
    id: p.id || `p${String(i + 1).padStart(3, '0')}`,
    name: p.name || 'محصول برساد',
    brand: p.brand || 'Bersad',
    sku: p.sku || `BRS-${String(i + 1).padStart(3, '0')}`,
    price: Number(p.price || 0),
    image: p.image || '../assets/product-placeholder.svg',
    description: p.description || 'کالکشن عطرهای لوکس برساد.'
  });

  function readProducts() {
    return JSON.parse(localStorage.getItem(K.products) || '[]').map(normalize);
  }
  function saveProducts(products) {
    localStorage.setItem(K.products, JSON.stringify(products.map(normalize)));
  }

  function renderList() {
    const products = readProducts();
    $('#list').innerHTML = products.map((p) => `
      <div class="item">
        <div><strong>${p.name}</strong><br><small>${p.brand} | ${p.sku} | ${p.price || 'تماس'}</small></div>
        <div class="actions">
          <button class="btn btn-light" data-edit="${p.id}">ویرایش</button>
          <button class="btn btn-light" data-del="${p.id}">حذف</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => fillForm(products.find((x) => x.id === b.dataset.edit))));
    document.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => {
      saveProducts(products.filter((x) => x.id !== b.dataset.del));
      renderList();
    }));
  }

  function fillForm(p) {
    if (!p) return;
    $('#pid').value = p.id; $('#pname').value = p.name; $('#pbrand').value = p.brand; $('#psku').value = p.sku;
    $('#pprice').value = p.price; $('#pimage').value = p.image; $('#pdesc').value = p.description;
  }

  function handleSaveProduct(e) {
    e.preventDefault();
    const products = readProducts();
    const id = $('#pid').value.trim() || `p${Date.now()}`;
    const obj = normalize({
      id,
      name: $('#pname').value.trim(),
      brand: $('#pbrand').value.trim(),
      sku: $('#psku').value.trim(),
      price: Number($('#pprice').value || 0),
      image: $('#pimage').value.trim() || '../assets/product-placeholder.svg',
      description: $('#pdesc').value.trim()
    });

    const idx = products.findIndex((x) => x.id === id);
    if (idx >= 0) products[idx] = obj; else products.unshift(obj);
    saveProducts(products);
    e.target.reset();
    renderList();
  }

  function bindBg() {
    const site = JSON.parse(localStorage.getItem(K.site) || '{}');
    $('#catalogBg').value = site.catalog_bg || '../assets/bg2.webp';
    $('#catalogVector').value = site.catalog_vector || '../assets/perfume-vector.svg';

    $('#saveBg').addEventListener('click', () => {
      const next = {
        ...site,
        catalog_bg: $('#catalogBg').value.trim() || '../assets/bg2.webp',
        catalog_vector: $('#catalogVector').value.trim() || '../assets/perfume-vector.svg'
      };
      localStorage.setItem(K.site, JSON.stringify(next));
    });
  }

  function showPanel(ok) {
    $('#loginBox').classList.toggle('hidden', ok);
    $('#panelBox').classList.toggle('hidden', !ok);
    if (ok) { renderList(); bindBg(); }
  }

  $('#loginBtn').addEventListener('click', () => {
    const ok = $('#user').value === ADMIN_USER && $('#pass').value === ADMIN_PASS;
    if (!ok) { $('#loginMsg').textContent = 'اطلاعات ورود نادرست است.'; return; }
    localStorage.setItem(K.auth, '1');
    showPanel(true);
  });

  $('#logoutBtn').addEventListener('click', () => {
    localStorage.removeItem(K.auth);
    showPanel(false);
  });

  $('#productForm').addEventListener('submit', handleSaveProduct);
  showPanel(localStorage.getItem(K.auth) === '1');
})();
