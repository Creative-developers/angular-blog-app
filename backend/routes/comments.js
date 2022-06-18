const mongoose = require('mongoose')
const express = require('express')
const router = express.Router();
const Comment = require('../models/Comment')
const Pusher = require('pusher');
const {
    auth
} = require('../middleware/auth');
const Post = require('../models/Post');

const pusher = new Pusher({
    appId: '1423742',
    key: 'e6e2d942a6264f1677b0',
    secret: 'ecb26e6a03ab50c522d5',
    cluster: 'ap2',
    encrypted: true,
});

router.get('/:postId', async(req, res) => {
    try {
        Comment.aggregate([{
                    $match: {
                        post: mongoose.Types.ObjectId(req.params.postId)
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        pipeline: [{
                            $project: {
                                username: 1,
                                name: {
                                    $concat: ['$firstName', ' ', '$lastName']
                                },
                                email: 1
                            }
                        }, {

                            $lookup: {
                                from: 'user_profiles',
                                localField: '_id',
                                foreignField: 'user',
                                as: 'profile',
                            }

                        }, {
                            $unwind: '$profile'
                        }],
                        as: 'user',
                    }
                },
                {
                    $unwind: '$user'
                },


                {
                    $lookup: {
                        from: 'posts',
                        localField: 'post',
                        foreignField: '_id',
                        pipeline: [{
                            $project: {
                                _id: 1,
                                title: 1,
                            }
                        }],
                        as: 'post',
                    }
                }, {
                    $unwind: '$post'
                }, {
                    $sort: {
                        postedDate: 1
                    }
                }
            ]).exec()
            // Comment.find({
            //         post: req.params.postId,
            //         status: 1
            //     }).populate('user', '').sort({
            //         postedDate: 1
            //     }).lean().exec()
            .then(comments => {

                let rec = (comment, threads) => {
                    threads.forEach(thread => {
                        value = thread

                        if (thread._id.toString() === comment.parentId.toString()) {
                            value.childrens.push(comment)
                            return;
                        }

                        if (value.childrens) {
                            rec(comment, value.childrens)
                        }
                    })
                }

                let threads = [],
                    comment
                for (let i = 0; i < comments.length; i++) {
                    comment = comments[i]
                    comment['childrens'] = []

                    let parentId = comment.parentId
                    if (!parentId) {
                        threads.push(comment)
                        continue
                    }
                    rec(comment, threads)
                }
                return res.status(200).json({
                    success: true,
                    comments: threads,
                    count: comments.length
                })
            }, err => {
                return res.status(500).json({
                    message: "Something went wront",
                    error: err.message
                })
            })
    } catch (err) {
        return res.status(500).json({
            message: "Something went wront",
            error: err.message
        })
    }
})

router.post('/:postId', auth, async(req, res) => {
    try {
        await Post.findOne({
            _id: req.params.postId
        }).then(async post => {
            if (!post) {
                return res.status(400).json({
                    success: false,
                    message: 'No Post found with id' + req.params.postId
                })
            }
            const {
                body
            } = req.body
            const comment = new Comment({
                body,
                user: req.user.id,
                post: req.params.postId,
            })

            if ('parentId' in req.body) {
                comment.parentId = req.body.parentId
            }
            if ('depth' in req.body) {
                comment.depth = req.body.depth
            }
            await comment.save()

            pusher.trigger('comments', `comment-added-${req.params.postId}`, {
                comment: comment
            });

            return res.status(200).json({
                success: true,
                comment,
                message: 'Comment added successfully'
            })
        }, err => {
            return res.status(500).json({
                message: `Post not found by id '${req.params.postId}'`,
                error: err.message,
                success: false
            })
        })

    } catch (err) {
        return res.status(500).json({
            message: 'Something went wrong',
            error: err.message
        })
    }
})



router.delete('/:commentId', auth, async(req, res) => {
    try {
        let comment = await Comment.findOne({
                _id: req.params.commentId
            }).lean().exec()
            .then(comment => {

                let rec = (comments) => {
                    comments.forEach((comment, i) => {


                        Comment.find({
                                parentId: comment._id
                            }).lean().exec()
                            .then(comments => {
                                if (comments.length > 0) {
                                    rec(comments);
                                } else {
                                    Comment.deleteOne({
                                            _id: comment._id
                                        })
                                        .then(() => {
                                            return;
                                        }, err => {
                                            return false
                                        })
                                    return;
                                }
                            })

                    })
                }


                let comments = {}

                Comment.find({
                        parentId: comment._id
                    }).lean().exec()
                    .then(comments => {
                        if (commments.length > 0) rec(comments)
                            //  rec(comments)
                    }, err => {
                        return res.status(500).json({
                            message: "Something went wront",
                            error: err.message
                        })
                    })

                Comment.deleteOne({
                        _id: comment._id
                    })
                    .then(() => {
                        return res.status(200).json({
                            success: true,
                            message: 'Comment deleted successfully'
                        })
                    }, err => {
                        return res.status(500).json({
                            message: "Something went wront",
                            error: err.message
                        })
                    })



            }, err => {
                return res.status(500).json({
                    message: "Something went wront",
                    error: err.message
                })
            })
            // await comment.remove()
            // return res.status(200).json({ success: true, message: 'Comment deleted successfully' })
    } catch (err) {
        return res.status(500).json({
            message: 'Something went wrong',
            error: err.message
        })
    }
})

module.exports = router