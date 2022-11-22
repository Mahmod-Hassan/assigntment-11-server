const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// middleware 
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lcblope.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
    const collection = client.db("test").collection("devices");
    // perform actions on the collection object
    client.close();
});

app.get('/', (req, res) => {
    res.send('service review server is running');
})
app.listen(port, () => {
    console.log(`server running on port ${port}`)
})