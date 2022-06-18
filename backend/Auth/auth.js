const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');

const {
    User,
    validate
} = require('../models/User');
const UserProfile = require('../models/UserProfile');

const {
    auth
} = require('../middleware/auth')


exports.getLoggedInUser = (req, res, next) => {
    return res.status(200).json({
        success: true,
        user: {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email
        }
    })
}

exports.register = async(req, res, next) => {
    const {
        error
    } = validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        })
    }


    let checkUserEmail = await User.findOne({
        email: req.body.email
    });
    if (checkUserEmail) {
        return res.status(400).json({
            success: false,
            message: `User with email ${req.body.email} already exists`
        })
    }

    let checkUsername = await User.findOne({
        username: req.body.username
    });
    if (checkUsername) {
        return res.status(400).json({
            success: false,
            message: `User with username ${req.body.username} already exists`
        })
    }

    try {
        await User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        }).then(user => {
            //add user profile dat

            UserProfile.create({
                user: user._id
            }, (err) => {
                if (err) console.log(err)
            });

            return res.status(201).json({
                success: true,
                message: 'User created successfully',
                user,
            })
        })
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Somthing went wrong please try again later',
            error: err.message
        })
    }
}

exports.login = async(req, res, next) => {
    try {
        let userData = req.body;
        const {
            error
        } = validateLogin(userData);
        if (error) {
            return res.status(401).json({
                success: false,
                message: error.details[0].message
            })
        }

        let user = await User.findOne({
            username: userData.username
        });
        if (!user)
            return res.status(500).json({
                success: false,
                message: 'Invalid Username or Password'
            })

        let checkPassword = await bcrypt.compare(userData.password, user.password).then((isTrue) => {
            if (isTrue) {
                const maxAge = 3 * 60 * 60;
                const token = jwt.sign({
                        id: user._id,
                        username: user.username,
                    },
                    config.get('privateKey'), {
                        expiresIn: maxAge //3 hours in seconds
                    }
                );
                res.cookie('jwt', token, {
                    httpOnly: true,
                    maxAge: maxAge * 1000, //3 hours in milliseconds
                })
                return res.status(201).json({
                    token,
                })
            } else {
                return res.status(500).json({
                    success: false,
                    message: 'Invalid Username or Password'
                })

            }
        })

        // let user = await User.findOne({
        //     $and: [{
        //         $or: [
        //             { username: userData.username },
        //             { email: userData.email }
        //         ]
        //     }, {
        //         password: userData.password
        //     }]
        // });
        // if (!user) return res.status(401).json({
        //     success: false,
        //     message: 'Invalid username or password'
        // });
        // else {
        //     return res.status(200).json({
        //         success: true,
        //         message: 'Login successful',
        //         user
        //     })
        // }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong please try again later',
            error: err.message
        })
    }
}


function validateLogin(user) {
    const schema = Joi.object({
        username: Joi.string().min(4).required().messages({
            'string.base': 'Username or email address must be a string',
            'string.empty': 'Username or email address is required',
            'string.min': 'Username or email must be at least 4 characters',
            'any.required': 'Username or email address is required'
        }),
        password: Joi.string().min(6).required()
    })
    return schema.validate(user)
}