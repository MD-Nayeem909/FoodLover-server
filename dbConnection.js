import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
let db;

export async function connectDB(callback) {
  try {
    await client.connect();
    db = client.db("review_database");
    console.log("Connected to MongoDB");
    callback();
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}
export { db };
