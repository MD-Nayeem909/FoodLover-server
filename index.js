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

app.get("/api/reviews/:id", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const collection = await db.collection("reviews");
    const review = await collection.findOne({ _id: id });
    if (!review) {
      return res.status(404).send({
        data: {},
        success: false,
        message: "Reviews data not found",
      });
    }
    res.status(200).send({
      data: review,
      success: true,
      message: "Review fetched successfully",
    });
  } catch (err) {
    console.error("Review data fetch error:", err);
    res.status(500).send({
      data: {},
      success: false,
      message: "Review data fetch error",
    });
  }
})

app.post("/api/reviews", async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      data: {},
      success: false,
      message: "Review data not found",
    });
  }
  const reviewData = {...req.body, createdAt: new Date(), updatedAt: new Date()};
  try {
    const collection = await db.collection("reviews");

    const review = await collection.insertOne(reviewData);
    res.status(201).send({
      data: review,
      success: true,
      message: "Review created successfully",
    });
  } catch (err) {
    console.error("Review data create error:", err);
    res.status(500).send({
      data: {},
      success: false,
      message: "Review data create error",
    });
  }
})

app.put("/api/reviews/:id", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const collection = await db.collection("reviews");
    const review = await collection.findOne({ _id: id });
    if (!review) {
      return res.status(404).send({
        data: {},
        success: false,
        message: "Reviews data not found",
      });
    }
    const updatedReview = await collection.updateOne({ _id: id }, { $set: req.body });
    res.status(200).send({
      data: updatedReview,
      success: true,
      message: "Review updated successfully",
    });
  } catch (err) {
    console.error("Review data update error:", err);
    res.status(500).send({
      data: {},
      success: false,
      message: "Review data update error",
    });
  }
})





connectDB(async () => {
  app.listen(port, () => {
    console.log(`FoodLovers app listening at http://localhost:${port}`);
  });
});
