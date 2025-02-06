/*********************************************************************************

WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Deepinder Singh______
Student ID: 159466234___
Date: 06/02/2025_______
Cyclic Web App URL: _______________________________________________________
GitHub Repository URL: ______________________________________________________

********************************************************************************/ 


const express = require('express');
const path = require('path');
const myStore = require('./store-service');

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

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
app.get('/items', (req, res) => {
    myStore.getPublishedItems()
        .then(items => res.json(items))
        .catch(err => res.status(500).json({ message: err }));
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
