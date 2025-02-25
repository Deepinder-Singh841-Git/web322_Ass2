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
const myStore = require('./store-service');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: 'dfst9j74g', 
    api_key: '332178947425628', 
    api_secret: '<your_api_secret>', // Click 'View API Keys' above to copy your API secret
    secure: true
});

const upload = multer();

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

app.get('/items/add', (req, res) => {
    res.send('/views/addItem.html');
});

app.post('/items/add', upload.single('image'), (req, res) => {
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processItem(uploaded.url);
        });
    }else{
        processItem("");
    }
     
    function processItem(imageUrl){
        req.body.featureImage = imageUrl;
    
        // TODO: Process the req.body and add it as a new Item before redirecting to /items
    } 
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