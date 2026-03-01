import mongoose from "mongoose";

const MONGO_URL = "mongodb://localhost:27017/civiceye-project-db";

const connectToDB = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("mongodb connected successfully");
    } catch (error) {
        console.log("mongodb error while connecting", error);
    }
};

export default connectToDB;