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

        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        })
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
        app.get('/reviews', async (req, res) => {
            const query = {};
            const reviews = await reviewsCollection.find(query).toArray();
            res.send(reviews);
        })
        app.delete('/my-reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewsCollection.deleteOne(query);
            res.send(result);
        })
        app.get('/my-reviews', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const results = await reviewsCollection.find(query).toArray();
            res.send(results);
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