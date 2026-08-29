const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 100
        },

        content: {
            type: String,
            required: true,
            minlength: 5
        },

        images: [
            {
                type: String
            }
        ],

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Post", postSchema);