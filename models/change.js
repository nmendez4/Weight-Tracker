const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const changeSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            required: "Enter "
        },
        value: {
            type: Number,
            required: "Enter an amount"
        },
        date: {
            type: Date,
            default: Date.now
        }
    }
);

const Change = mongoose.model("Change", changeSchema);

module.exports = Change;