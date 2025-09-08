require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());


// task-manager
// F2mGgEBZwRpL7JIS

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.e3b4z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const userCollection = client.db('eventManagement').collection('users');

    const eventCollection = client.db('eventManagement').collection('events');

    const eventRegistrationCollection = client.db('eventManagement').collection('registrations');

    app.get('/', (req, res) => {
      res.send("simple crud is running");
    })

    app.post('/register', async (req, res) => {
      const data = req.body;
      const isExist = await userCollection.findOne({ email: data.email });
      if (isExist)
        return res.send({ message: 'user already exist.', insertedId: null });
      const result = await userCollection.insertOne(data);
      res.send(result);
    });

    app.get('/role', async (req, res) => {
      const options = {
        projection: { _id: 0, role: 1 }
      }
      const result = await userCollection.findOne({ email: req.query.email }, options);
      res.send(result);
    })


    app.post('/add-event', async (req, res) => {
      const data = req.body;
      const result = await eventCollection.insertOne(data);
      res.send(result);
    })

    app.get('/events', async (req, res) => {
      const { category } = req.query;
      let result;
      if (category === 'all') {
        result = await eventCollection.find().toArray();
      }
      else {
        result = await eventCollection.find({category:category}).toArray();
      }
      res.send(result);
    })

    app.get('/events/:id', async (req, res) => {
      const id = req.params.id;
      const result = await eventCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    })

    app.post('/event/registration', async (req, res) => {
      const data = req.body;
      const result = await eventRegistrationCollection.insertOne(data);
      res.send(result);
    })

    app.get('/my-bookings', async (req, res) => {
      const { email } = req.query;
      const result = await eventRegistrationCollection.aggregate([
        {
          $match: { email: email }
        },
        {
          $addFields: {
            objId: { $toObjectId: '$eventId' }
          }
        },
        {
          $lookup: {
            from: 'events',
            localField: 'objId',
            foreignField: '_id',
            as: 'bookedEvents'
          }
        },
        {
          $unwind: '$bookedEvents'
        },
        {
          $addFields: {
            eventName: '$bookedEvents.eventName',
            date: '$bookedEvents.date',
            image: '$bookedEvents.image',
          }
        },
        {
          $project: {
            eventName: 1,
            date: 1,
            tickets: 1,
            image: 1,
            _id: 1,
          }
        }
      ]).toArray();
      res.send(result);
    })

    app.get('/featured-event', async (req, res) => {
      const result = await eventCollection.find().limit(3).toArray();
      res.send(result);
    })

  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Simple crud is running on port: ${port}`);
})