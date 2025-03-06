/*********************************************************************************

WEB322 – Assignment 03
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Deepinder Singh______
Student ID: 159466234___
Date: 06/02/2025_______
vercel Web App URL: https://deepweb-two.vercel.app/about
GitHub Repository URL: https://github.com/Deepinder-Singh841-Git/web322_Ass2.git

********************************************************************************/ 

const express = require('express');
const path = require('path');
const myStore = require('./store-service');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const fs = require('fs').promises; 

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Cloudinary configuration
cloudinary.config({
    cloud_name: 'dfst9j74g', 
    api_key: '332178947425628', 
    api_secret: 'y7M6d7_J5Feh4jbgowjFyOT4pw8', 
    secure: true
});

const upload = multer();

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Route for "/shop"
app.get('/shop', (req, res) => {
    myStore.getPublishedItems()
        .then(items => {
            res.json(items);
        })
        .catch(err => {
            res.status(500).json({ message: err });
        });
});

// Route for "/items"
app.get("/items", async (req, res) => {
    try {
        let { category, minDate } = req.query;

        if (category) {
            let itemsByCategory = await myStore.getItemsByCategory(category);
            return res.json(itemsByCategory);
        }

        if (minDate) {
            let itemsByDate = await myStore.getItemsByMinDate(minDate);
            return res.json(itemsByDate);
        }

        let allItems = await myStore.getAllItems();
        return res.json(allItems);
    } catch (error) {
        res.status(500).send("Internal Server Error: " + error);
    }
});

// Serve the add item form
app.get("/items/add", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "addItem.html"));
});

app.post("/items/add", upload.single("featureImage"), (req, res) => {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                });
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            return result;
        }

        upload(req).then((uploaded) => {
            processItem(uploaded.url);
        }).catch((error) => {
            console.error("Cloudinary upload error:", error);
            processItem("");
        });
    } else {
        processItem("");
    }

    function processItem(imageUrl) {
        req.body.featureImage = imageUrl;
        
        myStore.addItem(req.body).then(() => {
            res.redirect("/items");
        }).catch(err => {
            res.status(500).send("Failed to add item: " + err);
        });
    }
});

app.get("/item/:id", (req, res) => {
    myStore.getItemById(req.params.id)
        .then(item => res.json(item))
        .catch(err => res.status(404).send(err));
});

app.get('/categories', (req, res) => {
    myStore.getCategories()
        .then(categories => res.json(categories))
        .catch(err => res.status(500).json({ message: err }));
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

async function initialize() {
    try {
        // Read and parse items.json
        const itemsData = await fs.readFile('./data/items.json', 'utf8');
        global.items = JSON.parse(itemsData);

        // Read and parse categories.json
        const categoriesData = await fs.readFile('./data/categories.json', 'utf8');
        global.categories = JSON.parse(categoriesData);

        console.log("Data successfully loaded.");
    } catch (err) {
        console.error("Unable to load data:", err.message);
        throw err; // Re-throw the error to stop the server if data loading fails
    }
}

// Start the server after initializing data
initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`Express server listening on port ${HTTP_PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to start server:', err);
    });
