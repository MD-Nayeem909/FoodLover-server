import express from "express";
import { ObjectId } from "mongodb";
import { authUser, verifyToken } from "../middleware/auth/auth.js";
import { parseTags } from "../utility/helper.js";
import { db } from "../dbConnection.js";

const reviewRoutes = express.Router();

reviewRoutes.get("/user/:id", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const collection = await db.collection("reviews");
    const reviews = await collection.findOne({ _id: id });
    const user = await db.collection("users").findOne({ _id: reviews.author });

    res.status(200).send({
      user: {
        id: user._id,
        name: user.username,
        email: user.email,
        image: user.photoURL,
      },
      success: true,
      message: "Review user fetched successfully",
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

// reviewRoutes.get("/", async (req, res) => {
//   try {
//     const collection = await db.collection("reviews");
//     const reviewData = await collection
//       .aggregate([
//         { $unwind: "$reviews" },
//         {
//           $lookup: {
//             from: "users",
//             localField: "author",
//             foreignField: "_id",
//             as: "author",
//           },
//         },
//         { $unwind: "$author" },

//       ])
//       .toArray();
//     console.log(reviewData);

//     res.status(200).send({
//       data: {},
//       success: true,
//       message: "Reviews fetched successfully",
//     });
//   } catch (err) {
//     console.error("Reviews data fetch error:", err);
//     res.status(500).send({
//       data: [],
//       success: false,
//       message: "Reviews data fetch error",
//     });
//   }
// });

reviewRoutes.get("/", async (req, res) => {
  try {
    const collection = await db.collection("reviews");

    // MAIN AGGREGATION
    const reviewData = await collection
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "author",
            pipeline: [
              {
                $project: {
                  username: 1,
                  // email: 1,
                  // photoURL: 1,
                },
              },
            ],
          },
        },
        { $unwind: "$author" },
      ])
      .toArray(); // IMPORTANT

    console.log(reviewData);

    res.status(200).send({
      data: reviewData,
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

reviewRoutes.get("/me", verifyToken, authUser, async (req, res) => {
  try {
    const collection = await db.collection("reviews");
    const reviews = await collection.find({ author: req.user._id }).toArray();
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

reviewRoutes.get("/:id", async (req, res) => {
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
});

reviewRoutes.post("/", verifyToken, authUser, async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      data: {},
      success: false,
      message: "Review data not found",
    });
  }

  const reviewData = {
    ...req.body,
    author: req.user._id,
    tags: parseTags(req.body.tags),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  console.log(reviewData);

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
});

reviewRoutes.put("/:id", verifyToken, async (req, res) => {
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
    const newReview = {
      ...req.body,
      tags: parseTags(req.body.tags),
      updatedAt: new Date(),
    };
    const updatedReview = await collection.updateOne(
      { _id: id },
      { $set: newReview }
    );
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
});

reviewRoutes.delete("/:id", verifyToken, async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const collection = await db.collection("reviews");
    const review = await collection.deleteOne({ _id: id });
    res.status(200).send({
      data: review,
      success: true,
      message: "Review deleted successfully",
    });
  } catch (err) {
    console.error("Review data delete error:", err);
    res.status(500).send({
      data: {},
      success: false,
      message: "Review data delete error",
    });
  }
});

reviewRoutes.put("/:id/favorite", verifyToken, authUser, async (req, res) => {
  try {
    const isFavorite = req.body.isFavorite;
    console.log("🚀 ~ index.js:229 ~ isFavorite:", isFavorite);

    const reviewId = req.params.id;
    const userFavorite = req.user.favorites.find(
      (favorite) => favorite.id === reviewId
    );

    if (!userFavorite && isFavorite) {
      // add favorite
      const collection = await db.collection("users");
      const updatedUser = await collection.updateOne(
        { _id: req.user._id },
        { $addToSet: { favorites: new ObjectId(reviewId) } }
      );
      res.status(200).send({
        data: updatedUser,
        success: true,
        message: "Favorite added successfully",
      });
      return;
    } else {
      // remove favorite
      const collection = await db.collection("users");
      const updatedUser = await collection.updateOne(
        { _id: req.user._id },
        { $pull: { favorites: new ObjectId(reviewId) } }
      );
      res.status(200).send({
        data: updatedUser,
        success: true,
        message: "Favorite removed successfully",
      });
      return;
    }
  } catch (err) {
    console.error("Favorite data update error:", err);
    res.status(500).send({
      data: {},
      success: false,
      message: "Favorite data update error",
    });
  }
});
export default reviewRoutes;
