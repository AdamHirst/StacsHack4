// Index.js - Entry point for app

const express = require('express');
const app     = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));

require('./app/routes.js')(app);

app.listen(3000, () => console.log("Debugging on port 3000"));