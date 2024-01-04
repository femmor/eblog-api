import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dbUri = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(dbUri, {
      autoIndex: true,
    });
    console.log(`Connected to database successfully!`);
  } catch (error) {
    console.log(`Error connecting to database: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
