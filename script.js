// ==============================
// 1. PRODUCT DATA
// ==============================

const products = [
    {
        id: 1,
        name: "Wireless Headphones",
        price: 3500,
        category: "Electronics",
        rating: 4.8,
        badge: "POPULAR",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 2,
        name: "Smart Watch",
        price: 4500,
        category: "Electronics",
        rating: 4.6,
        badge: "TRENDING",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 3,
        name: "Casual T-Shirt",
        price: 1800,
        category: "Fashion",
        rating: 4.5,
        badge: "NEW",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 4,
        name: "Running Shoes",
        price: 5000,
        category: "Fashion",
        rating: 4.9,
        badge: "POPULAR",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 5,
        name: "Stylish Sunglasses",
        price: 1200,
        category: "Accessories",
        rating: 4.4,
        badge: "DEAL",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 6,
        name: "Everyday Backpack",
        price: 2500,
        category: "Accessories",
        rating: 4.7,
        badge: "NEW",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"
    }
];

// ==============================
// 2. APP STATE
// ==============================

function loadSavedData(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
        return fallback;
    }
}

let cart = loadSavedData("shopeaseCart", []);
let wishlist = loadSavedData("shopeaseWishlist", []);
let currentCategory = "All";
let discountApplied = false;

const currency = amount =>
    Math.round(amount).toLocaleString("en-PK");

function saveData() {
    try {
        localStorage.setItem("shopeaseCart", JSON.stringify(cart));
        localStorage.setItem("shopeaseWishlist", JSON.stringify(wishlist));
    } catch (error) {
        console.warn("Browser storage is unavailable.");
    }
}

// Remove invalid IDs and quantities from old saved data.
cart = cart.filter(item =>
    products.some(product => product.id === Number(item.id)) &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
);

wishlist = [...new Set(wishlist.map(Number))]
    .filter(id => products.some(product => product.id === id));

saveData();

// ==============================
// 3. TOAST MESSAGE
// ==============================

function showToast(message) {
    document.getElementById("toastMessage").textContent = message;

    const toastElement = document.getElementById("shopToast");
    const toast = bootstrap.Toast.getOrCreateInstance(toastElement);

    toast.show();
}

// ==============================
// 4. DISPLAY PRODUCTS
// ==============================

function displayProducts(list) {
    const container = document.getElementById("productContainer");
    const resultsText = document.getElementById("resultsText");

    resultsText.textContent =
        `Showing ${list.length} of ${products.length} products`;

    if (list.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <i class="bi bi-search"></i>
                    <h4>No products found</h4>
                    <p>Try another search or category.</p>
                    <button class="btn btn-primary" onclick="resetFilters()">
                        Show all products
                    </button>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = list.map(product => `
        <div class="col-6 col-md-4">
            <article class="product-card">
                <div class="product-image-wrap">
                    <img
                        src="${product.image}"
                        class="product-img"
                        alt="${product.name}"
                        loading="lazy">

                    <span class="product-badge">${product.badge}</span>

                    <button
                        class="wishlist-btn ${wishlist.includes(product.id) ? "saved" : ""}"
                        onclick="toggleWishlist(${product.id})"
                        aria-label="Toggle ${product.name} wishlist">
                        <i class="bi ${wishlist.includes(product.id) ? "bi-heart-fill" : "bi-heart"}"></i>
                    </button>
                </div>

                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h5>${product.name}</h5>

                    <div class="product-rating">
                        <i class="bi bi-star-fill"></i>
                        ${product.rating}
                        <span>(Demo rating)</span>
                    </div>

                    <div class="product-bottom">
                        <span class="product-price">
                            Rs. ${currency(product.price)}
                        </span>

                        <button class="add-btn"
                            onclick="addToCart(${product.id})">
                            <i class="bi bi-bag-plus"></i> Add
                        </button>
                    </div>
                </div>
            </article>
        </div>
    `).join("");
}

// ==============================
// 5. FILTER, SEARCH AND SORT
// ==============================

function updateProducts() {
    const search = document.getElementById("searchInput")
        .value.trim().toLowerCase();

    const sort = document.getElementById("sortSelect").value;

    let filtered = products.filter(product => {
        const matchesCategory =
            currentCategory === "All" ||
            product.category === currentCategory;

        const matchesSearch =
            product.name.toLowerCase().includes(search) ||
            product.category.toLowerCase().includes(search);

        return matchesCategory && matchesSearch;
    });

    if (sort === "low") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sort === "high") {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sort === "name") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    displayProducts(filtered);
}

function filterProducts(category) {
    currentCategory = category;

    document.querySelectorAll(".filter-btn").forEach(button => {
        button.classList.toggle(
            "active",
            button.textContent.trim() === category
        );
    });

    document.getElementById("searchInput").value = "";

    updateProducts();

    document.getElementById("products").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function resetFilters() {
    currentCategory = "All";
    document.getElementById("searchInput").value = "";
    document.getElementById("sortSelect").value = "default";

    document.querySelectorAll(".filter-btn").forEach(button => {
        button.classList.toggle(
            "active",
            button.textContent.trim() === "All"
        );
    });

    updateProducts();
}

// ==============================
// 6. CART FUNCTIONS
// ==============================

function addToCart(id) {
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id, quantity: 1 });
    }

    saveData();
    updateCart();

    showToast("Product added to your cart!");
}

function changeQuantity(id, amount) {
    const item = cart.find(item => item.id === id);

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        cart = cart.filter(item => item.id !== id);
    }

    saveData();
    updateCart();
    showCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);

    saveData();
    updateCart();
    showCart();

    showToast("Product removed from cart.");
}

function getCartCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

function calculateSubtotal() {
    return cart.reduce((total, item) => {
        const product = products.find(p => p.id === item.id);

        return product
            ? total + product.price * item.quantity
            : total;
    }, 0);
}

function getDiscount() {
    return discountApplied ? calculateSubtotal() * 0.10 : 0;
}

function calculateTotal() {
    return calculateSubtotal() - getDiscount();
}

function updateCart() {
    document.getElementById("cartCount").textContent = getCartCount();

    document.getElementById("cartSubtotal").textContent =
        currency(calculateSubtotal());

    document.getElementById("discountAmount").textContent =
        "Rs. " + currency(getDiscount());

    document.getElementById("cartTotal").textContent =
        currency(calculateTotal());

    document.getElementById("checkoutTotal").textContent =
        currency(calculateTotal());

    const cartItems = document.getElementById("cartItems");

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-bag"></i>
                <h5>Your cart is empty</h5>
                <p>Add your favourite products to get started.</p>
            </div>
        `;

        discountApplied = false;
        document.getElementById("couponMessage").textContent = "";

        document.getElementById("cartSubtotal").textContent = "0";
        document.getElementById("discountAmount").textContent = "Rs. 0";
        document.getElementById("cartTotal").textContent = "0";
        document.getElementById("checkoutTotal").textContent = "0";

        return;
    }

    cartItems.innerHTML = cart.map(item => {
        const product = products.find(p => p.id === item.id);

        if (!product) return "";

        return `
            <div class="cart-line">
                <img src="${product.image}" alt="${product.name}">

                <div class="cart-line-details">
                    <strong>${product.name}</strong>
                    <small>Rs. ${currency(product.price)} each</small>

                    <div class="quantity-control">
                        <button onclick="changeQuantity(${product.id}, -1)"
                                aria-label="Decrease quantity">−</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity(${product.id}, 1)"
                                aria-label="Increase quantity">+</button>
                    </div>
                </div>

                <div class="text-end">
                    <strong>Rs. ${currency(product.price * item.quantity)}</strong>
                    <button class="remove-btn d-block ms-auto"
                            onclick="removeFromCart(${product.id})">
                        Remove
                    </button>
                </div>
            </div>
        `;
    }).join("");

    document.getElementById("discountAmount").textContent =
        "Rs. " + currency(getDiscount());

    document.getElementById("cartTotal").textContent =
        currency(calculateTotal());

    document.getElementById("checkoutTotal").textContent =
        currency(calculateTotal());
}

function showCart() {
    updateCart();

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById("cartModal")
    ).show();
}

// ==============================
// 7. COUPON
// ==============================

function applyCoupon() {
    const code = document.getElementById("couponInput")
        .value.trim().toUpperCase();

    const message = document.getElementById("couponMessage");

    if (cart.length === 0) {
        discountApplied = false;
        message.textContent = "Add products before applying a coupon.";
        message.style.color = "#dc4770";
    } else if (code === "SAVE10") {
        discountApplied = true;
        message.textContent = "Success! 10% discount applied.";
        message.style.color = "#1b9b67";
    } else {
        discountApplied = false;
        message.textContent = "Invalid coupon code. Try SAVE10.";
        message.style.color = "#dc4770";
    }

    updateCart();
}

// ==============================
// 8. WISHLIST
// ==============================

function toggleWishlist(id) {
    if (wishlist.includes(id)) {
        wishlist = wishlist.filter(item => item !== id);
        showToast("Removed from wishlist.");
    } else {
        wishlist.push(id);
        showToast("Added to wishlist!");
    }

    saveData();

    document.getElementById("wishlistCount").textContent =
        wishlist.length;

    updateProducts();
}

function showWishlist() {
    const container = document.getElementById("wishlistItems");

    const savedProducts = products.filter(product =>
        wishlist.includes(product.id)
    );

    if (savedProducts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-heart"></i>
                <h5>Your wishlist is empty</h5>
                <p>Tap the heart on a product to save it.</p>
            </div>
        `;
    } else {
        container.innerHTML = savedProducts.map(product => `
            <div class="wishlist-line">
                <img src="${product.image}" alt="${product.name}">

                <div class="wishlist-details">
                    <strong>${product.name}</strong>
                    <small>Rs. ${currency(product.price)}</small>
                </div>

                <button class="btn btn-sm btn-primary"
                        onclick="addToCart(${product.id})">
                    Add
                </button>

                <button class="remove-btn"
                        onclick="toggleWishlist(${product.id}); showWishlist();">
                    Remove
                </button>
            </div>
        `).join("");
    }

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById("wishlistModal")
    ).show();
}

// ==============================
// 9. DARK / LIGHT THEME
// ==============================

function applyTheme(isDark) {
    document.body.classList.toggle("dark-theme", isDark);

    document.getElementById("themeBtn").innerHTML = isDark
        ? '<i class="bi bi-sun"></i>'
        : '<i class="bi bi-moon-stars"></i>';

    document.getElementById("themeBtn").title =
        isDark ? "Switch to light theme" : "Switch to dark theme";
}

function toggleTheme() {
    const isDark = !document.body.classList.contains("dark-theme");

    applyTheme(isDark);

    try {
        localStorage.setItem("shopeaseTheme", isDark ? "dark" : "light");
    } catch (error) {
        // Theme still works for the current page session.
    }
}

// ==============================
// 10. DEMO CHECKOUT
// ==============================

function checkout() {
    if (cart.length === 0) {
        showToast("Your cart is empty.");
        return;
    }

    document.getElementById("checkoutTotal").textContent =
        currency(calculateTotal());

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById("cartModal")
    ).hide();

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById("checkoutModal")
    ).show();
}

document.getElementById("checkoutForm").addEventListener("submit", function(event) {
    event.preventDefault();

    if (!this.checkValidity() || cart.length === 0) {
        this.reportValidity();
        return;
    }

    const orderNumber = "SE" + Date.now().toString().slice(-8);

    alert(
        "Demo order created successfully!\n\n" +
        "Order ID: " + orderNumber +
        "\nTotal: Rs. " + currency(calculateTotal()) +
        "\n\nThis is a demonstration only. No real order or payment was processed."
    );

    cart = [];
    discountApplied = false;

    document.getElementById("couponInput").value = "";
    document.getElementById("couponMessage").textContent = "";

    saveData();
    updateCart();

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById("checkoutModal")
    ).hide();

    this.reset();
});

// ==============================
// 11. NEWSLETTER DEMO
// ==============================

document.getElementById("newsletterForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("newsletterEmail").value.trim();

    if (!email) return;

    showToast("Demo subscription submitted!");

    this.reset();
});

// ==============================
// 12. INITIALIZE WEBSITE
// ==============================

document.getElementById("searchInput").addEventListener("input", updateProducts);
document.getElementById("sortSelect").addEventListener("change", updateProducts);

try {
    applyTheme(localStorage.getItem("shopeaseTheme") === "dark");
} catch (error) {
    applyTheme(false);
}

document.getElementById("wishlistCount").textContent = wishlist.length;

displayProducts(products);
updateCart();