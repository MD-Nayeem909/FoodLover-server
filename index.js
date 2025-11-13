import cors from "cors";
import express from "express";
import { connectDB, db } from "./dbConnection.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

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
});

app.post("/api/reviews", async (req, res) => {
  console.log(req.body);
  
  if (!req.body) {
    return res.status(400).send({
      data: {},
      success: false,
      message: "Review data not found",
    });
  }
  const reviewData = {
    ...req.body,
    tags: req.body.tags.split(","),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
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
    const updatedReview = await collection.updateOne(
      { _id: id },
      { $set: req.body }
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

app.delete("/api/reviews/:id", async (req, res) => {
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

const verifyFireBaseToken = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authorization.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    console.log("inside token", decoded);
    req.token_email = decoded.email;
    next();
  } catch (error) {
    return res.status(401).send({ message: "unauthorized access" });
  }
};

function passwordHash(password) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}
function passwordVerify(password, hash) {
  return bcrypt.compareSync(password, hash);
}

// register
app.post("/auth/signup", async (req, res) => {
  if (!req.body || !req.body.email || !req.body.password) {
    return res.status(400).send({
      data: {},
      success: false,
      message: "User data not found",
    });
  }
  try {
    const user = {
      ...req.body,
      password: passwordHash(req.body.password),

      favorites: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const collection = await db.collection("users");
    const newUser = await collection.insertOne(user);
    res.status(201).send({
      data: newUser,
      success: true,
      message: "User created successfully",
    });
  } catch (err) {
    console.error("User data create error:", err);
    res.status(500).send({
      data: {},
      success: false,
      message: { error: "User data create error", errorMessage: err.message },
    });
  }
});

// login
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send({
      data: {},
      success: false,
      message: "Email and password are required",
    });
  }
  try {
    const collection = db.collection("users");
    const user = collection.findOne({ email });
    if (!user) {
      return res.status(401).send({
        data: {},
        success: false,
        message: "User not found",
      });
    }
    if (!passwordVerify(password, user.password)) {
      return res.status(401).send({
        data: {},
        success: false,
        message: "Invalid password",
      });
    }
    const token = jwt.sign({ email }, "secret", { expiresIn: "1h" });
    res.status(200).send({
      token,
      success: true,
      message: "User logged in successfully",
    });
  } catch (err) {
    console.error("User data fetch error:", err);
    res.status(500).send({
      data: {},
      success: false,
      message: "User data fetch error",
    });
  }
});

connectDB(async () => {
  app.listen(port, () => {
    console.log(`FoodLovers app listening at http://localhost:${port}`);
  });
});
