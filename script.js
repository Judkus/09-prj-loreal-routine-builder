//* Get references to DOM elements */

const categoryFilter = document.getElementById("categoryFilter");
const productSearch = document.getElementById("productSearch");
const clearSearchBtn = document.getElementById("clearSearch");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");

/* Array to store selected products */
let selectedProducts = [];

/* Array to store all products for filtering */
let allProducts = [];

/* Load selected products from localStorage on page load */
function loadSelectedProducts() {
  const savedProducts = localStorage.getItem("selectedProducts");
  if (savedProducts) {
    selectedProducts = JSON.parse(savedProducts);
  }
}

/* Save selected products to localStorage */
function saveSelectedProducts() {
  localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
}

/* Clear all selected products */
function clearAllProducts() {
  selectedProducts = [];
  saveSelectedProducts();
  updateSelectedProductsList();
  updateProductCardStates();
}

/* Update the selected products list display */
function updateSelectedProductsList() {
  const selectedProductsList = document.getElementById("selectedProductsList");
  const clearAllButton = document.getElementById("clearAllProducts");

  selectedProductsList.innerHTML = selectedProducts.length
    ? selectedProducts
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

  // Enable/disable the Clear All button based on whether products are selected
  if (clearAllButton) {
    clearAllButton.disabled = selectedProducts.length === 0;
  }
}

/* Load selected products when page loads */
loadSelectedProducts();

/* Show initial placeholder until user selects a category or searches */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category or search for products
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
  const searchTerm = productSearch.value.toLowerCase().trim();

  productsContainer.innerHTML = products
    .map(
      (product) => `
    <div class="product-card" data-product-id="${product.id}">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${highlightSearchTerm(product.name, searchTerm)}</h3>
        <p>${highlightSearchTerm(product.brand, searchTerm)}</p>
        <p class="product-description">${highlightSearchTerm(
          product.description,
          searchTerm
        )}</p>
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

/* Helper function to highlight search terms */
function highlightSearchTerm(text, searchTerm) {
  if (!searchTerm) return text;

  const regex = new RegExp(`(${searchTerm})`, "gi");
  return text.replace(regex, '<mark class="search-highlight">$1</mark>');
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
        description: selectedProduct.querySelector(".product-description")
          .textContent, // Fixed description retrieval
      };
      products.push(productDetails);
    }
  }

  // Save to localStorage and update the display
  saveSelectedProducts();
  updateSelectedProductsList();
  updateProductCardStates();
}

/* Remove product from the "Selected Products" list */
function removeProductFromList(productId) {
  const productIndex = selectedProducts.findIndex(
    (product) => product.id === productId
  );

  if (productIndex > -1) {
    selectedProducts.splice(productIndex, 1);

    // Save to localStorage and update the display
    saveSelectedProducts();
    updateSelectedProductsList();
    updateProductCardStates();
  }
}

/* Comprehensive filtering function that handles both category and search */
async function filterAndDisplayProducts() {
  // Load all products if not already loaded
  if (allProducts.length === 0) {
    allProducts = await loadProducts();
  }

  const selectedCategory = categoryFilter.value;
  const searchTerm = productSearch.value.toLowerCase().trim();

  let filteredProducts = allProducts;

  // Apply category filter
  if (selectedCategory) {
    filteredProducts = filteredProducts.filter(
      (product) => product.category === selectedCategory
    );
  }

  // Apply search filter
  if (searchTerm) {
    filteredProducts = filteredProducts.filter((product) => {
      const name = product.name.toLowerCase();
      const brand = product.brand.toLowerCase();
      const description = product.description.toLowerCase();
      const category = product.category.toLowerCase();

      // Search in name, brand, description, and category
      return (
        name.includes(searchTerm) ||
        brand.includes(searchTerm) ||
        description.includes(searchTerm) ||
        category.includes(searchTerm)
      );
    });
  }

  // Show placeholder if no category is selected and no search term
  if (!selectedCategory && !searchTerm) {
    productsContainer.innerHTML = `
      <div class="placeholder-message">
        Select a category or search for products
      </div>
    `;
    return;
  }

  // Show results or no results message
  if (filteredProducts.length === 0) {
    productsContainer.innerHTML = `
      <div class="placeholder-message">
        No products found matching your criteria
      </div>
    `;
  } else {
    displayProducts(filteredProducts);

    // Show results count if searching
    if (searchTerm || selectedCategory) {
      const resultsCount = document.createElement("div");
      resultsCount.className = "results-count";
      resultsCount.textContent = `${filteredProducts.length} product${
        filteredProducts.length !== 1 ? "s" : ""
      } found`;
      productsContainer.insertBefore(
        resultsCount,
        productsContainer.firstChild
      );
    }
  }
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", filterAndDisplayProducts);

/* Filter and display products when search input changes */
productSearch.addEventListener("input", (e) => {
  // Show/hide clear button based on input
  if (e.target.value.trim()) {
    clearSearchBtn.classList.add("visible");
  } else {
    clearSearchBtn.classList.remove("visible");
  }

  // Filter products
  filterAndDisplayProducts();
});

/* Clear search functionality */
clearSearchBtn.addEventListener("click", () => {
  productSearch.value = "";
  clearSearchBtn.classList.remove("visible");
  productSearch.focus();
  filterAndDisplayProducts();
});

/* Handle Enter key in search field */
productSearch.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    productSearch.value = "";
    clearSearchBtn.classList.remove("visible");
    filterAndDisplayProducts();
  }
});

/* Add event listener for Clear All button */
const clearAllButton = document.getElementById("clearAllProducts");
clearAllButton.addEventListener("click", clearAllProducts);

/* Initialize the selected products display when page loads */
document.addEventListener("DOMContentLoaded", () => {
  updateSelectedProductsList();
});

/* Chat form submission handler - Enhanced with web search capabilities */
// Handle chat form submission for follow-up questions
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userInput = document.getElementById("userInput").value;
  if (!userInput.trim()) return;

  // Show user's question in the chat window
  chatWindow.innerHTML += `<div class="user-message"><strong>You:</strong> ${userInput}</div>`;
  document.getElementById("userInput").value = "";

  // Call the enhanced API for real-time web search
  chatWindow.innerHTML += `<div class="assistant-message">Searching for current information...</div>`;
  try {
    const response = await fetch(
      "https://lorealproject9.kussuejh.workers.dev/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `As a L'Oréal beauty advisor, please search for current information about: ${userInput}. Focus on L'Oréal products, recent launches, current trends, and provide citations when available.`,
            },
          ],
        }),
      }
    );
    const data = await response.json();
    let answer = "";

    if (data.error) {
      answer = data.error;
    } else if (
      data.choices &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      answer = data.choices[0].message.content;
    } else if (data.choices && data.choices[0].text) {
      answer = data.choices[0].text;
    } else {
      answer =
        "I couldn't find current information about that topic. Please try rephrasing your question.";
    }

    // Remove the 'Searching...' message
    chatWindow.innerHTML = chatWindow.innerHTML.replace(
      /<div class=\"assistant-message\">Searching for current information\.\.\.<\/div>/,
      ""
    );

    // Format the response with proper markdown rendering for links
    const formattedAnswer = formatResponseWithLinks(answer);
    chatWindow.innerHTML += `<div class="assistant-message"><strong>Advisor:</strong> ${formattedAnswer}</div>`;

    // Scroll to bottom to show new message
    chatWindow.scrollTop = chatWindow.scrollHeight;
  } catch (error) {
    console.error("Chat error:", error);
    chatWindow.innerHTML = chatWindow.innerHTML.replace(
      /<div class=\"assistant-message\">Searching for current information\.\.\.<\/div>/,
      ""
    );
    chatWindow.innerHTML += `<div class="assistant-message error">Sorry, I couldn't get current information right now. Please try again.</div>`;
  }
});

/* Helper function to format responses with clickable links */
function formatResponseWithLinks(text) {
  // Convert markdown links [text](url) to HTML links
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  return text.replace(
    linkRegex,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
}

/* Generate a personalized routine using enhanced web search API */
const generateRoutineButton = document.getElementById("generateRoutine");

generateRoutineButton.addEventListener("click", async () => {
  if (selectedProducts.length === 0) {
    console.log(
      "No products selected. Please select products to generate a routine."
    );
    return;
  }

  try {
    const formattedProducts = selectedProducts
      .map(
        (product, index) =>
          `${product.name} (${product.brand}) - ${product.description}`
      )
      .join(", ");

    console.log("Formatted Products:", formattedProducts); // Debugging log

    // Show loading message
    let oldRoutine = document.getElementById("routineMessage");
    if (oldRoutine) {
      oldRoutine.remove();
    }

    const loadingDiv = document.createElement("div");
    loadingDiv.className = "routine";
    loadingDiv.id = "routineMessage";
    loadingDiv.innerHTML = `
      <h3>Creating Your Personalized Routine</h3>
      <p>Searching for current information and best practices...</p>
    `;
    chatWindow.appendChild(loadingDiv);

    const response = await fetch(
      "https://lorealproject9.kussuejh.workers.dev/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `As a L'Oréal beauty advisor, create a detailed personalized routine using these specific products: ${formattedProducts}. 
              Please search for current information about these products, proper application order, layering techniques, and any recent updates about these items. 
              Include specific steps, timing, and explain why each product is beneficial in this order. 
              If available, include any current tips or techniques from beauty professionals.`,
            },
          ],
        }),
      }
    );

    console.log("API Response:", response); // Debugging log

    const data = await response.json();

    console.log("Parsed Response Data:", data); // Debugging log

    // Get the routine text from the response
    let routineText = "";
    if (data.error) {
      routineText = `Error: ${data.error}`;
    } else if (
      data.choices &&
      data.choices.length > 0 &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      routineText = data.choices[0].message.content;
    } else if (
      data.choices &&
      data.choices.length > 0 &&
      data.choices[0].text
    ) {
      routineText = data.choices[0].text;
    }

    // Remove loading message
    if (document.getElementById("routineMessage")) {
      document.getElementById("routineMessage").remove();
    }

    // Show the routine inside the chatWindow
    if (routineText) {
      const routineDiv = document.createElement("div");
      routineDiv.className = "routine";
      routineDiv.id = "routineMessage";

      // Format the response with proper links
      const formattedRoutine = formatResponseWithLinks(routineText.trim());

      routineDiv.innerHTML = `
        <h3>Your Personalized Routine</h3>
        <div class="routine-content">${formattedRoutine}</div>
        <hr style='margin:1em 0;'>
      `;
      chatWindow.appendChild(routineDiv);
    } else {
      const routineDiv = document.createElement("div");
      routineDiv.className = "routine error";
      routineDiv.id = "routineMessage";
      routineDiv.textContent =
        "Failed to generate routine. No valid response from the API.";
      chatWindow.appendChild(routineDiv);
    }
    // Scroll chatWindow to bottom so user sees the latest content
    chatWindow.scrollTop = chatWindow.scrollHeight;
  } catch (error) {
    console.log("Failed to generate routine. Please try again later.");
    console.error("Error Details:", error); // Debugging log

    // Remove loading message and show error
    if (document.getElementById("routineMessage")) {
      document.getElementById("routineMessage").remove();
    }

    const errorDiv = document.createElement("div");
    errorDiv.className = "routine error";
    errorDiv.id = "routineMessage";
    errorDiv.textContent =
      "Failed to generate routine. Please try again later.";
    chatWindow.appendChild(errorDiv);
  }
});
