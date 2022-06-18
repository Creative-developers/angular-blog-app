const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const moment = require('moment');
const Joi = require('joi');

let saltRounds = 10;


const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        maxLength: 20
    },
    lastName: {
        type: String,
        maxLength: 20,
    },
    username: {
        type: String,
        minLength: 3,
        maxLength: 20,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        minlength: 6,
    },
    IsAdmin: Boolean,
    isActive: Boolean,
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})

UserSchema.pre('save', function(next) {
    let user = this;
    if (user.isModified('password')) {
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if (err) return next(err)

            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) return next(err)
                user.password = hash
                next();
            })
        })
    } else {
        next()
    }
})

function validate(user) {
    const schema = Joi.object({
        firstName: Joi.string().min(3).required(),
        lastName: Joi.string().min(3).required(),
        username: Joi.string().min(3).max(20).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    })
    return schema.validate(user)
}

const User = mongoose.model('User', UserSchema);
module.exports = { User, validate }
