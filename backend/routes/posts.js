const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Post = require('../models/Post')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const Category = require('../models/Category')
const User = require('../models/User')
const Comment = require('../models/Comment')

const {
    auth
} = require('../middleware/auth')




router.get('/', async(req, res) => {
    try {
        let posts = await Post.aggregate([{
                $lookup: {
                    from: 'categories',
                    localField: 'categories',
                    foreignField: '_id',
                    pipeline: [{
                        $project: {
                            _id: 1,
                            name: 1,
                            slug: 1
                        }
                    }],
                    as: 'categories'
                }
            },
            {
                $lookup: {
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'post',
                    pipeline: [{
                        $project: {
                            _id: 1
                        }
                    }],
                    as: 'comments'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: "user",
                    foreignField: "_id",
                    pipeline: [{
                        $project: {
                            _id: 1,
                            name: {
                                $concat: ['$firstName', ' ', '$lastName']
                            },
                            email: 1,
                            username: 1
                        }
                    }],
                    as: "user"
                }
            },
            // { 
            //     $addFields:{
            //        user:{
            //            $map:{
            //                input: '$user',
            //                 as:'user',
            //                 in:{
            //                     _id:'$$user._id',
            //                     name:{
            //                         $concat:['$$user.firstName',' ', '$$user.lastName']
            //                     },
            //                     email:'$$user.email',
            //                     username:'$$user.username'
            //                 }
            //            }

            //        }
            //     }
            // },
            {
                $unwind: '$user'
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        ])
        res.status(200).json({
            success: true,
            posts
        })
    } catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
});


/**
 * Get Posts By User
 */
router.get('/user', auth, async(req, res) => {
    try {
        let posts = await Post.aggregate([{
                $match: {
                    user: mongoose.Types.ObjectId(req.user.id)
                }
            }, {
                $lookup: {
                    from: 'categories',
                    localField: 'categories',
                    foreignField: '_id',
                    pipeline: [{
                        $project: {
                            _id: 1,
                            name: 1,
                            slug: 1
                        }
                    }],
                    as: 'categories'
                }
            },
            {
                $lookup: {
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'post',
                    pipeline: [{
                        $project: {
                            _id: 1
                        }
                    }],
                    as: 'comments'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: "user",
                    foreignField: "_id",
                    pipeline: [{
                        $project: {
                            _id: 1,
                            name: {
                                $concat: ['$firstName', ' ', '$lastName']
                            },
                            email: 1,
                            username: 1
                        }
                    }],
                    as: "user"
                }
            },
            // { 
            //     $addFields:{
            //        user:{
            //            $map:{
            //                input: '$user',
            //                 as:'user',
            //                 in:{
            //                     _id:'$$user._id',
            //                     name:{
            //                         $concat:['$$user.firstName',' ', '$$user.lastName']
            //                     },
            //                     email:'$$user.email',
            //                     username:'$$user.username'
            //                 }
            //            }

            //        }
            //     }
            // },
            {
                $unwind: '$user'
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        ])
        res.status(200).json({
            success: true,
            posts
        })
    } catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
});

/**
 * Get Posts By Category Id
 */

router.get('/categories/:category', async(req, res) => {
    try {


        let checkPostByCategory = await Category.findOne({
            slug: req.params.category
        });

        if (!checkPostByCategory) {
            return res.status(404).json({
                success: false,
                error: `Category ${categoryName} not found`
            })
        }

        let posts = await Post.aggregate([{
                $match: {
                    categories: mongoose.Types.ObjectId(checkPostByCategory._id)
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categories',
                    foreignField: '_id',
                    pipeline: [{
                        $project: {
                            _id: 1,
                            name: 1,
                            slug: 1
                        }
                    }],
                    as: 'categories'
                }
            },
            {
                $lookup: {
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'post',
                    pipeline: [{
                        $project: {
                            _id: 1
                        }
                    }],
                    as: 'comments'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: "user",
                    foreignField: "_id",
                    pipeline: [{
                        $project: {
                            _id: 1,
                            name: {
                                $concat: ['$firstName', ' ', '$lastName']
                            },
                            email: 1,
                            username: 1
                        }
                    }],
                    as: "user"
                }
            },
            // { 
            //     $addFields:{
            //        user:{
            //            $map:{
            //                input: '$user',
            //                 as:'user',
            //                 in:{
            //                     _id:'$$user._id',
            //                     name:{
            //                         $concat:['$$user.firstName',' ', '$$user.lastName']
            //                     },
            //                     email:'$$user.email',
            //                     username:'$$user.username'
            //                 }
            //            }

            //        }
            //     }
            // },
            {
                $unwind: '$user'
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        ]);
        return res.status(200).json({
            success: true,
            posts
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
})


/**
 * Search Post
 */

router.get('/search', async(req, res) => {

    try {

        let serachQuery = req.query.keyword;
        if (serachQuery !== undefined && serachQuery !== '') {

            let posts = await Post.aggregate([{
                    $match: {
                        $text: {
                            $search: serachQuery
                        }
                    }
                },

                {
                    $lookup: {
                        from: 'categories',
                        localField: 'categories',
                        foreignField: '_id',
                        pipeline: [{
                            $project: {
                                _id: 1,
                                name: 1,
                                slug: 1
                            }
                        }],
                        as: 'categories'
                    }
                },
                {
                    $lookup: {
                        from: 'comments',
                        localField: '_id',
                        foreignField: 'post',
                        pipeline: [{
                            $project: {
                                _id: 1
                            }
                        }],
                        as: 'comments'
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: "user",
                        foreignField: "_id",
                        pipeline: [{
                            $project: {
                                _id: 1,
                                name: {
                                    $concat: ['$firstName', ' ', '$lastName']
                                },
                                email: 1,
                                username: 1
                            }
                        }],
                        as: "user"
                    }
                },
                {
                    $unwind: '$user'
                },
                {
                    $sort: {
                        createdAt: -1
                    },
                },

            ])
            return res.status(200).json({
                success: true,
                posts,
                total: posts.length
            });
        } else {
            return res.status(404).json({
                success: false,
                error: `Post ${serachQuery} not found`
            })
        }

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
})



/**
 * Get Single Post
 */
router.get('/:id', async(req, res) => {
    try {
        let post = await Post.aggregate([{
                $match: {
                    _id: mongoose.Types.ObjectId(req.params.id)
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categories',
                    foreignField: '_id',
                    pipeline: [{
                        $project: {
                            _id: 1,
                            name: 1,
                            slug: 1
                        }
                    }],
                    as: 'categories'
                }
            },
            {
                $lookup: {
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'post',
                    pipeline: [{
                        $project: {
                            _id: 1
                        }
                    }],
                    as: 'comments'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: "user",
                    foreignField: "_id",
                    pipeline: [{
                        $project: {
                            _id: 1,
                            name: {
                                $concat: ['$firstName', ' ', '$lastName']
                            },
                            email: 1,
                            username: 1
                        }
                    }],
                    as: "user"
                }
            },
            {
                $unwind: '$user'
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        ])
        res.status(200).json({
            success: true,
            post: post[0]
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
});

router.post('/', auth, async(req, res) => {
    try {
        //upload file first
        let uploadDir = process.env.upload_dir + '/posts'
        console.log(uploadDir)
        const storage = multer.diskStorage({
            destination: (req, res, cb) => {

                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, {
                        recursive: true
                    });
                }
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
            }
        })

        const upload = multer({
            storage: storage
        })

        upload.single('featuredImage')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                })
            } else if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                })
            } else {
                const {
                    title,
                    body,
                    status
                } = req.body

                var categories = req.body.categories.split(',');

                const post = new Post({
                    title,
                    body,
                    categories,
                    status,
                    user: req.user.id,
                    featuredImage: req.file ? req.file.filename : null
                })

                post.save().then(post => {
                    return res.status(201).json({
                        success: true,
                        post
                    })
                }, err => {
                    return res.status(500).json({
                        success: false,
                        message: err.message
                    })
                })

            }
        })
    } catch (error) {
        return res.status(400).json({
            error: error.message,
            message: 'Something went wrong in saving post'
        })
    }
})

router.put('/:postId', auth, async(req, res) => {
    try {
        //upload file first
        let uploadDir = process.env.upload_dir + '/posts'
        console.log(uploadDir)
        const storage = multer.diskStorage({
            destination: (req, res, cb) => {

                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync('public/uploads/posts', {
                        recursive: true
                    });
                }
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

                let checkFeaturedImage = Post.findById(req.params.postId).then(post => {
                    if (post.featuredImage && req.file) {
                        if (fs.existsSync(uploadDir + '/' + post.featuredImage)) {
                            fs.unlink(`${uploadDir}/${post.featuredImage}`, (err) => {
                                if (err) throw err;
                                console.log('File deleted!');
                            });
                        }
                    }
                });

                cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
            }
        })

        const upload = multer({
            storage: storage
        })

        upload.single('featuredImage')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                })
            } else if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                })
            } else {

                let postId = req.params.postId
                const updatePost = Post.findOne({
                    _id: req.params.postId,
                    user: req.user.id
                }, (err, post) => {
                    if (err) {
                        return res.status(404).json({
                            success: false,
                            message: `Post ${postId} not found in our record`,
                            error: err.message
                        })
                    }

                    var categories = req.body.categories.split(',');

                    console.log(req.file)

                    post.title = req.body.title
                    post.body = req.body.body
                    post.categories = categories
                    post.status = req.body.status
                    post.featuredImage = req.file ? req.file.filename : post.featuredImage

                    post.save().then(result => {
                        return res.status(201).json({
                            success: true,
                            result
                        })
                    }, err => {
                        return res.status(500).json({
                            success: false,
                            message: err.message
                        })
                    })
                });

            }
        })
    } catch (error) {
        return res.status(400).json({
            error: error.message,
            message: 'Something went wrong in saving post'
        })
    }
})

router.delete('/:postId', auth, async(req, res) => {

    try {
        let postId = req.params.postId
        const post = await Post.findOne({
            _id: req.params.postId,
            user: req.user.id
        })
        if (!post) {
            return res.status(404).json({
                success: false,
                message: `Post ${postId} not found in our record`,
                error: `Post ${postId} not found in our record`
            })
        }

        const result = await post.remove();
        if (result) {
            if (post.featuredImage) {
                if (fs.existsSync(uploadDir + '/' + post.featuredImage)) {
                    fs.unlink(`${uploadDir}/${post.featuredImage}`, (err) => {
                        if (err) throw err;
                        console.log('File deleted!');
                    });
                }
            }
            Comment.find({
                post: postId
            }).then(comments => {
                comments.forEach(comment => {
                    comment.remove()
                })
            })
        }

        res.status(200).json({
            success: true,
            message: `Post ${postId} deleted successfully`,
            post
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong.',
            error: err
        })
    }
})

router.delete('/', auth, async(req, res) => {
    try {
        await Post.deleteMany({}).exec().then(() => {
            return res.status(200).json({
                success: true,
                message: 'All posts deleted successfully'
            })
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong.',
            error: err
        })
    }
});

router.delete('/:postId', auth, async(req, res) => {
    try {
        let post = await Post.findOne({
            _id: req.params.postId
        })
        if (!post) {
            return res.status(404).json({
                error: 'Post not found'
            })
        }
        await post.remove()
        res.status(200).json({
            success: true,
            message: 'Post deleted'
        })
    } catch (err) {
        res.status(500).json({
            error: err
        })
    }
})


module.exports = router