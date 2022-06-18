const express = require('express');
const router = express.Router();

const { register, login, getLoggedInUser } = require('./auth')

const { auth } =  require('../middleware/auth')


// router.get('/', auth,  (req, res) => {
//     res.send('hello world')
// })

router.route('/register').post(register)
router.route('/login').post(login)
 router.route('/').get(auth, getLoggedInUser)

module.exports = router