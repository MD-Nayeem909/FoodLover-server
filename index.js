import "dotenv/config";
import cors from "cors";
import express from "express";
import morgan from "morgan";

import { connectDB } from "./dbConnection.js";

import router from "./router/authRoutes.js";
import reviewRoutes from "./router/reviewRoutes.js";
import userRouter from "./router/userRoutes.js";

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/auth", router);
app.use("/api/reviews", reviewRoutes);
app.use("/api/user", userRouter);

connectDB(async () => {
  app.listen(port, () => {
    console.log(`FoodLovers app listening at http://localhost:${port}`);
  });
});
