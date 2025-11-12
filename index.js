import cors from "cors";
import express from "express";
import { connectDB, db } from "./dbConnection.js";
import { ObjectId } from "mongodb";

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/api/reviews", async (req, res) => {
  try {
    const collection = await db.collection("reviews");
    const reviews = await collection.find({}).toArray();
    res.status(200).send({
    data: reviews,
    success: true,
    message: "Reviews fetched successfully",
  });
  } catch (err) {
    console.error("Reviews data fetch error:", err);
    res.status(500).send({
      data: [],
      success: false,
      message: "Reviews data fetch error",
    });
  }
});




app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/reviews", async (req, res) => {
  //   const collection = await db.collection("reviews").find({}).toArray();

  // demo data create on database
  const collection = await db.collection("reviews").insertMany(
    data.map((item) => ({
      ...item,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  );

  res.send(collection);
});

connectDB(async () => {
  app.listen(port, () => {
    console.log(`FoodLovers app listening at http://localhost:${port}`);
  });
});
