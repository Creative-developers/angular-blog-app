const mongoose = require('mongoose')


const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minLength: 6,
    },
    body: {
        type: String,
        required: true,
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['published', 'draft'],
        default: "published"
    },
    featuredImage: {
        type: String
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})

PostSchema.index({
    title: 'text',
    categories: 'text'
});


const Post = mongoose.model('Post', PostSchema)
Post.createIndexes();
module.exports = Post