import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn  = await mongoose.connect(process.env.MONGODB_LOCAL);
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
  }
};

export default connectDB;