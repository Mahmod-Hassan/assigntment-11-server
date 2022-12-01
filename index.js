const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// middleware 
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lcblope.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const validUser = req.headers.authorization;
    if (!validUser) {
        return res.status(401).send('unauthorized access');
    }
    const token = validUser.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'forbiddedn access' })
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const serviceCollection = client.db('servicesReviews').collection('services');
        const reviewsCollection = client.db('servicesReviews').collection('reviews');
        const userCollection = client.db('servicesReviews').collection('users');

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            if (user) {
                var token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' })
                return res.send({ accessToken: token })
            }
            res.status(401).send({ message: 'no token found' })
        })
        app.put('/users', async (req, res) => {
            const user = req.body;
            const email = req.query.email;
            const options = { upsert: true };
            const filter = { email: email };
            const updatedDoc = {
                $set: user
            }
            const result = await userCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        })
        app.get('/services', async (req, res) => {
            const query = {};
            const services = await serviceCollection.find(query).toArray();
            res.send(services)
        })
        app.get('/service-limit', async (req, res) => {
            const query = {};
            const services = await serviceCollection.find(query).limit(3).toArray();
            res.send(services);
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
        app.get('/all-reviews', async (req, res) => {
            const query = {};
            const reviews = await reviewsCollection.find(query).toArray();
            res.send(reviews);
        })
        app.delete('/delete-my-reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewsCollection.deleteOne(query);
            res.send(result);
        })
        app.get('/my-reviews', verifyJWT, async (req, res) => {
            const email = req.query.email;
            console.log(email);
            const query = { email: email };
            const results = await reviewsCollection.find(query).toArray();
            res.send(results);
        })
        app.get('/edit-review/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewsCollection.findOne(query);
            res.send(result);
        })
        app.put('/edit-review/:id', async (req, res) => {
            const id = req.params.id;
            const updateReview = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: updateReview
            }
            const result = await reviewsCollection.updateOne(filter, updatedDoc, options);
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