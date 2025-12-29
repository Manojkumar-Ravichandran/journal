import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI!;

export default async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGO_URI);
}
