const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const fileUpload = require("express-fileupload");

require("dotenv").config();
const cors = require("cors");

const port = process.env.PORT || 65000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4c1ex.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    const database = client.db("linkDepo");
    const usersCollection = database.collection("users");
    const profileCollection = database.collection("profile");

    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/profile", async (req, res) => {
      const cursor = profileCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.json(user);
    });

    app.get("/profile/user/:userName", async (req, res) => {
      const username = req.params.userName;
      const query = { userName: username };
      const user = await profileCollection.findOne(query);
      res.json(user);
    });

    app.get("/profile/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const profile = await profileCollection.findOne(query);
      res.json(profile);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    app.post("/profile", async (req, res) => {
      const email = req.body.email;
      const firstName = req.body.firstName;
      const lastName = req.body.lastName;
      const userName = req.body.userName;
      const profilePic = req?.files?.profilePic;
      const profilePicData = profilePic?.data;
      const encodedProfilePic = profilePicData?.toString("base64");
      const profilePicBuffer = Buffer.from(encodedProfilePic, "base64");
      const coverPic = req?.files?.coverPhoto;
      const coverPicData = coverPic?.data;
      const encodedCoverPic = coverPicData?.toString("base64");
      const coverPicBuffer = Buffer.from(encodedCoverPic, "base64");
      const allData = {
        profilePic: profilePicBuffer,
        coverPhoto: coverPicBuffer,
        email,
        firstName,
        lastName,
        userName,
      };
      // console.log(allData);
      const result = await profileCollection.insertOne(allData);
      res.json(result);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Ema jon server is running and running");
});

app.listen(port, () => {
  console.log("Server running at port", port);
});
