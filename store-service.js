const fs = require('fs').promises; // Use fs.promises to work with async/await

// Global arrays for items and categories
let items = [];
let categories = [];

function addItem(itemData) {
    return new Promise((resolve, reject) => {
        itemData.published = itemData.published ? true : false;
        itemData.id = items.length + 1;
        items.push(itemData);
        resolve(itemData);
    });
}

function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        let filteredItems = items.filter(item => item.category == category);
        filteredItems.length ? resolve(filteredItems) : reject("No results returned");
    });
}
    
function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        let filteredItems = items.filter(item => new Date(item.postDate) >= new Date(minDateStr));
        filteredItems.length ? resolve(filteredItems) : reject("No results returned");
    });
}

function getItemById(id) {
    return new Promise((resolve, reject) => {
        let item = items.find(item => item.id == id);
        item ? resolve(item) : reject("No result returned");
    });
}

function getAllItems() {
    return new Promise((resolve, reject) => {
        if (items.length > 0) {
            resolve(items);
        } else {
            reject("No items found.");
        }
    });
}

module.exports = { addItem, getItemsByCategory, getItemsByMinDate, getItemById, getAllItems };

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

    getAllItems() {
    return new Promise((resolve, reject) => {
        if (items.length > 0) {
            resolve(items); // Resolve the promise with items data
        } else {
            reject("No items available.");
        }
    });
},
    
    // Function to get published items
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
    },

};
// Correct module exports
module.exports = storeService;
