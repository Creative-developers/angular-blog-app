const mongoose = require('mongoose')


const UserProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    phoneNumber: {
        type: String
    },
    about: {
        type: String
    },
    image: {
        type: String
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})

const UserProfile = mongoose.model('user_profile', UserProfileSchema)
module.exports = UserProfile