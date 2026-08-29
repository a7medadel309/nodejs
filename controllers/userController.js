const bcrypt = require("bcrypt");

const User = require("../models/user");
const Post = require("../models/Post");
const AppError = require("../utils/AppError");
const jwt = require("jsonwebtoken");


const register = async (req, res, next) => {
    try {
        const {
            username,
            email,
            password
        } = req.body;

        const existingUser = await User.findOne({
            email
        });

        if (existingUser) {
            return next(
                new AppError(
                    "Email already exists",
                    409
                )
            );
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        next(error);
    }
};


const login = async (req, res, next) => {
    try {
        const {
            email,
            password
        } = req.body;

        const user = await User.findOne({
            email
        });

        if (!user) {
            return next(
                new AppError(
                    "Invalid email or password",
                    401
                )
            );
        }

        const passwordCorrect =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordCorrect) {
            return next(
                new AppError(
                    "Invalid email or password",
                    401
                )
            );
        }

        const token = jwt.sign(
            {
                id: user._id.toString(),
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            message: "Login successful",
            token
        });

    } catch (error) {
        next(error);
    }
};


const getUsers = async (req, res, next) => {
    try {
        const users = await User.find()
            .select("-password");

        res.status(200).json(users);

    } catch (error) {
        next(error);
    }
};


const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(
            req.params.id
        ).select("-password");

        if (!user) {
            return next(
                new AppError(
                    "User not found",
                    404
                )
            );
        }

        res.status(200).json(user);

    } catch (error) {
        next(error);
    }
};


const updateUser = async (req, res, next) => {
    try {
        const data = {
            ...req.body
        };

        if (data.email) {
            const existingUser =
                await User.findOne({
                    email: data.email,
                    _id: {
                        $ne: req.params.id
                    }
                });

            if (existingUser) {
                return next(
                    new AppError(
                        "Email already exists",
                        409
                    )
                );
            }
        }

        if (data.password) {
            data.password =
                await bcrypt.hash(
                    data.password,
                    10
                );
        }

        const user =
            await User.findByIdAndUpdate(
                req.params.id,
                data,
                {
                    new: true,
                    runValidators: true
                }
            ).select("-password");

        if (!user) {
            return next(
                new AppError(
                    "User not found",
                    404
                )
            );
        }

        res.status(200).json(user);

    } catch (error) {
        next(error);
    }
};


const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(
            req.params.id
        );

        if (!user) {
            return next(
                new AppError(
                    "User not found",
                    404
                )
            );
        }

        await Post.deleteMany({
            author: user._id
        });

        await User.findByIdAndDelete(
            req.params.id
        );

        res.status(200).json({
            message:
                "User and posts deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    register,
    login,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
};