const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const Fruit = require('./models/fruit');

const app = express(); 

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
  });

// mount middleware functions here
// body parser middleware: this function reads the  request 
// and decodes it into req.body so we can access form data;
app.use(express.urlencoded({ extended: false})); // always false



// Build the route, async handler 
app.get('/', async (req, res) => {
    res.render('index.ejs');
});


// path to the page with a form that we can fill out 
// submit to add a new fruit to a database
app.get('/fruits/new', (req, res) => {
    res.render('fruits/new.ejs');   // location of the file
});

// path used to receive form submissions 
app.post('/fruits', async(req, res) => {
    if (req.body.isReadyToEat === 'on'){
        req.body.isReadyToEat = true;
    } else {
        req.body.isReadyToEat = false; 
    }
    // create the data in our database
    await Fruit.create(req.body);
    // redirect tells the client to nav to a new URL path/another page
    res.redirect('/fruits/new');  // url path
});


app.listen(3000, () => {
    console.log("Listening on port 3000");
});
