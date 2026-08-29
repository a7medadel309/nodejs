const Post = require("../models/Post");
const User = require("../models/user");
const Group = require("../models/Group");
const AppError = require("../utils/AppError");
const imagekit = require("../config/imagekit");

const createPost = async (req, res, next) => {
    try {
        const {
            title,
            content,
            group
        } = req.body;

        let groupData = null;

        if (group) {
            groupData =
                await Group.findById(group);

            if (!groupData) {
                return next(
                    new AppError(
                        "Group not found",
                        404
                    )
                );
            }

            const isMember =
                groupData.members.some(
                    id =>
                        id.toString() ===
                        req.user.id
                );

            const isAdmin =
                groupData.admins.some(
                    id =>
                        id.toString() ===
                        req.user.id
                );

            const isSuperAdmin =
                req.user.role ===
                "super-admin";

            if (
                !isMember &&
                !isAdmin &&
                !isSuperAdmin
            ) {
                return next(
                    new AppError(
                        "You are not allowed to post in this group",
                        403
                    )
                );
            }

            if (
                !groupData.permissions.canPost &&
                !isAdmin &&
                !isSuperAdmin
            ) {
                return next(
                    new AppError(
                        "Posting is disabled in this group",
                        403
                    )
                );
            }
        }

        const images = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                if (
                    process.env.IMAGEKIT_PRIVATE_KEY &&
                    process.env.IMAGEKIT_PRIVATE_KEY !==
                        "YOUR_PRIVATE_KEY"
                ) {
                    const result =
                        await imagekit.upload({
                            file: file.buffer,
                            fileName:
                                `${Date.now()}-${file.originalname}`
                        });

                    images.push(
                        result.url
                    );
                }
            }
        }

        const post = await Post.create({
            title,
            content,
            images,
            author: req.user.id,
            group: group || null
        });

        const result =
            await post.populate(
                "author",
                "-password"
            );

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

const getPosts = async (req, res, next) => {
    try {
        let {
            page = 1,
            limit = 10,
            search
        } = req.query;

        page = Number(page);
        limit = Number(limit);

        const filter = {
            $or: [
                {
                    group: null
                },
                {
                    group: {
                        $in: []
                    }
                }
            ]
        };

        const groups =
            await Group.find({
                members: req.user.id
            });

        const adminGroups =
            await Group.find({
                admins: req.user.id
            });

        const groupIds = [
            ...groups,
            ...adminGroups
        ].map(group => group._id);

        filter.$or = [
            {
                group: null
            },
            {
                group: {
                    $in: groupIds
                }
            }
        ];

        if (search) {
            filter.title = {
                $regex: search,
                $options: "i"
            };
        }

        const posts = await Post.find(filter)
            .populate("author", "-password")
            .populate("group")
            .sort({
                createdAt: -1
            })
            .skip(
                (page - 1) * limit
            )
            .limit(limit);

        const total =
            await Post.countDocuments(
                filter
            );

        res.status(200).json({
            page,
            limit,
            total,
            pages:
                Math.ceil(
                    total / limit
                ),
            posts
        });
    } catch (error) {
        next(error);
    }
};

const getPostById = async (
    req,
    res,
    next
) => {
    try {
        const post =
            await Post.findById(
                req.params.id
            )
                .populate(
                    "author",
                    "-password"
                )
                .populate("group");

        if (!post) {
            return next(
                new AppError(
                    "Post not found",
                    404
                )
            );
        }

        res.status(200).json(post);
    } catch (error) {
        next(error);
    }
};

const updatePost = async (
    req,
    res,
    next
) => {
    try {
        const post =
            await Post.findById(
                req.params.id
            );

        if (!post) {
            return next(
                new AppError(
                    "Post not found",
                    404
                )
            );
        }

        const isOwner =
            post.author.toString() ===
            req.user.id;

        const isSuperAdmin =
            req.user.role ===
            "super-admin";

        if (!isOwner && !isSuperAdmin) {
            return next(
                new AppError(
                    "You can only edit your own posts",
                    403
                )
            );
        }

        const updated =
            await Post.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            )
                .populate(
                    "author",
                    "-password"
                )
                .populate("group");

        res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
};

const deletePost = async (
    req,
    res,
    next
) => {
    try {
        const post =
            await Post.findById(
                req.params.id
            );

        if (!post) {
            return next(
                new AppError(
                    "Post not found",
                    404
                )
            );
        }

        const isOwner =
            post.author.toString() ===
            req.user.id;

        const isSuperAdmin =
            req.user.role ===
            "super-admin";

        if (!isOwner && !isSuperAdmin) {
            return next(
                new AppError(
                    "You can only delete your own posts",
                    403
                )
            );
        }

        await Post.findByIdAndDelete(
            req.params.id
        );

        res.status(200).json({
            message:
                "Post deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost
};