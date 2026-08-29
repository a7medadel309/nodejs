const Group = require("../models/Group");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const createGroup = async (
    req,
    res,
    next
) => {
    try {
        const {
            name,
            canPost = true
        } = req.body;

        const existing =
            await Group.findOne({
                name
            });

        if (existing) {
            return next(
                new AppError(
                    "Group already exists",
                    409
                )
            );
        }

        const group =
            await Group.create({
                name,
                admins: [req.user.id],
                members: [req.user.id],
                permissions: {
                    canPost
                }
            });

        res.status(201).json(group);
    } catch (error) {
        next(error);
    }
};

const getGroups = async (
    req,
    res,
    next
) => {
    try {
        const groups =
            await Group.find()
                .populate(
                    "admins",
                    "-password"
                )
                .populate(
                    "members",
                    "-password"
                );

        res.status(200).json(groups);
    } catch (error) {
        next(error);
    }
};

const addMember = async (
    req,
    res,
    next
) => {
    try {
        const group =
            await Group.findById(
                req.params.id
            );

        if (!group) {
            return next(
                new AppError(
                    "Group not found",
                    404
                )
            );
        }

        const isAdmin =
            group.admins.some(
                id =>
                    id.toString() ===
                    req.user.id
            );

        const isSuperAdmin =
            req.user.role ===
            "super-admin";

        if (!isAdmin && !isSuperAdmin) {
            return next(
                new AppError(
                    "Only group admins can manage users",
                    403
                )
            );
        }

        const user =
            await User.findById(
                req.body.userId
            );

        if (!user) {
            return next(
                new AppError(
                    "User not found",
                    404
                )
            );
        }

        if (
            !group.members.includes(
                user._id
            )
        ) {
            group.members.push(
                user._id
            );
        }

        await group.save();

        res.status(200).json(group);
    } catch (error) {
        next(error);
    }
};

const removeMember = async (
    req,
    res,
    next
) => {
    try {
        const group =
            await Group.findById(
                req.params.id
            );

        if (!group) {
            return next(
                new AppError(
                    "Group not found",
                    404
                )
            );
        }

        const isAdmin =
            group.admins.some(
                id =>
                    id.toString() ===
                    req.user.id
            );

        const isSuperAdmin =
            req.user.role ===
            "super-admin";

        if (!isAdmin && !isSuperAdmin) {
            return next(
                new AppError(
                    "Only group admins can manage users",
                    403
                )
            );
        }

        group.members =
            group.members.filter(
                id =>
                    id.toString() !==
                    req.body.userId
            );

        group.admins =
            group.admins.filter(
                id =>
                    id.toString() !==
                    req.body.userId
            );

        await group.save();

        res.status(200).json(group);
    } catch (error) {
        next(error);
    }
};

const updatePermissions = async (
    req,
    res,
    next
) => {
    try {
        const group =
            await Group.findById(
                req.params.id
            );

        if (!group) {
            return next(
                new AppError(
                    "Group not found",
                    404
                )
            );
        }

        const isAdmin =
            group.admins.some(
                id =>
                    id.toString() ===
                    req.user.id
            );

        const isSuperAdmin =
            req.user.role ===
            "super-admin";

        if (!isAdmin && !isSuperAdmin) {
            return next(
                new AppError(
                    "Only group admins can change permissions",
                    403
                )
            );
        }

        group.permissions.canPost =
            req.body.canPost;

        await group.save();

        res.status(200).json(group);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createGroup,
    getGroups,
    addMember,
    removeMember,
    updatePermissions
};