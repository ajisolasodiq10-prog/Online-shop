import { CONFIG } from "./config.js";
//add backend

const API_BASE = CONFIG.API_BASE_URL;
const PRODUCTS_PATH = CONFIG.PRODUCTS_PATH;
const WHATSAPP_LINK_PATH = CONFIG.WHATSAPP_LINK_PATH;

document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("popup");
const closeBtn = document.getElementById("close-btn");
const loader = document.getElementById("loader");
const cartButtons = document.querySelectorAll(".cartButton");
  const cartSection = document.getElementById("cart");
  const productList = document.getElementById("productList");
  const cartItemsContainer = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const checkoutButton = document.getElementById("checkoutButton");
  const closeCartButton = document.getElementById("closeCartButton");


  let cart = [];
  let productsData = [];
  //update .env to config.js and import here

  // Fetch products from the backend (configurable via .env)
  
      loader.style.display = "flex";
  
  
     fetch(`${API_BASE}${PRODUCTS_PATH}`)
    .then((response) => response.json())
    .then((data) => {
      loader.style.display = "none";
      productsData = Array.isArray(data) ? data : data.products || [];
      renderProducts(productsData);
    })
    .catch((error) => {
      loader.style.display = "none";
      console.error("Error fetching products:", error);
      alert("Failed to load products.");
    });

  // Toggle cart visibility


cartButtons.forEach((button) => {
  button.addEventListener("click", () => {
    cartSection.style.display =
      cartSection.style.display === "block" ? "none" : "block";

    if (cartSection.style.display === "block") {
      renderCart();
    }
  });
});



// Close popup when button is clicked
closeBtn.addEventListener("click", () => {
  popup.style.visibility = "hidden";
  popup.style.opacity = "0";
});







  // Close cart
  closeCartButton.addEventListener("click", () => {
    cartSection.style.display = "none";
  });

  // Render products
  function renderProducts(products) {
    productList.innerHTML = "";
    products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.classList.add("product-card");
      // productCard.innerHTML = 
      productCard.innerHTML = `
  <div class="product-image"
    style="background-image: url('${product.image || product.imageUrl || ""}')">
  </div>
  <div class="product-info">
    <h3>${product.name}</h3>
    <p>#${product.price?.toFixed ? product.price.toFixed(2) : product.price}</p>
    <div class="actions">
      <button class="add-to-cart" data-id="${product._id || product.id}">Add to Cart</button>
      <div class="counter">
        <button class="decrement" data-id="${product._id || product.id}">-</button>
        <span class="quantity" id="quantity-${product._id || product.id}">1</span>
        <button class="increment" data-id="${product._id || product.id}">+</button>
      </div>
    </div>
  </div>


      `;
      productList.appendChild(productCard);
    });

    // Add event listeners to action buttons
    document.querySelectorAll(".add-to-cart").forEach((button) => {
      button.addEventListener("click", handleAddToCart);
    });
    document.querySelectorAll(".increment").forEach((button) => {
      button.addEventListener("click", handleIncrement);
    });
    document.querySelectorAll(".decrement").forEach((button) => {
      button.addEventListener("click", handleDecrement);
    });
  }

  // Handle adding product to cart
  function handleAddToCart(event) {
    const productId = event.target.dataset.id;
    const quantityElement = document.getElementById(`quantity-${productId}`);
    if (!quantityElement) return;

    const quantity = parseInt(quantityElement.textContent, 10);
    const product = productsData.find(
      (p) => p._id === productId || p.id === productId,
    );
    if (!product) {
      console.error("Product not found", productId);
      return;
    }

    const existingProduct = cart.find((item) => item.id === productId);
    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.push({ id: productId, quantity });
    }

    // Reset displayed quantity to 1 after adding
    quantityElement.textContent = "1";

    renderCart();
  }

  // Handle incrementing quantity
  function handleIncrement(event) {
    const productId = event.target.dataset.id;
    const quantityElement = document.getElementById(`quantity-${productId}`);
    let quantity = parseInt(quantityElement.textContent);
    quantityElement.textContent = ++quantity;
  }

  // Handle decrementing quantity
  function handleDecrement(event) {
    const productId = event.target.dataset.id;
    const quantityElement = document.getElementById(`quantity-${productId}`);
    let quantity = parseInt(quantityElement.textContent);
    if (quantity > 1) {
      quantityElement.textContent = --quantity;
    }
  }





  // Render cart
  function renderCart() {
    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach((item) => {
      const product = productsData.find(
        (p) => p._id === item.id || p.id === item.id,
      );
      if (!product) {
        return;
      }

      const cartItem = document.createElement("div");
      cartItem.classList.add("cart-item");
      cartItem.innerHTML = `
        <p>${product.name} x${item.quantity}</p>
        <p>#${(product.price * item.quantity).toFixed(2)}</p>
        <button class="remove" data-id="${item.id}">Remove</button>
      `;
      cartItemsContainer.appendChild(cartItem);

      total += product.price * item.quantity;

      cartItem
        .querySelector(`.remove[data-id="${item.id}"]`)
        .addEventListener("click", () => {
          removeFromCart(item.id);
        });
    });

    // Display total
    cartTotal.innerHTML = `<p>Total: #${total.toFixed(2)}</p>`;
  }

  // Remove product from cart
  function removeFromCart(productId) {
    cart = cart.filter((item) => item.id !== productId);
    renderCart();
  }

  // Handle checkout
  checkoutButton.addEventListener("click", async () => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const name = prompt("Enter your name:", "");
    if (!name || name.trim() === "") {
      alert("Name is required to checkout.");
      return;
    }

    // const phone = prompt("Enter your phone number (optional):", "");
    // const department = prompt("Enter your department (optional):", "");

    const products = cart.map((item) => ({
      id: item.id,
      quantity: item.quantity,
    }));

    try {
      const response = await fetch(`${API_BASE}${WHATSAPP_LINK_PATH}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          products,
          user: {
            name: name.trim(),
            // phone: phone?.trim(),
            // department: department?.trim(),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to generate WhatsApp link.",
        );
      }

      const data = await response.json();
      if (!data.url) {
        throw new Error("WhatsApp URL not returned from server.");
      }

      // Redirect to WhatsApp chat with prefilled message
      window.location.href = data.url;
    } catch (error) {
      console.error("Checkout error:", error);
      alert(`Checkout failed: ${error.message}`);
    }
  });
});
