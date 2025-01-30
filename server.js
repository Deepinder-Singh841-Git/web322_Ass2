const myStore = require('./store-service');
const express = require('express'); // "require" the Express module
const app = express(); // obtain the "app" object
const path = require('path'); // to work with file paths
const HTTP_PORT = process.env.PORT || 8080; // assign a port

// Use the "static" middleware to serve static files from the "public" folder
app.use(express.static('public'));

// Route for "/"
app.get('/', (req, res) => {
    res.redirect('/about'); // Redirect to the "/about" route
});

// Route for "/about"
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html')); // Send about.html from the "views" folder
});

// Start the server on the port and output a confirmation to the console
app.listen(HTTP_PORT, () => {
    console.log(`Express http server listening on ${HTTP_PORT}`);
});
