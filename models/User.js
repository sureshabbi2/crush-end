const mongoose = require("mongoose");
const { Schema } = mongoose;
const UserSchema = new Schema({
    id: {
        type: String,
    },
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    platform: {
        type: ['google']
    }
});
const User = mongoose.model("User", UserSchema);
module.exports = User;