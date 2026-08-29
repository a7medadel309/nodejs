const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth");
const validate = require("../middleware/validation");

const {
    createGroupSchema
} = require("../validation/groupValidation");

const {
    createGroup,
    getGroups,
    addMember,
    removeMember,
    updatePermissions
} = require("../controllers/groupController");

router.post(
    "/",
    protect,
    validate(createGroupSchema),
    createGroup
);

router.get(
    "/",
    protect,
    getGroups
);

router.patch(
    "/:id/members/add",
    protect,
    addMember
);

router.patch(
    "/:id/members/remove",
    protect,
    removeMember
);

router.patch(
    "/:id/permissions",
    protect,
    updatePermissions
);

module.exports = router;