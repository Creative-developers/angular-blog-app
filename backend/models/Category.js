const mongoose = require('mongoose')
const joi = require('joi');
const moment = require('moment')


const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        maxLength: 20,
        required: true
    },
    slug: {
        type: String,
        required: true
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})

const Category = mongoose.model('Category', CategorySchema)
module.exports = Category