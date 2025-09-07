require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

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

    app.get('/', (req, res) => {
      res.send("simple crud is running");
    })

    
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Simple crud is running on port: ${port}`);
})