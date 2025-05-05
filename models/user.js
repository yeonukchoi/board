const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    userNickname: {type: String, required: true},
    userName: {type: String, required: true, unique: true },
    password: {type: String, required: true },
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);