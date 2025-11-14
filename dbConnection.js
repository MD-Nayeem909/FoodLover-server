import { MongoClient } from "mongodb";

// Replace with your MongoDB connection string
const uri =
  "mongodb+srv://mdnayeemuddin909_db_user:oAV7c8kXwuuqdWsY@cluster0.07g9nof.mongodb.net/?appName=Cluster0&retryWrites=true&w=majority";


const client = new MongoClient(uri);
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
