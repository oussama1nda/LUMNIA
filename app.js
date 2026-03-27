// Product Database
const products = [
    { id: 'p2', name: 'Lumnia Eclipse', price: 3200, category: 'smart', image: "Capture d'écran 2026-03-24 200520.png", isBestSeller: true },
    { id: 'p7', name: 'Lumnia Solis', price: 3250, category: 'decorative', image: "Capture d'écran 2026-03-24 200625.png", isNew: true },
    { id: 'p8', name: 'Lumnia Reflection', price: 3500, category: 'decorative', image: "ChatGPT Image Mar 24, 2026, 07_22_30 PM.png" },
    { id: 'p10', name: 'Lumnia Oasis', price: 3700, category: 'smart', image: "WhatsApp Image 2026-03-24 at 18.45.33 (1).jpeg" },
    { id: 'p11', name: 'Lumnia Mirage', price: 3700, category: 'smart', image: "WhatsApp Image 2026-03-24 at 18.45.33 (2).jpeg", isBestSeller: true },
    { id: 'p12', name: 'Lumnia Prism', price: 3650, category: 'smart', image: "WhatsApp Image 2026-03-24 at 18.45.33 (3).jpeg", isNew: true },
    { id: 'p13', name: 'Lumnia Halo', price: 3800, category: 'smart', image: "WhatsApp Image 2026-03-24 at 18.45.33 (4).jpeg" },
];

// App State
const state = {
    cart: [],
    currentRoute: 'home',
    currentProductId: null,
    shopFilter: 'all' // all, smart, decorative
};

// DOM Elements
const appContent = document.getElementById('app-content');
const cartBtn = document.getElementById('cartBtn');
const cartBadge = document.getElementById('cartBadge');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotalAmount = document.getElementById('cartTotalAmount');
const checkoutBtn = document.getElementById('checkoutBtn');
const navLinks = document.querySelectorAll('[data-route]');
const navbar = document.getElementById('navbar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinksContainer = document.querySelector('.nav-links');
// Initialize App
function init() {
    loadCart();
    setupEventListeners();
    
    let initialRoute = 'home';
    if(window.location.hash) {
        const hash = window.location.hash.substring(1);
        if(hash.startsWith('product-')) {
            initialRoute = 'product';
            state.currentProductId = hash.split('-')[1];
        } else {
            initialRoute = hash;
        }
    }
    
    window.history.replaceState({ route: initialRoute, id: state.currentProductId }, '', window.location.hash || '#home');
    navigate(initialRoute, false);
    
    // Smooth scroll effect on navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(10, 10, 10, 0.85)';
            navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        } else {
            navbar.style.background = 'rgba(15, 15, 15, 0.6)';
            navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.15)';
        }
    });
}

// Event Listeners
function setupEventListeners() {
    // Navigation routing
    document.body.addEventListener('click', e => {
        // Router Links
        const routeEl = e.target.closest('[data-route]');
        if (routeEl) {
            e.preventDefault();
            const route = routeEl.getAttribute('data-route');
            const filter = routeEl.getAttribute('data-filter');
            if (filter) {
                state.shopFilter = filter;
            } else {
                state.shopFilter = 'all';
            }
            navigate(route);
            // Close cart and mobile menu if open
            closeCart();
            navLinksContainer.classList.remove('mobile-active');
            // Scroll to top
            window.scrollTo(0,0);
        }

        // Product Cards
        const productEl = e.target.closest('.product-card');
        if (productEl && !e.target.closest('.add-to-cart-quick')) {
            const id = productEl.getAttribute('data-id');
            state.currentProductId = id;
            navigate('product');
            window.scrollTo(0,0);
        }
    });

    // Cart Toggle
    cartBtn.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // Mobile Menu Toggle
    mobileMenuBtn.addEventListener('click', () => {
        navLinksContainer.classList.toggle('mobile-active');
        if(cartDrawer.classList.contains('active')) closeCart();
    });

    // Filter Change in Shop
    document.body.addEventListener('change', e => {
        if (e.target.name === 'category') {
            state.shopFilter = e.target.value;
            renderShop();
        }
    });

    // Browser Native History (Back/Forward)
    window.addEventListener('popstate', e => {
        if (e.state && e.state.route) {
            if(e.state.route === 'product' && e.state.id) {
                state.currentProductId = e.state.id;
            }
            navigate(e.state.route, false);
        } else {
            navigate('home', false);
        }
    });
}

// Router
function navigate(route, pushHistory = true) {
    if (pushHistory) {
        if (route === 'product' && state.currentProductId) {
            window.history.pushState({ route, id: state.currentProductId }, '', '#product-' + state.currentProductId);
        } else {
            window.history.pushState({ route }, '', '#' + route);
        }
    }

    state.currentRoute = route;
    updateActiveNavLinks();
    
    // Apply fade out then fade in with slight vertical movement for premium feel
    appContent.style.opacity = 0;
    appContent.style.transform = 'translateY(15px)';
    
    setTimeout(() => {
        appContent.innerHTML = '';
        switch(route) {
            case 'home': renderHome(); break;
            case 'shop': renderShop(); break;
            case 'product': renderProduct(); break;
            case 'about': renderAbout(); break;
            case 'contact': renderContact(); break;
            case 'faq': renderFAQ(); break;
            case 'checkout': renderCheckout(); break;
            default: renderHome();
        }
        
        // Trigger reflow for animation
        void appContent.offsetWidth;
        appContent.style.opacity = 1;
        appContent.style.transform = 'translateY(0)';
        
        // Setup newly rendered interactive elements
        setupDynamicListeners(route);
    }, 200);
}

function updateActiveNavLinks() {
    navLinks.forEach(link => {
        if(link.getAttribute('data-route') === state.currentRoute) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Format Currency
function formatPrice(price) {
    return price.toLocaleString('en-US', {minimumFractionDigits: 2}) + ' MAD';
}

// Product Card HTML Generator
function getProductCardHTML(product, index = 0) {
    let tags = '';
    if (product.isNew) tags += `<span class="tag">New</span>`;
    else if (product.isBestSeller) tags += `<span class="tag">Bestseller</span>`;

    return `
        <div class="product-card animate-slide-up" data-id="${product.id}" style="animation-delay: ${index * 0.15}s">
            <div class="product-img-wrapper">
                ${tags}
                <img src="${product.image}" alt="${product.name}" class="product-img">
                <div class="product-reflection"></div>
            </div>
            <div class="product-info">
                <h4>${product.name}</h4>
                <div class="product-price">${formatPrice(product.price)}</div>
            </div>
        </div>
    `;
}

// Views
function renderHome() {
    const featured = products.filter(p => p.isNew || p.isBestSeller).slice(0, 4);
    
    appContent.innerHTML = `
        <section class="hero">
            <img src="${products[6].image}" alt="Hero" class="hero-bg">
            <div class="hero-overlay"></div>
            <div class="container hero-content animate-slide-up">
                <h1>Reflect Your<br><span class="text-gradient">True Brilliance.</span></h1>
                <p class="lead">Experience the perfect fusion of minimalist aesthetics and cutting-edge lighting technology.</p>
                <div style="display: flex; gap: 16px;">
                    <button class="btn btn-primary" data-route="shop">Shop Collection</button>
                    <button class="btn btn-glass" data-route="about">Discover Lumnia</button>
                </div>
            </div>
        </section>

        <section class="section container">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px;">
                <h2>Featured Mirrors</h2>
                <a href="#" class="text-gradient" data-route="shop">View all →</a>
            </div>
            <div class="product-grid">
                ${featured.map((p, i) => getProductCardHTML(p, i)).join('')}
            </div>
        </section>

        <section class="section container split-section" style="margin-top: 50px;">
            <div class="animate-slide-up">
                <h2>Intelligence built<br>into your reflection.</h2>
                <p class="lead">Our smart mirrors feature invisible touch controls, integrated defoggers, and adjustable color temperatures to simulate natural sunlight, perfect for flawless routines.</p>
                <ul class="features-list" style="margin-bottom: 32px;">
                    <li><strong>Adaptive LED Tech</strong> 50,000+ hours of continuous daylight-balanced illumination.</li>
                    <li><strong>Ultra-Clear Glass</strong> Copper-free backing prevents edge corrosion over time.</li>
                </ul>
                <button class="btn btn-secondary" data-route="shop" data-filter="smart">Explore Smart Mirrors</button>
            </div>
            <div class="split-img animate-slide-up" style="animation-delay: 0.2s;">
                <img src="${products[1].image}" alt="Smart Mirror detail" class="animate-float">
            </div>
        </section>
    `;
}

function renderShop() {
    const categories = [
        { id: 'all', name: 'All Collection' },
        { id: 'smart', name: 'Smart Mirrors' },
        { id: 'decorative', name: 'Decorative & Wall' }
    ];

    const filtered = state.shopFilter === 'all' 
        ? products 
        : products.filter(p => p.category === state.shopFilter);

    appContent.innerHTML = `
        <div class="container section">
            <div class="page-header animate-slide-up">
                <h1 style="font-size: 3rem; margin-bottom: 16px;">The Collection</h1>
                <p class="lead">Masterfully crafted to elevate your space.</p>
            </div>
            
            <div class="shop-layout">
                <aside class="filters-block animate-slide-up">
                    <h4>Categories</h4>
                    <ul class="filter-list">
                        ${categories.map(cat => `
                            <li>
                                <label class="filter-label">
                                    <input type="radio" name="category" value="${cat.id}" ${state.shopFilter === cat.id ? 'checked' : ''}>
                                    ${cat.name}
                                </label>
                            </li>
                        `).join('')}
                    </ul>
                </aside>
                
                <main>
                    <div class="product-grid" style="margin-top: 0;">
                        ${filtered.map((p, i) => getProductCardHTML(p, i)).join('')}
                    </div>
                </main>
            </div>
        </div>
    `;
}

function renderProduct() {
    const product = products.find(p => p.id === state.currentProductId) || products[0];
    
    // Get 3 similar products for related section
    const related = products.filter(p => p.id !== product.id && p.category === product.category).slice(0, 3);
    if(related.length < 3) related.push(...products.filter(p => p.id !== product.id).slice(0, 3 - related.length));

    appContent.innerHTML = `
        <div class="container section">
            <div class="product-detail animate-slide-up">
                <div class="gallery">
                    <div class="gallery-main">
                        <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">
                        <div class="product-reflection" style="transform: rotate(30deg) translate(20%, 20%); opacity: 0.5;"></div>
                    </div>
                </div>
                
                <div class="p-info">
                    <h1 class="p-title">${product.name}</h1>
                    <div class="p-price">${formatPrice(product.price)}</div>
                    <p class="p-desc">
                        A breathtaking addition to any modern interior. The ${product.name} is engineered with 
                        premium materials to provide crystal-clear reflection and ambient enhancement. 
                        Its minimalist framing and flawless glass surface make it an absolute centerpiece.
                    </p>
                    
                    <div style="margin-bottom: 32px;">
                        <h4 style="margin-bottom: 12px; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary);">Size Options</h4>
                        <div style="display: flex; gap: 12px;">
                            <button class="btn btn-secondary" style="border-color: var(--text-primary);">24" x 36"</button>
                            <button class="btn btn-secondary">30" x 40"</button>
                            <button class="btn btn-secondary">36" x 48"</button>
                        </div>
                    </div>

                    <div class="qty-selector">
                        <button class="qty-btn" id="qtyMinus">-</button>
                        <span id="qtyVal" style="font-weight: 600; width: 30px; text-align: center;">1</span>
                        <button class="qty-btn" id="qtyPlus">+</button>
                    </div>

                    <button class="btn btn-primary add-to-cart-btn" id="addToCartBtn">Add to Cart - ${formatPrice(product.price)}</button>

                    <ul class="features-list">
                        <li>
                            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            <div><strong>Free Premium Shipping</strong> Carefully packaged and fully insured transit.</div>
                        </li>
                        <li>
                            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>
                            <div><strong>5-Year Limited Warranty</strong> Covers all LED components and mirror backing.</div>
                        </li>
                    </ul>
                </div>
            </div>

            <div style="margin-top: 100px;">
                <h2 style="text-align: center; margin-bottom: 48px;">You May Also Like</h2>
                <div class="product-grid">
                    ${related.map((p, i) => getProductCardHTML(p, i)).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderAbout() {
    appContent.innerHTML = `
        <div class="container section animate-slide-up">
            <div class="page-header">
                <h1>About Lumnia</h1>
                <p class="lead">Redefining reflection through technology and design.</p>
            </div>
            
            <div class="split-section" style="margin-top: 64px;">
                <div class="split-img animate-float">
                    <img src="${products[3].image}" alt="Lumnia Design">
                </div>
                <div>
                    <h2>Our Philosophy</h2>
                    <p class="lead">We believe a mirror is more than just glass. It's a portal to how you see yourself, and a crucial design element that brings light and space into a room.</p>
                    <p style="color: var(--text-secondary); margin-bottom: 24px;">Founded in 2024, Lumnia was born from a desire to merge high-end interior aesthetics with smart home capabilities. Every piece we create is rigorously tested for lighting consistency, electrical safety, and material durability.</p>
                    <button class="btn btn-secondary" onclick="navigate('contact'); window.scrollTo(0,0);">Get in Touch</button>
                </div>
            </div>
        </div>
    `;
}

function renderCheckout() {
    const total = state.cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    if (state.cart.length === 0) {
        appContent.innerHTML = `
            <div class="container section animate-slide-up" style="text-align: center;">
                <h2>Your cart is empty</h2>
                <button class="btn btn-primary" style="margin-top: 24px;" onclick="navigate('shop'); window.scrollTo(0,0);">Return to Shop</button>
            </div>
        `;
        return;
    }

    const cartHtml = state.cart.map(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return '';
        return `
            <div style="display: flex; gap: 16px; margin-bottom: 16px;">
                <img src="${product.image}" alt="${product.name}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
                <div style="flex:1;">
                    <div style="font-weight: 500;">${product.name}</div>
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">Qty: ${item.quantity}</div>
                </div>
                <div>${formatPrice(product.price * item.quantity)}</div>
            </div>
        `;
    }).join('');

    appContent.innerHTML = `
        <div class="container section animate-slide-up">
            <div class="page-header">
                <h1>Secure Checkout</h1>
                <p class="lead">Complete your luxury purchase.</p>
            </div>
            
            <div class="product-detail">
                <div>
                    <form class="contact-form" style="max-width: none; margin: 0; padding: 48px;" onsubmit="event.preventDefault(); completePurchase();">
                        <h3 style="margin-bottom: 24px; color: var(--accent-color); font-size: 1.6rem;">1. Shipping Details</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group"><label>First Name</label><input type="text" required></div>
                            <div class="form-group"><label>Last Name</label><input type="text" required></div>
                        </div>
                        <div class="form-group"><label>Address</label><input type="text" required></div>
                        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px;">
                            <div class="form-group"><label>City</label><input type="text" required></div>
                            <div class="form-group"><label>Zip Code</label><input type="text" required></div>
                        </div>
                        
                        <h3 style="margin-bottom: 24px; margin-top: 40px; color: var(--accent-color); font-size: 1.6rem;">2. Payment Information</h3>
                        <div class="form-group"><label>Card Number</label><input type="text" placeholder="XXXX XXXX XXXX XXXX" required></div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group"><label>Expiry Date</label><input type="text" placeholder="MM/YY" required></div>
                            <div class="form-group"><label>CVV</label><input type="text" placeholder="123" required></div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 32px; font-size: 1.2rem; padding: 20px;">Complete Order - ${formatPrice(total)}</button>
                    </form>
                </div>
                
                <aside style="background: var(--surface-light); padding: 32px; border-radius: 24px; height: fit-content; border: 1px solid var(--border-color);">
                    <h3 style="margin-bottom: 24px; font-size: 1.5rem;">Order Summary</h3>
                    <div style="margin-bottom: 24px; max-height: 400px; overflow-y: auto;">
                        ${cartHtml}
                    </div>
                    <div style="border-top: 1px solid var(--border-color); padding-top: 16px; display: flex; justify-content: space-between; font-weight: 600; font-size: 1.35rem;">
                        <span>Total</span>
                        <span style="color: var(--accent-color);">${formatPrice(total)}</span>
                    </div>
                </aside>
            </div>
        </div>
    `;
}

// Global purchase completion
window.completePurchase = function() {
    showToast('Payment successful! Thank you for choosing Lumnia Mirrors.');
    state.cart = [];
    saveCart();
    navigate('home');
    window.scrollTo(0,0);
};

// Global Toast System
window.showToast = function(message) {
    const container = document.getElementById('toastContainer');
    if(!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    
    // Trigger reflow
    void toast.offsetWidth;
    toast.classList.add('show');
    
    // Play subtle sound if desired (omitted for vanilla)
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
};

function renderContact() {
    appContent.innerHTML = `
        <div class="container section animate-slide-up">
            <div class="page-header">
                <h1>Contact Us</h1>
                <p class="lead">We're here to help point you in the brilliant direction.</p>
            </div>
            
            <form class="contact-form" onsubmit="event.preventDefault(); showToast('Message sent successfully. We will get back to you shortly!'); this.reset();">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" required placeholder="Enter your name">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" required placeholder="Enter your email">
                </div>
                <div class="form-group">
                    <label>Subject</label>
                    <input type="text" placeholder="Order Inquiry">
                </div>
                <div class="form-group">
                    <label>Message</label>
                    <textarea rows="5" required placeholder="How can we help?"></textarea>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%">Send Message</button>
            </form>
        </div>
    `;
}

function renderFAQ() {
    appContent.innerHTML = `
        <div class="container section animate-slide-up">
            <div class="page-header">
                <h1>Frequently Asked Questions</h1>
            </div>
            <div style="max-width: 800px; margin: 0 auto;">
                <div style="margin-bottom: 32px;">
                    <h3>How do I wire a smart mirror?</h3>
                    <p style="color: var(--text-secondary); margin-top: 8px;">Our mirrors can be plugged directly into a standard outlet using the included cord, or hardwired by a licensed electrician for a seamless look.</p>
                </div>
                <div style="margin-bottom: 32px;">
                    <h3>What is the return policy?</h3>
                    <p style="color: var(--text-secondary); margin-top: 8px;">We accept returns within 30 days of delivery in pristine condition. Custom sizes are non-refundable.</p>
                </div>
                <div style="margin-bottom: 32px;">
                    <h3>How does the defogger work?</h3>
                    <p style="color: var(--text-secondary); margin-top: 8px;">The integrated heating pad gently warms the surface to prevent condensation during showers. It activates alongside the main light switch or via the touch sensor.</p>
                </div>
            </div>
        </div>
    `;
}

function setupDynamicListeners(route) {
    if (route === 'product') {
        const minus = document.getElementById('qtyMinus');
        const plus = document.getElementById('qtyPlus');
        const val = document.getElementById('qtyVal');
        const addBtn = document.getElementById('addToCartBtn');
        let qty = 1;

        minus.onclick = () => { if(qty > 1) { qty--; val.textContent = qty; } };
        plus.onclick = () => { qty++; val.textContent = qty; };
        
        addBtn.onclick = () => {
            addToCart(state.currentProductId, qty);
            openCart();
        };
    }
}

// Cart Logic
function loadCart() {
    const saved = localStorage.getItem('lumnia_cart');
    if(saved) state.cart = JSON.parse(saved);
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('lumnia_cart', JSON.stringify(state.cart));
    updateCartUI();
}

function addToCart(productId, quantity = 1) {
    const existing = state.cart.find(item => item.id === productId);
    if(existing) {
        existing.quantity += quantity;
    } else {
        state.cart.push({ id: productId, quantity });
    }
    saveCart();
    showToast(`Added to cart - ${quantity} item(s)`);
}

function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.id !== productId);
    saveCart();
}

function updateCartUI() {
    // Update Badge
    const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = count;
    cartBadge.style.display = count > 0 ? 'flex' : 'none';

    // Update Drawer Contents
    if(state.cart.length === 0) {
        cartItemsContainer.innerHTML = `<div class="cart-empty">Your cart is elegantly empty.</div>`;
        cartTotalAmount.textContent = '0.00 MAD';
        checkoutBtn.disabled = true;
        return;
    }

    let total = 0;
    cartItemsContainer.innerHTML = state.cart.map(item => {
        const product = products.find(p => p.id === item.id);
        if(!product) return '';
        total += product.price * item.quantity;
        return `
            <div class="cart-item">
                <img src="${product.image}" class="cart-item-img" alt="${product.name}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${product.name}</div>
                    <div class="cart-item-price">${formatPrice(product.price)}</div>
                    <div class="cart-item-actions">
                        <span style="font-size: 0.9rem; color: var(--text-secondary)">Qty: ${item.quantity}</span>
                        <button class="remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    cartTotalAmount.textContent = formatPrice(total);
    checkoutBtn.disabled = false;
}

function toggleCart() {
    cartDrawer.classList.toggle('active');
    cartOverlay.classList.toggle('active');
}

function openCart() {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
}

function closeCart() {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
}

checkoutBtn.onclick = () => {
    closeCart();
    navigate('checkout');
    window.scrollTo(0,0);
};

// Boostrap
init();
