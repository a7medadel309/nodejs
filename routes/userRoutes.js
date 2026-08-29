const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth");
const restrictTo = require("../middleware/authorization");
const validate = require("../middleware/validation");

const {
    updateUserSchema
} = require("../validation/userValidation");

const {
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} = require("../controllers/userController");

router.get(
    "/",
    protect,
    getUsers
);

router.get(
    "/:id",
    protect,
    getUserById
);

router.patch(
    "/:id",
    protect,
    validate(updateUserSchema),
    updateUser
);

router.delete(
    "/:id",
    protect,
    restrictTo(
        "admin",
        "super-admin"
    ),
    deleteUser
);

module.exports = router;