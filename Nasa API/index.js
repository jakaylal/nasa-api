var express = require('express');
var bodyParser = require('body-parser');
const path = require('path');
var axios = require('axios');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const nasaApi = "6EJCLDVLA695U90b1PyZZTZfbPC2HKmOeArS2rYs";
const uri = "mongodb+srv://jakayla42105:19Uyh2cSPwBIwGDE@cluster0.vd9opls.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const client = new MongoClient(uri
, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let nasaCollection;

async function connectMongo() {
  try {
    await client.connect();
    const db = client.db("nasaApp");
    nasaCollection = db.collection("likedImages");
    console.log("Connected to MongoDB!");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}
connectMongo();


app.get('/', async function(req, res) {
  try {
    const response = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=${nasaApi
}`);
    res.render('index', { nasaData: response.data });
  } catch (err) {
    res.status(500).send("Error fetching NASA data");
  }
});


app.post('/save', async function(req, res) {
  try {
    const imageData = req.body;
    await nasaCollection.insertOne(imageData);
    res.redirect('/gallery');
  } catch (err) {
    res.status(500).send("Error saving to MongoDB");
  }
});


app.get('/gallery', async function(req, res) {
  try {
    const images = await nasaCollection.find({}).toArray();
    res.render('gallery', { images });
  } catch (err) {
    res.status(500).send("Error loading saved images");
  }
});


app.post('/delete', async function(req, res) {
  try {
    const { id } = req.body;
    await nasaCollection.deleteOne({ _id: new ObjectId(id) });
    res.redirect('/gallery');
  } catch (err) {
    res.status(500).send("Error deleting image");
  }
});


app.get('/past', function(req, res) {
  res.render('date');
});


app.post('/date', async function(req, res) {
  const date = req.body.date;
  try {
    const response = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=${nasaApi
}&date=${date}`);
    res.render('index', { nasaData: response.data });
  } catch (err) {
    res.status(500).send("Error fetching date image");
  }
});

app.listen(3000, function(){
    console.log('Our app is running on port 3000');
})
