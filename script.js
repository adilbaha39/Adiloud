// Données produits (à adapter pour un vrai site)
const products = [
  {
    id: 1,
    name: "Apex Chrono",
    price: 14999,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop",
    description: "Chronographe automatique suisse, boîtier acier 42mm, étanche 100m.",
    features: ["Mouvement automatique", "Verre saphir", "Bracelet cuir véritable"]
  },
  {
    id: 2,
    name: "Luna Élégance",
    price: 18900,
    image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=1974&auto=format&fit=crop",
    description: "Montre pour femme en or rose 18 carats, cadran nacre, diamants index.",
    features: ["Boîtier 36mm", "Mouvement quartz", "Étanche 30m"]
  },
  {
    id: 3,
    name: "Nuit Dorée",
    price: 22499,
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1974&auto=format&fit=crop",
    description: "Édition limitée avec cadran noir soleillé, lunette en or massif.",
    features: ["Édition limitée", "Mouvement automatique", "Bracelet acier"]
  },
  {
    id: 4,
    name: "Voyager GMT",
    price: 27500,
    image: "https://images.unsplash.com/photo-1559563458-527698bc47be?q=80&w=2070&auto=format&fit=crop",
    description: "GMT idéale pour les voyageurs, double fuseau horaire, design épuré.",
    features: ["Fonction GMT", "Boîtier titane", "Étanche 200m"]
  }
];

// Panier
let cart = JSON.parse(localStorage.getItem('adiloud_cart')) || [];

// Éléments DOM
const pages = {
  home: document.getElementById('home-page'),
  shop: document.getElementById('shop-page'),
  detail: document.getElementById('detail-page'),
  cart: document.getElementById('cart-page')
};

const navButtons = document.querySelectorAll('[data-page]');
const featuredContainer = document.getElementById('featured-products');
const allProductsContainer = document.getElementById('all-products');
const detailContainer = document.getElementById('product-detail-container');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartCountSpan = document.getElementById('cart-count');
const cartTotalSpan = document.getElementById('cart-total');
const cartSummary = document.getElementById('cart-summary');

// Navigation
function navigateTo(pageId) {
  Object.keys(pages).forEach(key => pages[key].classList.remove('active'));
  pages[pageId].classList.add('active');
  // Mise à jour boutons nav actifs
  navButtons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.page === pageId) btn.classList.add('active');
  });
  window.scrollTo(0, 0);
}

navButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const page = btn.dataset.page;
    if (page === 'cart') {
      renderCart();
    }
    if (page === 'shop' || page === 'home') {
      // re-render products
      renderProducts();
    }
    navigateTo(page);
  });
});

// Boutons dans la page
document.addEventListener('click', (e) => {
  if (e.target.dataset.page) {
    const page = e.target.dataset.page;
    if (page === 'cart') renderCart();
    navigateTo(page);
  }
});

// Fonction pour créer une carte produit
function createProductCard(product, showDetailLink = true) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}" loading="lazy">
    <div class="info">
      <h3>${product.name}</h3>
      <p class="price">${product.price.toLocaleString()} MAD</p>
      <div class="card-buttons">
        <button class="add-to-cart-btn" data-id="${product.id}">Ajouter au panier</button>
        <button class="order-wa-btn" data-id="${product.id}">Commander WhatsApp</button>
      </div>
    </div>
  `;
  
  // Ajouter écouteurs
  card.querySelector('.add-to-cart-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    addToCart(product.id);
  });
  
  card.querySelector('.order-wa-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    orderOnWhatsApp([product.id]);
  });
  
  if (showDetailLink) {
    card.addEventListener('click', (e) => {
      // Évite de déclencher si on clique sur les boutons
      if (e.target.tagName === 'BUTTON') return;
      showProductDetail(product.id);
    });
    card.style.cursor = 'pointer';
  }
  
  return card;
}

// Afficher tous les produits (boutique + featured)
function renderProducts() {
  if (featuredContainer) {
    featuredContainer.innerHTML = '';
    products.slice(0, 3).forEach(p => {
      featuredContainer.appendChild(createProductCard(p, true));
    });
  }
  if (allProductsContainer) {
    allProductsContainer.innerHTML = '';
    products.forEach(p => {
      allProductsContainer.appendChild(createProductCard(p, true));
    });
  }
}

// Afficher détail produit
function showProductDetail(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  navigateTo('detail');
  detailContainer.innerHTML = `
    <div class="product-detail">
      <img src="${product.image}" alt="${product.name}">
      <div class="detail-info">
        <h2>${product.name}</h2>
        <p class="detail-price">${product.price.toLocaleString()} MAD</p>
        <p class="detail-desc">${product.description}</p>
        <ul style="list-style: none; margin-bottom: 1.5rem;">
          ${product.features.map(f => `<li>✦ ${f}</li>`).join('')}
        </ul>
        <div class="detail-buttons">
          <button class="gold-btn add-to-cart-btn" data-id="${product.id}">Ajouter au panier</button>
          <button class="gold-btn order-wa-btn" data-id="${product.id}">Commander sur WhatsApp</button>
        </div>
      </div>
    </div>
  `;
  // Réattacher les événements
  detailContainer.querySelector('.add-to-cart-btn').addEventListener('click', () => addToCart(product.id));
  detailContainer.querySelector('.order-wa-btn').addEventListener('click', () => orderOnWhatsApp([product.id]));
}

// Gestion du panier
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  updateCartCount();
  // petite animation de feedback
  alert(`${product.name} ajouté au panier`);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartCount();
  renderCart();
}

function saveCart() {
  localStorage.setItem('adiloud_cart', JSON.stringify(cart));
}

function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCountSpan) cartCountSpan.textContent = totalItems;
}

function renderCart() {
  if (!cartItemsContainer) return;
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart">Votre panier est vide.</p>';
    cartSummary.style.display = 'none';
  } else {
    let html = '';
    let total = 0;
    cart.forEach(item => {
      total += item.price * item.quantity;
      html += `
        <div class="product-card" style="margin-bottom:0.5rem;">
          <img src="${item.image}" alt="${item.name}">
          <div class="cart-item-details">
            <h3>${item.name}</h3>
            <p>${item.price.toLocaleString()} MAD x ${item.quantity}</p>
          </div>
          <button class="remove-btn" data-id="${item.id}">Supprimer</button>
        </div>
      `;
    });
    cartItemsContainer.innerHTML = html;
    cartTotalSpan.textContent = total.toLocaleString();
    cartSummary.style.display = 'block';
    
    // Attacher les suppressions
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(btn.dataset.id);
        removeFromCart(id);
      });
    });
  }
}

// Commande WhatsApp
function orderOnWhatsApp(productIds) {
  const selectedProducts = products.filter(p => productIds.includes(p.id));
  if (selectedProducts.length === 0) return;
  
  let message = "Bonjour ADILOUD, je souhaite commander :%0A";
  selectedProducts.forEach(p => {
    message += `- ${p.name} : ${p.price} MAD%0A`;
  });
  message += "%0A*Mes informations :*%0A";
  message += "Nom complet : %0A";
  message += "Ville : %0A";
  message += "Adresse : %0A";
  message += "%0AMerci";
  
  const waUrl = `https://wa.me/212714587749?text=${message}`;
  window.open(waUrl, '_blank');
}

// Checkout depuis le panier
document.getElementById('checkout-btn')?.addEventListener('click', () => {
  if (cart.length === 0) return;
  const productIds = cart.map(item => item.id);
  orderOnWhatsApp(productIds);
});

// Initialisation
function init() {
  renderProducts();
  updateCartCount();
  // page par défaut : home
  navigateTo('home');
}

init();
