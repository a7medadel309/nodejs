require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

connectDB()
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });

module.exports = app;