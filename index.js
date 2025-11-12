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





connectDB(async () => {
  app.listen(port, () => {
    console.log(`FoodLovers app listening at http://localhost:${port}`);
  });
});
