require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

connectDB()
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.error(
            "Failed to connect to MongoDB:",
            error.message
        );
    });

module.exports = app;