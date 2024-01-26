const { model, Schema } = require("mongoose");

const userSchema = new Schema({
    username:   { type: String, required: true, unique: true },
    password:   { type: String, required: true               },
    Role:       { type: String, default: "User"              },
    createdAt:  { type: Date,   default: Date.now            }
});

const User = model('User', userSchema);
module.exports = User;
