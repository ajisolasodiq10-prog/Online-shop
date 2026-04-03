import { CONFIG } from "./config.js";
const API_BASE = CONFIG.API_BASE_URL;
const PRODUCTS_PATH = CONFIG.PRODUCTS_PATH;
const TOKEN_KEY = CONFIG.TOKEN_KEY;

document
  .getElementById("productForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    // Clear previous error messages
    document.getElementById("nameError").textContent = "";
    document.getElementById("priceError").textContent = "";
    document.getElementById("imageError").textContent = "";

    const name = document.getElementById("productName").value.trim();
    const price = parseFloat(
      document.getElementById("productPrice").value.trim(),
    );
    const imageUrl = document.getElementById("productImage").value.trim();
    const category = document.getElementById("productCategory").value.trim();

    // Validate inputs
    if (!name || !price || !imageUrl) {
      if (!name)
        document.getElementById("nameError").textContent =
          "Product name is required.";
      if (!price)
        document.getElementById("priceError").textContent =
          "Price is required.";
      if (!imageUrl)
        document.getElementById("imageError").textContent =
          "Image URL is required.";
      return;
    }

    // Create product object in API shape
    const product = {
      name,
      price,
      image: imageUrl,
      category: category || "Uncategorized",
    };

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const isUpdate = Boolean(editingProductId);
      const method = isUpdate ? "PUT" : "POST";
      const endpoint = isUpdate
        ? `${API_BASE}${PRODUCTS_PATH}/${editingProductId}`
        : `${API_BASE}${PRODUCTS_PATH}`;

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(product),
      });

      if (response.ok) {
        // Clear form
        document.getElementById("productForm").reset();

        // Reset editing mode
        editingProductId = null;
        document.querySelector(
          "#productForm button[type='submit']",
        ).textContent = "Add Product";

        // Fetch and render updated product list
        fetchAndRenderProducts();
      } else {
        const errorData = await response.json();
        alert(
          `Error: ${errorData.message || "An error occurred while adding the product."}`,
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  });

// Function to fetch and render products
async function fetchAndRenderProducts() {
  try {
    const response = await fetch(`${API_BASE}${PRODUCTS_PATH}`);
    if (response.ok) {
      const data = await response.json();
      renderProducts(data.products);
    } else {
      alert("Failed to fetch products.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while fetching products.");
  }
}

// Variable to track if we are editing a product
let editingProductId = null;

// Function to render products
function renderProducts(products) {
  const productList = document.getElementById("productList");
  productList.innerHTML = ""; // Clear current list

  if (!Array.isArray(products)) {
    console.error("renderProducts: expected products array but got", products);
    return;
  }

  products.forEach((product) => {
    const productId = product.id || product._id;
    const productCard = document.createElement("div");
    productCard.classList.add("product-card");
    productCard.setAttribute("data-id", productId);

    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>$${product.price.toFixed(2)}</p>
      <p>Category: ${product.category}</p>
      <div class="actions">
        <button class="edit" onclick="editProduct('${productId}')">Edit</button>
        <button class="delete" onclick="deleteProduct('${productId}')">Delete</button>
      </div>
    `;

    productList.appendChild(productCard);
  });
}

// Function to edit product
async function editProduct(id) {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_BASE}${PRODUCTS_PATH}/${id}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (response.ok) {
      const product = await response.json();
      // Populate form with product data
      document.getElementById("productName").value = product.name;
      document.getElementById("productPrice").value = product.price;
      document.getElementById("productImage").value = product.image;
      document.getElementById("productCategory").value = product.category || "";
      // Set editing mode
      editingProductId = id;
      document.querySelector("#productForm button[type='submit']").textContent =
        "Update Product";
    } else {
      const err = await response.json();
      alert(
        `Failed to fetch product for editing: ${err.message || response.statusText}`,
      );
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while fetching the product.");
  }
}

// Function to delete product
async function deleteProduct(id) {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_BASE}${PRODUCTS_PATH}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (response.ok) {
      // Fetch and render updated product list
      fetchAndRenderProducts();
    } else {
      const err = await response.json();
      alert(`Failed to delete product: ${err.message || response.statusText}`);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while deleting the product.");
  }
}

// Initial fetch and render of products
fetchAndRenderProducts();
