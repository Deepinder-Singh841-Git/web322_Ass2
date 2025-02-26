/*********************************************************************************

WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Deepinder Singh______
Student ID: 159466234___
Date: 06/02/2025_______
vercel Web App URL: https://deepweb-two.vercel.app/about
GitHub Repository URL: https://github.com/Deepinder-Singh841-Git/web322_Ass2.git

********************************************************************************/ 

const express = require('express');
const path = require('path');
const myStore = require('./store-service'); // Ensure correct file reference
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { addItem } = require("./store-service");

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Cloudinary configuration
cloudinary.config({
    cloud_name: 'dfst9j74g', 
        api_key: '332178947425628', 
        api_secret: 'y7M6d7_J5Feh4jbgowjFyOT4pw8', // Replace with your actual API Secret
    secure: true
});

const upload = multer();

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" folder
app.use(express.static('public'));

// Route for "/"
app.get('/', (req, res) => {
    res.redirect('/about');
});

// Route for "/about"
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Route for "/shop"
app.get('/shop', (req, res) => {
    myStore.getAllItems()
        .then(items => {
            const publishedItems = items.filter(item => item.published);
            res.json(publishedItems);
        })
        .catch(err => {
            res.status(500).json({ message: err });
        });
});

// Route for "/items"
app.get("/items", (req, res) => {
    let { category, minDate } = req.query;
    
    if (category) {
        getItemsByCategory(category)
            .then(data => res.json(data))
            .catch(err => res.status(404).send(err));
    } else if (minDate) {
        getItemsByMinDate(minDate)
            .then(data => res.json(data))
            .catch(err => res.status(404).send(err));
    } else {
        res.json(items);
    }
});


// Serve the add item form
app.get("/items/add", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "addItem.html"));
});

// Handle adding a new item with optional image upload
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
        }).catch(() => {
            processItem("");
        });
    } else {
        processItem("");
    }

    function processItem(imageUrl) {
        req.body.featureImage = imageUrl;
        addItem(req.body).then(() => {
            res.redirect("/items");
        }).catch(err => {
            res.status(500).send(err);
        });
    }
});

app.get("/item/:id", (req, res) => {
    getItemById(req.params.id)
        .then(item => res.json(item))
        .catch(err => res.status(404).send(err));
});


// Route for "/categories"
app.get('/categories', (req, res) => {
    myStore.getCategories()
        .then(categories => res.json(categories))
        .catch(err => res.status(500).json({ message: err }));
});

// Custom 404 Route
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// Initialize store and start the server
myStore.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`Express server listening on port ${HTTP_PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to start server:', err);
    });
