import express from "express";
import { passwordHash, passwordVerify } from "../utility/passVerify.js";
import jwt from "jsonwebtoken";
import { db } from "../dbConnection.js";
const authRouter = express.Router();

// register
authRouter.post("/signup", async (req, res) => {
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
authRouter.post("/login", async (req, res) => {
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
    const user = await collection.findOne({ email });

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

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).send({
      token,
      success: true,
      message: "User logged in successfully",
    });
  } catch (err) {
    res.status(500).send({
      data: {},
      success: false,
      message: "User data fetch error",
    });
  }
});

export default authRouter;
