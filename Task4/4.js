
/* =========================
   Data (example products)
   ========================= */
const PRODUCTS = [
  { id:1, title:"Smartphone X1", owner:"TechCorp", price:799, category:"electronics", img:"https://picsum.photos/900/600?image=1025", desc:"High-end smartphone with powerful features, great battery life and superb camera." },
  { id:2, title:"Designer Jacket", owner:"FashionHub", price:199, category:"fashion", img:"https://picsum.photos/900/600?image=1011", desc:"Stylish and warm jacket. Premium materials, tailored fit." },
  { id:3, title:"Wireless Earbuds", owner:"SoundMax", price:149, category:"electronics", img:"https://picsum.photos/900/600?image=1005", desc:"Compact earbuds with active noise cancellation and long battery life." },
  { id:4, title:"Fantasy Novel", owner:"BookWorld", price:29, category:"books", img:"https://picsum.photos/900/600?image=1031", desc:"An epic fantasy novel with rich world-building and memorable characters." },
  { id:5, title:"Running Shoes", owner:"Sportify", price:120, category:"fashion", img:"https://picsum.photos/900/600?image=1035", desc:"Lightweight, breathable running shoes for long distance comfort." },
  { id:6, title:"Smartwatch Z", owner:"TimeTech", price:299, category:"electronics", img:"https://picsum.photos/900/600?image=1043", desc:"Health-focused smartwatch with GPS, long battery and accurate sensors." },
  { id:7, title:"Laptop Pro 14", owner:"ComputeX", price:1299, category:"electronics", img:"https://picsum.photos/900/600?image=1050", desc:"Powerful laptop with M-class performance for professionals." },
  { id:8, title:"Leather Bag", owner:"CarryAll", price:249, category:"fashion", img:"https://picsum.photos/900/600?image=1060", desc:"Premium leather bag, perfect for work and travel." },
  { id:9, title:"Cookbook: 100 Recipes", owner:"KitchenPro", price:34, category:"books", img:"https://picsum.photos/900/600?image=1065", desc:"Delicious recipes from around the world for home cooks." },
  { id:10,title:"Noise Cancelling Headphones", owner:"SoundMax", price:249, category:"electronics", img:"https://picsum.photos/900/600?image=1070", desc:"Over-ear headphones with studio-grade sound and deep ANC." },
  { id:11,title:"Yoga Mat Pro", owner:"FlexWell", price:59, category:"fashion", img:"https://picsum.photos/900/600?image=1080", desc:"Eco-friendly yoga mat with great grip and cushioning." },
  { id:12,title:"Travel Guide: Europe", owner:"WanderBooks", price:19, category:"books", img:"https://picsum.photos/900/600?image=1090", desc:"Compact travel guide covering top European destinations." }
];

/* =========================
   State & DOM refs
   ========================= */
let state = {
  query: '',
  category: 'all',
  sort: 'featured',
  pageSize: 9,
  page: 1,
  list: [...PRODUCTS] // filtered & sorted
};

const refs = {
  grid: document.getElementById('grid'),
  resultCount: document.getElementById('resultCount'),
  pagination: document.getElementById('pagination'),
  searchInput: document.getElementById('searchInput'),
  clearSearch: document.getElementById('clearSearch'),
  sortSelect: document.getElementById('sortSelect'),
  pageSize: document.getElementById('pageSize'),
  filters: document.querySelectorAll('[data-cat]'),
  cartToggle: document.getElementById('cartToggle'),
  cartCount: document.getElementById('cartCount'),
  cartDrawer: document.getElementById('cartDrawer'),
  closeCart: document.getElementById('closeCart'),
  cartList: document.getElementById('cartList'),
  cartTotal: document.getElementById('cartTotal'),
  checkoutBtn: document.getElementById('checkoutBtn'),
  productModal: document.getElementById('productModal'),
  modalClose: document.getElementById('modalClose'),
  modalImg: document.getElementById('modalImg'),
  modalTitle: document.getElementById('modalTitle'),
  modalOwner: document.getElementById('modalOwner'),
  modalPrice: document.getElementById('modalPrice'),
  modalDesc: document.getElementById('modalDesc'),
  modalAdd: document.getElementById('modalAdd'),
  modalCloseBtn: document.getElementById('modalCloseBtn')
};

/* =========================
   Cart (persistent via localStorage)
   Structure: { productId: qty, ... }
   ========================= */
const CART_KEY = 'apex_cart_v1';
function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}
function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
let CART = loadCart();

/* =========================
   Utilities
   ========================= */
function money(n){ return '$' + Number(n).toFixed(2); }
function clampPage(p, totalPages){ if(p<1) return 1; if(p>totalPages) return totalPages; return p; }

/* =========================
   Filtering / Sorting / Pagination
   ========================= */
function applyFiltersAndSort(){
  // start from full PRODUCTS
  let list = [...PRODUCTS];

  // category filter
  if(state.category !== 'all'){
    list = list.filter(p => p.category === state.category);
  }

  // search
  if(state.query.trim() !== ''){
    const q = state.query.trim().toLowerCase();
    list = list.filter(p => (
      p.title.toLowerCase().includes(q) ||
      p.owner.toLowerCase().includes(q) ||
      (p.desc && p.desc.toLowerCase().includes(q))
    ));
  }

  // sort
  if(state.sort === 'name-asc') list.sort((a,b)=> a.title.localeCompare(b.title));
  else if(state.sort === 'name-desc') list.sort((a,b)=> b.title.localeCompare(a.title));
  else if(state.sort === 'price-asc') list.sort((a,b)=> a.price - b.price);
  else if(state.sort === 'price-desc') list.sort((a,b)=> b.price - a.price);
  else {
    // featured: keep original order but you could shuffle or prioritize
    list = list;
  }

  state.list = list;
  state.page = clampPage(state.page, Math.max(1, Math.ceil(list.length / state.pageSize)));
}

/* =========================
   Render products (current page)
   ========================= */
function renderProducts(){
  applyFiltersAndSort();
  const start = (state.page - 1) * state.pageSize;
  const pageItems = state.list.slice(start, start + state.pageSize);

  refs.grid.innerHTML = '';
  refs.resultCount.textContent = state.list.length;

  if(pageItems.length === 0){
    refs.grid.innerHTML = `<div style="grid-column:1/-1;padding:28px;text-align:center;color:#64748b">No products match your filters.</div>`;
    renderPagination();
    return;
  }

  pageItems.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="media" role="img" aria-label="${escapeHtml(p.title)}">
        <img loading="lazy" src="${p.img}" alt="${escapeHtml(p.title)}">
      </div>
      <div class="card-body">
        <div>
          <div class="title">${escapeHtml(p.title)}</div>
          <div class="owner">${escapeHtml(p.owner)}</div>
        </div>
        <div class="bottom">
          <div class="price">${money(p.price)}</div>
          <div style="display:flex; gap:8px;">
            <button class="btn ghost view-btn" data-id="${p.id}">View</button>
            <button class="btn add-btn" data-id="${p.id}">Add</button>
          </div>
        </div>
      </div>
    `;
    // card click opens modal
    card.querySelector('.view-btn').addEventListener('click', (e)=>{
      e.stopPropagation();
      openModal(p.id);
    });
    card.querySelector('.add-btn').addEventListener('click', (e)=>{
      e.stopPropagation();
      addToCart(p.id, 1);
    });
    refs.grid.appendChild(card);
  });

  renderPagination();
}

/* =========================
   Pagination render & handlers
   ========================= */
function renderPagination(){
  const total = state.list.length;
  const pageSize = state.pageSize;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const container = refs.pagination;
  container.innerHTML = '';

  // helper to create page button
  function pageBtn(label, page, isActive=false){
    const b = document.createElement('button');
    b.className = 'page-btn' + (isActive ? ' active' : '');
    b.textContent = label;
    b.addEventListener('click', ()=> {
      state.page = page;
      renderProducts();
      window.scrollTo({top:120, behavior:'smooth'});
    });
    return b;
  }

  // prev
  if(state.page > 1) container.appendChild(pageBtn('Prev', state.page-1));
  // page numbers (show up to 7)
  let start = Math.max(1, state.page - 3);
  let end = Math.min(totalPages, state.page + 3);
  if(end - start < 6){
    start = Math.max(1, end - 6);
    end = Math.min(totalPages, start + 6);
  }
  for(let i=start;i<=end;i++){
    container.appendChild(pageBtn(i, i, i===state.page));
  }
  if(state.page < totalPages) container.appendChild(pageBtn('Next', state.page+1));
}

/* =========================
   Search / sort / filter UI wiring
   ========================= */
refs.searchInput.addEventListener('input', (e)=>{
  state.query = e.target.value;
  refs.clearSearch.style.display = state.query ? 'inline-block' : 'none';
  state.page = 1;
  renderProducts();
});
refs.clearSearch.addEventListener('click', ()=> {
  refs.searchInput.value = '';
  refs.clearSearch.style.display = 'none';
  state.query = '';
  state.page = 1;
  renderProducts();
});

refs.sortSelect.addEventListener('change', (e)=>{
  state.sort = e.target.value;
  state.page = 1;
  renderProducts();
});
refs.pageSize.addEventListener('change', (e)=>{
  state.pageSize = Number(e.target.value);
  state.page = 1;
  renderProducts();
});
refs.filters.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    refs.filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.category = btn.getAttribute('data-cat');
    state.page = 1;
    renderProducts();
  });
});

/* =========================
   Modal (product detail)
   ========================= */
function openModal(id){
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  refs.modalImg.src = p.img;
  refs.modalImg.alt = p.title;
  refs.modalTitle.textContent = p.title;
  refs.modalOwner.textContent = 'By ' + p.owner;
  refs.modalPrice.textContent = money(p.price);
  refs.modalDesc.textContent = p.desc;
  refs.productModal.classList.add('open');
  refs.productModal.setAttribute('aria-hidden','false');

  // set modal Add button behavior
  refs.modalAdd.onclick = ()=>{ addToCart(p.id,1); };
}
refs.modalClose.addEventListener('click', closeModal);
refs.modalCloseBtn.addEventListener('click', closeModal);
refs.productModal.addEventListener('click', (e)=> { if(e.target === refs.productModal) closeModal(); });
document.addEventListener('keydown', (e)=> { if(e.key === 'Escape') closeModal(); });
function closeModal(){
  refs.productModal.classList.remove('open');
  refs.productModal.setAttribute('aria-hidden','true');
}

/* =========================
   Cart functions
   ========================= */
function cartCountTotal(){
  return Object.values(CART).reduce((s,n)=>s+n,0);
}
function cartTotalPrice(){
  let total = 0;
  for(const idStr in CART){
    const id = Number(idStr);
    const p = PRODUCTS.find(x=>x.id===id);
    if(p) total += p.price * CART[idStr];
  }
  return total;
}
function updateCartUI(){
  const count = cartCountTotal();
  if(count>0){
    refs.cartCount.style.display = 'flex';
    refs.cartCount.textContent = count;
  } else {
    refs.cartCount.style.display = 'none';
  }
  // render cart list
  const list = refs.cartList;
  list.innerHTML = '';
  const ids = Object.keys(CART);
  if(ids.length === 0){
    list.innerHTML = `<div style="padding:18px;color:#64748b">Your cart is empty.</div>`;
  } else {
    ids.forEach(idStr=>{
      const id = Number(idStr);
      const p = PRODUCTS.find(x=>x.id===id);
      const qty = CART[idStr];
      if(!p) return;
      const item = document.createElement('div');
      item.className = 'cart-item';
      item.innerHTML = `
        <img src="${p.img}" alt="${escapeHtml(p.title)}">
        <div class="meta">
          <div class="nm">${escapeHtml(p.title)}</div>
          <div style="display:flex;gap:12px;align-items:center;margin-top:6px">
            <div class="pr">${money(p.price)}</div>
            <div class="qty">
              <button data-action="dec" data-id="${id}">−</button>
              <div style="min-width:26px;text-align:center">${qty}</div>
              <button data-action="inc" data-id="${id}">+</button>
              <button data-action="remove" data-id="${id}" style="margin-left:8px;background:transparent;border:none;color:#ef4444;cursor:pointer">Remove</button>
            </div>
          </div>
        </div>
      `;
      // actions
      item.querySelectorAll('button[data-action]').forEach(btn=>{
        btn.addEventListener('click', (e)=>{
          const act = btn.getAttribute('data-action');
          const pid = btn.getAttribute('data-id');
          handleCartAction(act, Number(pid));
        });
      });
      list.appendChild(item);
    });
  }
  refs.cartTotal.textContent = money(cartTotalPrice());
}

function handleCartAction(action, pid){
  const key = String(pid);
  if(action === 'inc'){ CART[key] = (CART[key] || 0) + 1; }
  else if(action === 'dec'){ CART[key] = Math.max(0, (CART[key] || 0) - 1); if(CART[key] === 0) delete CART[key]; }
  else if(action === 'remove'){ delete CART[key]; }
  saveCart(CART);
  updateCartUI();
}

/* Add to cart with simple animation (text feedback) */
function addToCart(pid, qty=1){
  const key = String(pid);
  CART[key] = (CART[key] || 0) + qty;
  saveCart(CART);
  updateCartUI();
  // small visual feedback: open drawer briefly
  refs.cartDrawer.classList.add('open');
  refs.cartDrawer.setAttribute('aria-hidden','false');
  setTimeout(()=>{ refs.cartDrawer.classList.remove('open'); refs.cartDrawer.setAttribute('aria-hidden','true'); }, 900);
}

/* Cart toggle handlers */
refs.cartToggle.addEventListener('click', ()=>{
  refs.cartDrawer.classList.toggle('open');
  const open = refs.cartDrawer.classList.contains('open');
  refs.cartDrawer.setAttribute('aria-hidden', String(!open));
});
refs.closeCart.addEventListener('click', ()=>{ refs.cartDrawer.classList.remove('open'); refs.cartDrawer.setAttribute('aria-hidden','true'); });

refs.checkoutBtn.addEventListener('click', ()=>{
  if(Object.keys(CART).length === 0){ alert('Your cart is empty.'); return; }
  // Simulate checkout
  alert('Checkout simulated — thank you for your order!');
  CART = {}; saveCart(CART); updateCartUI();
  refs.cartDrawer.classList.remove('open');
  refs.cartDrawer.setAttribute('aria-hidden','true');
});

/* =========================
   Helpers & init
   ========================= */
function escapeHtml(str){
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* Restore UI from saved state */
function init(){
  // set initial UI from state controls (sort/pageSize)
  refs.sortSelect.value = state.sort;
  refs.pageSize.value = state.pageSize;
  // wire initial category active
  refs.filters.forEach(btn=>{
    if(btn.getAttribute('data-cat') === state.category) btn.classList.add('active');
  });
  // load cart
  CART = loadCart();
  updateCartUI();
  renderProducts();
}

/* Keyboard accessibility: Enter on focused card -> open modal */
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter'){
    const active = document.activeElement;
    if(active && active.classList.contains('card')){
      // find index among rendered page
      const cards = Array.from(document.querySelectorAll('.card'));
      const idx = cards.indexOf(active);
      const globalIndex = (state.page - 1) * state.pageSize + idx;
      const p = state.list[globalIndex];
      if(p) openModal(p.id);
    }
  }
});

init();
