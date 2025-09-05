const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
        required: true,
    },
    starts: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
        validate: {
            validator: function (v) {
                return v * 2 === Math.floor(v * 2);
            },
            message: props => `${props.value} no es un valor válido`
        }
    },
    comments: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Review", reviewSchema);
