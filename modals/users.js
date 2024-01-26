const { model, Schema } = require("mongoose");
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    username:   { type: String, required: true, unique: true },
    password:   { type: String, required: true               },
    Role:       { type: String, default: "User"              },
    createdAt:  { type: Date,   default: Date.now            }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(5);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (err) { return next(err); }
    
});

userSchema.methods.validatePassword = async function validatePassword(data) {
    return bcrypt.compare(data, this.password);
};

const User = model('User', userSchema);
module.exports = User;
