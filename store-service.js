const fs = require('fs').promises; // Use fs.promises to work with async/await

// Global arrays for items and categories
let items = [];
let categories = [];

const storeService = {
  // Initialize function to load data from JSON files
  async initialize() {
    try {
      // Read and parse items.json
      const itemsData = await fs.readFile('./data/items.json', 'utf8');
      items = JSON.parse(itemsData);

      // Read and parse categories.json
      const categoriesData = await fs.readFile('./data/categories.json', 'utf8');
      categories = JSON.parse(categoriesData);

      return "Data successfully loaded.";
    } catch (err) {
      throw new Error("Unable to load data: " + err.message);
    }
  },

  // Function to get all items
  getAllItems() {
    return new Promise((resolve, reject) => {
      if (items.length > 0) {
        resolve(items); // Resolve the promise with items data
      } else {
        reject("No items available.");
      }
    });
  },

  getPublishedItems() {
    return new Promise((resolve, reject) => {
      const publishedItems = items.filter(item => item.published === true); // Filter items by 'published' property
  
      if (publishedItems.length > 0) {
        resolve(publishedItems); // Resolve with the filtered array if there are published items
      } else {
        reject("No results returned. No items with 'published' set to true."); // Reject with a meaningful error message if no published items
      }
    });
  },
  
  // Function to get all categories
  getCategories() {
    return new Promise((resolve, reject) => {
      if (categories.length > 0) {
        resolve(categories); // Resolve with the categories array if it contains data
      } else {
        reject("No results returned. The categories array is empty."); // Reject with a meaningful error message if the array is empty
      }
    });
  }
};

module.exports = storeService;
