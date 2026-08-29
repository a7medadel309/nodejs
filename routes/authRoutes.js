const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController");

console.log("register:", typeof userController.register);
console.log("login:", typeof userController.login);

router.post("/register", userController.register);
router.post("/login", userController.login);

module.exports = router;