const express = require("express");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const groupRoutes = require("./routes/groupRoutes");

const errorHandler =
    require("./middleware/errorHandler");

const app = express();

app.use(express.json());

app.use(
    "/auth",
    authRoutes
);

app.use(
    "/users",
    userRoutes
);

app.use(
    "/posts",
    postRoutes
);

app.use(
    "/groups",
    groupRoutes
);

app.get("/", (req, res) => {
    res.json({
        message: "Blog API is running"
    });
});

app.use(errorHandler);


console.log("APP.JS LOADED");

module.exports = app;