const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth");
const validate = require("../middleware/validation");
const upload = require("../middleware/upload");

const {
    createPostSchema,
    updatePostSchema
} = require("../validation/postValidation");

const {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost
} = require("../controllers/postController");

router.post(
    "/",
    protect,
    upload.array("images", 5),
    validate(createPostSchema),
    createPost
);

router.get(
    "/",
    protect,
    getPosts
);

router.get(
    "/:id",
    protect,
    getPostById
);

router.patch(
    "/:id",
    protect,
    upload.array("images", 5),
    validate(updatePostSchema),
    updatePost
);

router.delete(
    "/:id",
    protect,
    deletePost
);

module.exports = router;