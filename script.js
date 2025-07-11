/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const selectedProductsList = document.getElementById("selectedProductsList");
const generateRoutineBtn = document.getElementById("generateRoutine");

/* Array to store selected products */
let selectedProducts = [];

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Initialize selected products display */
updateSelectedProductsDisplay();

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

/* Toggle product selection when clicking on a product card */
async function toggleProductSelection(productId) {
  // Convert productId to number to match the JSON data format
  const numericProductId = parseInt(productId);

  // Load all products to get the full product data
  const allProducts = await loadProducts();

  // find() method searches through the array and returns the first product
  // where the id matches the productId we're looking for
  const product = allProducts.find((p) => p.id === numericProductId);

  // If no product is found, exit the function early
  if (!product) return;

  // findIndex() returns the position of the product in our selectedProducts array
  // If the product isn't found, it returns -1
  const existingIndex = selectedProducts.findIndex(
    (p) => p.id === numericProductId
  );

  if (existingIndex > -1) {
    // Product is already selected, so remove it using splice()
    // splice() removes 1 item starting at the existingIndex position
    selectedProducts.splice(existingIndex, 1);
  } else {
    // Product is not selected, so add it to the array using push()
    selectedProducts.push(product);
  }

  // Update the display of selected products
  updateSelectedProductsDisplay();

  // Update the visual state of product cards
  updateProductCardStates();
}

/* Update the visual state of product cards to show which are selected */
function updateProductCardStates() {
  // querySelectorAll() gets all elements with the class 'product-card'
  const productCards = document.querySelectorAll(".product-card");

  // forEach() loops through each product card
  productCards.forEach((card) => {
    // getAttribute() gets the value of the data-product-id attribute
    const productId = parseInt(card.getAttribute("data-product-id"));

    // some() checks if any product in selectedProducts has this id
    // It returns true if found, false if not found
    const isSelected = selectedProducts.some((p) => p.id === productId);

    if (isSelected) {
      // addClass() adds the 'selected' CSS class to make it look selected
      card.classList.add("selected");
    } else {
      // removeClass() removes the 'selected' CSS class
      card.classList.remove("selected");
    }
  });
}

/* Display the list of selected products */
function updateSelectedProductsDisplay() {
  // Check if no products are selected
  if (selectedProducts.length === 0) {
    // Show a helpful message when no products are selected
    selectedProductsList.innerHTML = `
      <p style="text-align: center; color: var(--neutral-medium); font-style: italic;">
        No products selected yet. Click on product cards to add them to your routine.
      </p>
    `;
    // Disable the generate routine button when no products are selected
    generateRoutineBtn.disabled = true;
  } else {
    // map() creates a new array by transforming each selected product into HTML
    // join('') combines all the HTML strings into one string
    selectedProductsList.innerHTML = selectedProducts
      .map(
        (product) => `
        <div class="selected-product-tag">
          <span>${product.name}</span>
          <button class="remove-btn" onclick="removeProduct('${product.id}')" title="Remove product">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
      `
      )
      .join("");
    // Enable the generate routine button when products are selected
    generateRoutineBtn.disabled = false;
  }
}

/* Remove a product from the selected products list */
function removeProduct(productId) {
  // Convert to number to match the data format
  const numericProductId = parseInt(productId);

  // filter() creates a new array containing only products that DON'T match the productId
  // This effectively removes the product we want to delete
  selectedProducts = selectedProducts.filter((p) => p.id !== numericProductId);

  // Update the displays to reflect the change
  updateSelectedProductsDisplay();
  updateProductCardStates();
}

/* Initialize the app when the page loads */
document.addEventListener("DOMContentLoaded", function () {
  // Set up initial state
  updateSelectedProductsDisplay();

  // Add event listener for the generate routine button
  generateRoutineBtn.addEventListener("click", async function () {
    console.log("Generate Routine button clicked.");
    console.log("Selected Products:", selectedProducts);

    if (selectedProducts.length > 0) {
      const productData = selectedProducts.map((p) => ({
        name: p.name,
        brand: p.brand,
        category: p.category,
        description: p.description,
      }));

      try {
        const response = await fetch("https://api.openai.com/v1/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${YOUR_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            prompt: `Generate a personalized routine using these products: ${JSON.stringify(
              productData
            )}`,
            max_tokens: 150,
          }),
        });

        const data = await response.json();

        chatWindow.innerHTML = `
          <div class="assistant-message">
            ${data.choices[0].text}
          </div>
        `;
      } catch (error) {
        console.error("Error generating routine:", error);
        chatWindow.innerHTML = `
          <div class="assistant-message">
            Sorry, there was an error generating your routine. Please try again later.
          </div>
        `;
      }
    } else {
      chatWindow.innerHTML = `
        <div class="assistant-message">
          Please select some products to generate a routine.
        </div>
      `;
    }
  });
});
