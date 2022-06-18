const {
    User
} = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');

exports.auth = (req, res, next) => {
    try {
        let token = req.cookies.jwt || verifyToken(req.headers.authorization)
        if (token) {
            jwt.verify(token, config.get('privateKey'), (err, decodedToken) => {
                if (err) {
                    return res.status(401).json({
                        error: 'Not Authorized'
                    })
                } else {
                    req.token = token
                    req.user = decodedToken
                    next();
                }
            })
        } else {
            return res.status(401).json({
                error: 'Not Authorized'
            })
        }
    } catch (err) {
        return res.status(401).json({
            error: 'Not Authorized'
        })
    }
}

verifyToken = (token) => {
    const bearerHeader = token;
    if (typeof bearerHeader !== undefined) {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        return bearerToken;
    } else {
        return null;
    }
}