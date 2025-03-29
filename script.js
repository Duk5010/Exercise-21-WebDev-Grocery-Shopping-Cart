let products = [];
let cart = [];

function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");

  toast.className = `toast ${type}`;
  toastMessage.textContent = message;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

async function loadProducts() {
  try {
    const response = await fetch(
      "https://mdn.github.io/learning-area/javascript/apis/fetching-data/can-store/products.json"
    );
    products = await response.json();

    // Images
    products = products.map((product) => {
      return {
        ...product,
        image: `./images/${product.name
          .toLowerCase()
          .replace(/\s+/g, "-")}.jpg`,
      };
    });

    displayProducts();
  } catch (error) {
    console.error("Error loading products:", error);
    document.getElementById("products-grid").innerHTML = `
             <div class="empty-cart">
                 <i class="fas fa-exclamation-circle"></i>
                 <p>Error loading products. Please try again later.</p>
             </div>
         `;
  }
}

function displayProducts() {
  const productsGrid = document.getElementById("products-grid");
  productsGrid.innerHTML = "";

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";

    productCard.innerHTML = `
             <div class="product-image">
                 <img src="${product.image}" alt="${
      product.name
    }" onerror="this.src='./images/placeholder.jpg'">
             </div>
             <div class="product-info">
                 <div class="product-name">${product.name}</div>
                 <div class="product-price">${formatPrice(product.price)}</div>
                 <button class="add-to-cart" data-id="${product.name}">
                     <i class="fas fa-cart-plus"></i> Add to Cart
                 </button>
             </div>
         `;

    productsGrid.appendChild(productCard);
  });

  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", addToCart);
  });
}

function addToCart(event) {
  const productId = event.currentTarget.getAttribute("data-id");
  const product = products.find((p) => p.name === productId);

  if (!product) return;

  // Check if product is already in cart
  const existingItem = cart.find((item) => item.name === product.name);

  if (existingItem) {
    existingItem.quantity += 1;
    showToast(`Increased ${product.name} quantity to ${existingItem.quantity}`);
  } else {
    cart.push({
      name: product.name,
      price: product.price,
      quantity: 1,
    });
    showToast(`Added ${product.name} to cart`);
  }

  updateCart();
}

// Function to remove an item from cart
function removeFromCart(productName) {
  const item = cart.find((item) => item.name === productName);
  if (item) {
    cart = cart.filter((item) => item.name !== productName);
    showToast(`Removed ${productName} from cart`, "error");
    updateCart();
  }
}

// Function to increase item quantity
function increaseQuantity(productName) {
  const item = cart.find((item) => item.name === productName);
  if (item) {
    item.quantity += 1;
    showToast(`Increased ${productName} quantity to ${item.quantity}`);
    updateCart();
  }
}

// Function to decrease item quantity
function decreaseQuantity(productName) {
  const item = cart.find((item) => item.name === productName);
  if (item && item.quantity > 1) {
    item.quantity -= 1;
    showToast(`Decreased ${productName} quantity to ${item.quantity}`);
    updateCart();
  } else if (item && item.quantity === 1) {
    // If quantity reaches 0, remove the item
    removeFromCart(productName);
  }
}

// Function to remove all items from cart
function removeAllItems() {
  if (cart.length === 0) return;

  const confirmRemove = confirm(
    "Are you sure you want to remove all items from your cart?"
  );
  if (confirmRemove) {
    cart = [];
    showToast("All items removed from cart", "error");
    updateCart();
  }
}

// Function to process purchase
function processPurchase() {
  if (cart.length === 0) return;

  const confirmPurchase = confirm(
    `Complete your purchase of ${cart.length} items for ${formatPrice(
      calculateTotal()
    )}?`
  );
  if (confirmPurchase) {
    showToast(
      `Thank you for your purchase! Total: ${formatPrice(calculateTotal())}`,
      "success"
    );
    cart = [];
    updateCart();
  }
}

// Function to calculate total
function calculateTotal() {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

// Function to update cart display
function updateCart() {
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const cartActions = document.getElementById("cart-actions");

  if (cart.length === 0) {
    cartItems.innerHTML = `
             <div class="empty-cart">
                 <i class="fas fa-shopping-cart"></i>
                 <p>Your cart is empty</p>
             </div>
         `;
    cartTotal.innerHTML = "";
    cartActions.style.display = "none";
    return;
  }

  cartItems.innerHTML = "";
  let total = calculateTotal();

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;

    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";

    cartItem.innerHTML = `
             <div class="cart-item-info">
                 <div class="cart-item-name">${item.name}</div>
             </div>
             <div class="cart-item-controls">
                 <div class="quantity-control">
                     <button class="quantity-btn minus" data-name="${
                       item.name
                     }">-</button>
                     <span class="quantity-value">${item.quantity}</span>
                     <button class="quantity-btn plus" data-name="${
                       item.name
                     }">+</button>
                 </div>
                 <div class="cart-item-price">${formatPrice(itemTotal)}</div>
                 <button class="cart-item-remove" data-name="${item.name}">
                     <i class="fas fa-times"></i>
                 </button>
             </div>
         `;

    cartItems.appendChild(cartItem);
  });

  cartTotal.innerHTML = `Total: ${formatPrice(total)}`;
  cartActions.style.display = "flex";

  // Add event listeners to buttons
  document.querySelectorAll(".cart-item-remove").forEach((button) => {
    button.addEventListener("click", function () {
      const productName = this.getAttribute("data-name");
      removeFromCart(productName);
    });
  });

  document.querySelectorAll(".quantity-btn.plus").forEach((button) => {
    button.addEventListener("click", function () {
      const productName = this.getAttribute("data-name");
      increaseQuantity(productName);
    });
  });

  document.querySelectorAll(".quantity-btn.minus").forEach((button) => {
    button.addEventListener("click", function () {
      const productName = this.getAttribute("data-name");
      decreaseQuantity(productName);
    });
  });

  // Update event listeners for remove-all and buy-now every time the cart updates
  document.getElementById("remove-all").onclick = removeAllItems;
  document.getElementById("buy-now").onclick = processPurchase;
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM finally loaded");

  const loading = document.querySelector(".loading");
  const productsGrid = document.getElementById("products-grid");

  loading.style.display = "flex";

  setTimeout(() => {
    loading.style.display = "none";
    loadProducts();
  }, 2500);

  document.getElementById("remove-all").addEventListener("click", function (e) {
    console.log("Remove all clicked");
    removeAllItems();
  });

  document.getElementById("buy-now").addEventListener("click", function (e) {
    console.log("Buy now clicked");
    processPurchase();
  });

  updateCart();
});
