const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const Fruit = require('./models/fruit');
const methodOverride = require('method-override');
const morgan = require('morgan');

const app = express(); 

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
  });

mongoose.connection.on('error', () =>{
    console.log(`An error connecting to MONGODB has occurred: ${error}`)
});

// mount middleware functions here
// body parser middleware: this function reads the  request 
// and decodes it into req.body so we can access form data;
app.use(express.urlencoded({ extended: false})); // always false
app.use(methodOverride('_method'));
// method override reads the "-method query param for information about delete or put request "
app.use(morgan('dev'));

//
app.use(express.static('public'));



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

    // req.body.isReadyToEat = !!req.body.isReadyToEat;

    // create the data in our database
    await Fruit.create(req.body);
    // redirect tells the client to nav to a new URL path/another page
    res.redirect('/fruits');  // url path
});


// index route for fruits - sends a page that lists 
// all fruits from the data , add async route handler
app.get('/fruits', async(req, res) => {
    const allFruits = await Fruit.find({});
    // console.log(allFruits);
    res.render('fruits/index.ejs', { fruits: allFruits }); // context object: everything that the template should know
});

app.get('/fruits/:fruitId', async (req, res) => {
    const foundFruit = await Fruit.findById(req.params.fruitId);
    res.render('fruits/show.ejs', { fruit: foundFruit }); 
    // show route- for sending a page with details for one particular fruit
});

// delete route, once matched by server.js, send an action to MONGODB to delete the document using its id
app.delete('/fruits/:fruitId', async (req, res) => {
    console.log('delete fruit with ID', req.params.fruitId);
    await Fruit.findByIdAndDelete(req.params.fruitId);
    res.redirect('/fruits');
});

// edit route - used to send a page to the client with an edit form pre-filled out with fruit details
// so that users can edit the form and submit the form
app.get('/fruits/:fruitId/edit', async (req, res) => {
    // 1. look up the fruit by id
    const foundFruit = await Fruit.findById(req.params.fruitId);
    // 2. respond with a "edit" template with an edit form
    res.render('fruits/edit.ejs', { fruit: foundFruit });
});

// update route - used to capture edit form submissions
// from the client and send updates to MongoDB
app.put("/fruits/:fruitId", async (req, res) => {
    if (req.body.isReadyToEat === 'on') {
        req.body.isReadyToEat = true;
    } else {
        req.body.isReadyToEat = false;
    }

    await Fruit.findByIdAndUpdate(req.params.fruitId, req.body);
    res.redirect(`/fruits/${req.params.fruitId}`);
});


app.listen(3000, () => {
    console.log("Listening on port 3000");
});
