const workerUrl = "https://project9lorealroutine.kussuejh.workers.dev";
//* Get references to DOM elements */

const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");

/* Array to store selected products */
let selectedProducts = [];

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

/* Create HTML for displaying product cards */
function displayProducts(products) {
  productsContainer.innerHTML = products
    .map(
      (product) => `
    <div class="product-card" data-product-id="${product.id}">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.brand}</p>
        <p class="product-description">${product.description}</p>
      </div>
      <div class="hover-overlay">
        <p>${product.description}</p>
        <button onclick="toggleProductSelection('${product.id}')">
          ${
            selectedProducts.some((p) => p.id === product.id)
              ? "Unselect"
              : "Select"
          }
        </button>
      </div>
    </div>
  `
    )
    .join("");

  updateProductCardStates();
}

/* Update the states of product cards based on selection */
function updateProductCardStates() {
  const productCards = document.querySelectorAll(".product-card");

  productCards.forEach((card) => {
    const productId = card.getAttribute("data-product-id");

    if (selectedProducts.some((product) => product.id === productId)) {
      card.classList.add("selected");
    } else {
      card.classList.remove("selected");
    }
  });
}

/* Toggle product selection and update the selected products list */
function toggleProductSelection(productId) {
  const products = selectedProducts;

  // Check if the product is already selected
  const productIndex = products.findIndex(
    (product) => product.id === productId
  );

  if (productIndex > -1) {
    // Remove product if already selected
    products.splice(productIndex, 1);
  } else {
    // Add product to selectedProducts
    const allProducts = document.querySelectorAll(".product-card");
    const selectedProduct = Array.from(allProducts).find(
      (card) => card.getAttribute("data-product-id") === productId
    );

    if (selectedProduct) {
      const productDetails = {
        id: productId,
        name: selectedProduct.querySelector("h3").textContent,
        brand: selectedProduct.querySelector("p").textContent,
      };
      products.push(productDetails);
    }
  }

  // Update the selected products list in the DOM
  const selectedProductsList = document.getElementById("selectedProductsList");
  selectedProductsList.innerHTML = products.length
    ? products
        .map(
          (product) => `
          <div class="selected-product">
            <h3>${product.name}</h3>
            <p>${product.brand}</p>
            <button onclick="removeProductFromList('${product.id}')">Remove</button>
          </div>
        `
        )
        .join("")
    : "<p>No products selected</p>";

  updateProductCardStates();
}

/* Remove product from the "Selected Products" list */
function removeProductFromList(productId) {
  const productIndex = selectedProducts.findIndex(
    (product) => product.id === productId
  );

  if (productIndex > -1) {
    selectedProducts.splice(productIndex, 1);
    toggleProductSelection(productId); // Update the product card state and DOM
  }
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  const selectedCategory = e.target.value;

  /* filter() creates a new array containing only products 
     where the category matches what the user selected */
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );

  displayProducts(filteredProducts);
});

/* Chat form submission handler - placeholder for OpenAI integration */
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  chatWindow.innerHTML = "Connect to the OpenAI API for a response!";
});

/* Generate a personalized routine using OpenAI API */
const generateRoutineButton = document.getElementById("generateRoutine");

generateRoutineButton.addEventListener("click", async () => {
  if (selectedProducts.length === 0) {
    alert(
      "No products selected. Please select products to generate a routine."
    );
    return;
  }

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        prompt: `Generate a skincare routine using the following products:\n${selectedProducts
          .map(
            (product, index) =>
              `Step ${index + 1}: ${product.name} (${product.brand}) - ${
                product.description
              }`
          )
          .join("\n")}`,
        max_tokens: 150,
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      const selectedProductsList = document.getElementById(
        "selectedProductsList"
      );
      selectedProductsList.innerHTML = `
        <div class="routine">
          <h3>Your Personalized Routine</h3>
          <pre>${data.choices[0].text}</pre>
        </div>
      `;
    } else {
      alert("Failed to generate routine. No valid response from the API.");
    }
  } catch (error) {
    alert("Failed to generate routine. Please try again later.");
    console.error(error);
  }
});
