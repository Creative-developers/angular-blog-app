const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const config = require('config');
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const {
    User
} = require('../models/User')
const Post = require('../models/Post')
const Comment = require('../models/Comment')
const UserProfile = require('../models/UserProfile')
const router = express.Router()

const {
    auth
} = require('../middleware/auth')


router.get('/', auth, async(req, res) => {
    try {
        // let users = await User.aggregate([
        //     {
        //         $lookup:{
        //             from: 'user_profiles',
        //             localField: '_id',
        //             foreignField:'user',
        //             as:"profile",
        //         },
        //     },
        //     {
        //         $addFields:{
        //             profile: {
        //                 $map:{
        //                     input:'$profile',
        //                     as:'profile',
        //                     in:{
        //                         user:'$$profile.user',
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // ])

        let users = await User.aggregate([{
                $lookup: {
                    from: 'user_profiles',
                    localField: '_id',
                    foreignField: 'user',
                    pipeline: [{
                        $project: {
                            user: 1,
                        }
                    }],
                    as: "profile",
                },
            },

        ])
        res.status(200).json({
            success: true,
            users
        })
    } catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
})

router.get('/profile', auth, async(req, res) => {
    try {

        // let user = await User
        //     .aggregate([{
        //             $match: {
        //                 $expr: {
        //                     $eq: ["$_id", {
        //                         $toObjectId: req.user.id
        //                     }]
        //                 }
        //             },

        //         },
        //         {
        //             $project: {
        //                 firstName: 1,
        //                 lastName: 1,
        //                 username: 1,
        //                 email: 1,
        //             }
        //         },
        //         {
        //             $lookup: {
        //                 from: "user_profiles",
        //                 localField: "_id",
        //                 foreignField: "user",
        //                 as: "profile",
        //                 pipeline: [{
        //                     $project: {
        //                         user: 1,
        //                         phoneNumber: 1
        //                     }
        //                 }]
        //             },
        //         },
        //         {
        //             $unwind: "$profile"
        //         },
        //     ]).then(async(user) => {
        let userProfile = await UserProfile.findOne({
            user: req.user.id
        }, {
            _id: 0,
            user: 1,
            phoneNumber: 1,
        }).populate('user', 'firstName lastName username email')
        if (userProfile) {
            const profileToken = jwt.sign({
                userProfile
            }, config.get('privateKey'))

            return res.status(200).json({
                success: true,
                user: profileToken
            })
        } else {
            return res.status(500).json({
                success: false,
                message: "User not found"
            })
        }

        // await User.findById({
        //     user: req.params.userId
        // }).populate('user').then(profile => {
        //     if (profile) {
        //         return res.status(200).json({
        //             success: true,
        //             profile
        //         })
        //     } else {
        //         return res.status(404).json({
        //             success: false,
        //             message: 'User Profile not found'
        //         })
        //     }
        // })

    } catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
})

router.put('/profile', auth, async(req, res) => {
    try {

        let uploadDir = process.env.upload_dir + 'users-profile'

        //upload file first
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

                let checkProfileImage = UserProfile.findOne({
                        user: req.user.id
                    }, 'image', (err, profile) => {
                        if (profile.image) {
                            if (fs.existsSync(uploadDir + '/' + profile.image)) {
                                fs.unlink(`${uploadDir}/${profile.image}`, (err) => {
                                    if (err) throw err;
                                    console.log('File deleted!');
                                });
                            }
                        }
                    })
                    // console.log(checkProfileImage.image)
                    // if(checkProfileImage.image){
                    //     fs.unlinkSync(`./public/uploads/users-profile/${checkProfileImage.image}`)
                    // }

                cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
            }
        })

        const upload = multer({
            storage: storage
        })

        upload.single('profileImage')(req, res, (err) => {
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
                let users = User.findOne({
                    _id: {
                        $ne: req.user.id
                    },
                    $or: [{
                            username: req.body.username
                        },
                        {
                            email: req.body.email
                        }
                    ]
                }).then(async(user) => {
                    if (user) {
                        if (req.body.username === user.username) {
                            return res.status(400).json({
                                success: false,
                                message: `Username ${user.username} already exists`
                            })
                        } else {
                            return res.status(400).json({
                                success: false,
                                message: `Email ${user.email} already exists`
                            })
                        }
                    } else {
                        let user = await User.findByIdAndUpdate({
                            _id: req.user.id
                        }, {
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            email: req.body.email,
                            username: req.body.username
                        })
                        if (user) {
                            let oldProfileData = await UserProfile.findOne({
                                user: req.user.id
                            })
                            let userProfile = await UserProfile.findOneAndUpdate({
                                user: req.user.id
                            }, {
                                $set: {
                                    phoneNumber: req.body.phoneNumber,
                                    image: req.file ? req.file.filename : oldProfileData.image
                                }
                            }, {
                                upsert: true,
                                new: true
                            }).populate('user', 'firstName lastName username email')
                            if (userProfile) {
                                const profileToken = jwt.sign({
                                    userProfile
                                }, config.get('privateKey'))
                                return res.status(201).json({
                                    success: true,
                                    user: profileToken
                                })
                            } else {
                                return res.status(500).json({
                                    success: false,
                                    message: 'Something went wrong in updating the user profile data'
                                })
                            }
                        } else {
                            return res.status(500).json({
                                success: false,
                                message: 'Something went wrong in updating the user data'
                            })
                        }

                    }
                }).catch(err => {
                    return res.status(500).json({
                        error: err.message
                    })
                })
            }
        });


    } catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
})

router.put('/updatePassword', auth, async(req, res) => {
    try {
        let user = await User.findById(req.user.id)
        if (!user) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update password"
            })
        }
        const {
            oldPassword,
            newPassword
        } = req.body;

        if (await bcrypt.compare(oldPassword, user.password)) {
            if (await bcrypt.compare(newPassword, user.password)) {
                return res.status(400).json({
                    success: false,
                    message: "New password cannot be same as old password"
                })
            } else {
                user.password = newPassword;
                user.save();
                return res.status(200).json({
                    success: true,
                    message: "Password updated successfully"
                })
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'Old password is incorrect'
            })
        }

        if (oldPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: 'New Password should be different from old password'
            })
        }
    } catch (err) {
        return res.status(500).json({
            error: err.message,
            success: false,
            message: "Something went wrong."
        })
    }
})

router.delete('/', auth, async(req, res) => {
    try {
        let user = await User.deleteMany({})
        if (user) {
            await Post.deleteMany({})
            await Comment.deleteMany({})
        }
        return res.status(200).json({
            success: true,
            message: "Account deleted successfully"
        })
    } catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
})

module.exports = router