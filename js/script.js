import { fetchProducts } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const productsContainer = document.getElementById("products-container");
  const loadProductsButton = document.getElementById("load-products");
  const cartIcon = document.getElementById("cart-icon");
  const cartCountElement = document.getElementById("cart-count");
  const cartModal = document.getElementById("cart-modal");
  const cartItemsContainer = document.getElementById("cart-items");
  const closeCartButton = document.getElementById("close-cart");
  const checkoutBtn = document.getElementById("checkout-btn");
  const checkoutModal = document.getElementById("checkout-modal");
  const selectedItemsContainer = document.getElementById("selected-items");
  const addressForm = document.getElementById("address-form");
  const confirmationMessage = document.getElementById("confirmation-message");
  const closeConfirmationButton = document.getElementById("close-confirmation");
  const totalPriceElement = document.getElementById("total-price");
  const priceFilter = document.getElementById("price-filter");

  let products = [];
  let cart = [];

  // Fetch products when the load products button is clicked
  if (loadProductsButton) {
    loadProductsButton.addEventListener("click", async () => {
      loadProductsButton.classList.add("button-loading"); // Start loading animation
      const fetchedProducts = await fetchProducts();
      products = fetchedProducts;
      displayProducts(products);
      loadProductsButton.classList.remove("button-loading"); // Stop loading animation
    });
  }

  // Display products function
  function displayProducts(products) {
    if (loadProductsButton) loadProductsButton.classList.add("hidden");
    productsContainer.innerHTML = "";
    if (products.length === 0) {
      productsContainer.innerHTML = "<p>No products available</p>";
      return;
    }

    productsContainer.classList.add("products-grid"); // Ensure grid styling is applied
    products.forEach((product) => {
      const price =
        product.variants && product.variants[0]
          ? product.variants[0].price
          : "N/A";
      const imgSrc =
        product.images && product.images[0] ? product.images[0].src : "";

      if (!product.id) {
        console.error("Product ID is missing", product);
        return;
      }

      const card = document.createElement("div");
      card.classList.add("product-card");
      card.innerHTML = `
        <img src="${imgSrc}" alt="${product.title}">
        <div class="product-card-content">
          <h3>${product.title}</h3>
          <p><strong>Price:</strong> ₹${price}</p>
          <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
        </div>
      `;
      productsContainer.appendChild(card);
    });

    // Add event listeners to all 'add-to-cart' buttons
    const addToCartButtons = document.querySelectorAll(".add-to-cart");
    addToCartButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const productId = e.target.getAttribute("data-id");
        const product = products.find((prod) => prod.id == productId);
        if (product) {
          addToCart(product);
        } else {
          console.error("Product not found for ID:", productId);
        }
      });
    });
  }

  // Add product to the cart
  function addToCart(product) {
    if (!product.id) {
      console.error("Attempted to add a product with no valid ID", product);
      return;
    }

    const existingProductIndex = cart.findIndex(
      (item) => item.id === product.id
    );

    if (existingProductIndex !== -1) {
      cart[existingProductIndex].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    updateCart();
  }

  // Update the cart UI
  function updateCart() {
    const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    if (cartCountElement) cartCountElement.textContent = totalCount.toString();

    if (cartItemsContainer) {
      if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<p>Your cart is empty</p>";
      } else {
        cartItemsContainer.innerHTML = "";
        cart.forEach((item, index) => {
          const price =
            item.variants && item.variants[0] ? item.variants[0].price : "N/A";
          const imgSrc =
            item.images && item.images[0] ? item.images[0].src : "";
          const cartItem = document.createElement("div");
          cartItem.innerHTML = `
            <input type="checkbox" data-index="${index}" class="cart-item-checkbox">
            <img src="${imgSrc}" alt="${item.title}" width="50" />
            <strong>${item.title}</strong> x ${item.quantity} <br>
            Price: ₹${price * item.quantity}
            <button class="delete-item" data-index="${index}">Delete</button>
          `;
          cartItemsContainer.appendChild(cartItem);
        });

        // Add event listener to each delete button
        const deleteButtons = document.querySelectorAll(".delete-item");
        deleteButtons.forEach((button) => {
          button.addEventListener("click", (e) => {
            const index = e.target.getAttribute("data-index");
            deleteItemFromCart(index);
          });
        });
      }
    }

    // If the cart is empty, show the empty cart message in the modal
    if (cartModal && cart.length === 0) {
      const cartContent = cartModal.querySelector(".cart-content");
      if (cartContent) {
        cartContent.innerHTML = "<p>Your cart is empty</p>";
      }
    }
  }

  // Delete item from the cart
  function deleteItemFromCart(index) {
    cart.splice(index, 1);
    updateCart();

    if (cart.length === 0 && cartModal) {
      cartModal.classList.add("hidden");
    }
  }

  // Toggle the cart modal visibility
  if (cartIcon) {
    cartIcon.addEventListener("click", () => {
      if (cartModal) cartModal.classList.toggle("hidden");
    });
  }

  // Close cart modal
  if (closeCartButton) {
    closeCartButton.addEventListener("click", () => {
      if (cartModal) cartModal.classList.add("hidden");
    });
  }

  // Checkout functionality
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (cartModal) cartModal.classList.add("hidden");
      if (checkoutModal) checkoutModal.classList.remove("hidden");
      if (selectedItemsContainer) selectedItemsContainer.innerHTML = "";
      const selectedItems = [];
      const checkboxes = document.querySelectorAll(
        ".cart-item-checkbox:checked"
      );
      checkboxes.forEach((checkbox) => {
        const index = checkbox.getAttribute("data-index");
        selectedItems.push(cart[index]);
      });

      let totalPrice = 0;
      selectedItems.forEach((item) => {
        const price =
          item.variants && item.variants[0] ? item.variants[0].price : 0;
        const itemTotal = price * item.quantity;
        totalPrice += itemTotal;
        const selectedItem = document.createElement("div");
        selectedItem.innerHTML = `
          <img src="${item.images[0].src}" alt="${item.title}" width="50" />
          <strong>${item.title}</strong> x ${item.quantity} <br>
          Price: ₹${itemTotal}
        `;
        if (selectedItemsContainer)
          selectedItemsContainer.appendChild(selectedItem);
      });

      if (totalPriceElement)
        totalPriceElement.textContent = `Total Price: ₹${totalPrice}`;
    });
  }

  // Address form submission
  if (addressForm) {
    addressForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (checkoutModal) checkoutModal.classList.add("hidden");
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 2);
      const formattedDate = deliveryDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (confirmationMessage) {
        confirmationMessage.innerHTML = `
        <div class="popup-content">
          <p>Your item will be delivered on ${formattedDate}.</p>
          <button id="close-popup">Close</button>
        </div>
      `;
        confirmationMessage.classList.remove("hidden");
        confirmationMessage.classList.add("popup");

        const closePopupButton = document.getElementById("close-popup");
        if (closePopupButton) {
          closePopupButton.addEventListener("click", () => {
            confirmationMessage.classList.add("hidden");
            confirmationMessage.classList.remove("popup");
          });
        }

        // Automatically close the popup after 5 seconds
        setTimeout(() => {
          confirmationMessage.classList.add("hidden");
          confirmationMessage.classList.remove("popup");
        }, 5000);
      }
    });
  }

  // Handle price filter change
  if (priceFilter) {
    priceFilter.addEventListener("change", (e) => {
      const selectedPriceRange = e.target.value;
      const filteredProducts = filterProductsByPrice(
        products,
        selectedPriceRange
      );
      displayProducts(filteredProducts);
    });
  }

  // Filter products by price
  function filterProductsByPrice(products, priceRange) {
    return products.filter((product) => {
      const price =
        product.variants && product.variants[0] ? product.variants[0].price : 0;
      if (priceRange === "low") {
        return price <= 500;
      } else if (priceRange === "high") {
        return price > 500;
      }
      return true;
    });
  }
});
