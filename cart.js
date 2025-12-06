// Simple client-side store & cart (localStorage)
const PRODUCTS_URL = 'products.json';

let products = [];
const cartKey = 'gh_store_cart';

async function loadProducts(){
  const res = await fetch(PRODUCTS_URL);
  products = await res.json();
  renderProducts();
  updateCartCount();
}

function renderProducts(){
  const container = document.getElementById('products');
  container.innerHTML = '';
  products.forEach(p => {
    const el = document.createElement('div');
    el.className = 'product';
    el.innerHTML = `
      <img src="${p.image}" alt="${p.title}">
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
      <div class="price">$${p.price.toFixed(2)}</div>
      <button class="btn" data-id="${p.id}">Add to cart</button>
    `;
    container.appendChild(el);
  });

  container.querySelectorAll('button.btn').forEach(btn => {
    btn.addEventListener('click', e => {
      addToCart(e.target.dataset.id);
    });
  });
}

function getCart(){
  return JSON.parse(localStorage.getItem(cartKey) || '[]');
}

function saveCart(c){ localStorage.setItem(cartKey, JSON.stringify(c)); }

function addToCart(id){
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if(item) item.qty++;
  else cart.push({id, qty:1});
  saveCart(cart);
  updateCartCount();
  alert('Added to cart');
}

function updateCartCount(){
  const cart = getCart();
  const count = cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById('cart-count').textContent = count;
}

function openCart(){
  const modal = document.getElementById('cart-modal');
  modal.classList.remove('hidden');
  renderCartItems();
}

function closeCart(){ document.getElementById('cart-modal').classList.add('hidden'); }

function renderCartItems(){
  const container = document.getElementById('cart-items');
  const cart = getCart();
  container.innerHTML = '';
  let total = 0;
  cart.forEach(ci => {
    const p = products.find(x=>x.id===ci.id);
    if(!p) return;
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <img src="${p.image}" alt="${p.title}">
      <div>
        <div><strong>${p.title}</strong></div>
        <div>Qty: ${ci.qty} • $${(p.price * ci.qty).toFixed(2)}</div>
      </div>
      <div>
        <button class="btn remove" data-id="${ci.id}">Remove</button>
      </div>
    `;
    container.appendChild(el);
    total += p.price * ci.qty;
  });

  document.getElementById('cart-total').textContent = total.toFixed(2);

  container.querySelectorAll('.remove').forEach(b => {
    b.addEventListener('click', e => {
      removeFromCart(e.target.dataset.id);
    })
  })
}

function removeFromCart(id){
  let cart = getCart();
  cart = cart.filter(i=>i.id !== id);
  saveCart(cart);
  renderCartItems();
  updateCartCount();
}

function checkout(){
  // Simple default action: create a WhatsApp message link to send order
  const cart = getCart();
  if(cart.length === 0){ alert('Cart is empty'); return; }

  const lines = cart.map(ci => {
    const p = products.find(x=>x.id===ci.id);
    return `${p.title} x ${ci.qty} - $${(p.price * ci.qty).toFixed(2)}`;
  });
  let total = cart.reduce((s,ci)=> s + (products.find(p=>p.id===ci.id).price * ci.qty), 0);
  const message = encodeURIComponent(`Order:\n${lines.join('\n')}\nTotal: $${total.toFixed(2)}\nName:\nAddress:\nPhone:`);
  // Replace YOUR_PHONE_NUMBER with country code + number, e.g. 923001234567 for Pakistan
  const whatsappNumber = 'YOUR_PHONE_NUMBER';
  const url = `https://wa.me/${whatsappNumber}?text=${message}`;
  window.open(url, '_blank');
}

document.getElementById('cart-link').addEventListener('click', e => { e.preventDefault(); openCart(); });
document.getElementById('close-cart').addEventListener('click', closeCart);
document.getElementById('checkout-btn').addEventListener('click', checkout);

loadProducts();
