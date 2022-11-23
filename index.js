const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// middleware 
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lcblope.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db('servicesReviews').collection('services');
        const reviewsCollection = client.db('servicesReviews').collection('reviews');

        app.get('/services', async (req, res) => {
            const query = {};
            if (req.query.limit === 'limit') {
                const services = await serviceCollection.find(query).limit(3).toArray();
                res.send(services);
            } else {
                const services = await serviceCollection.find(query).toArray();
                res.send(services);
            }

        })
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result);
        })
    }
    finally {

    }
}
run().catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('service review server is running');
})
app.listen(port, () => {
    console.log(`server running on port ${port}`)
})