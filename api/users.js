const { Router } = require('express')

const { User } = require('../models/user')

const {
    UserSchema,
    createUser,
    getUserById,
    getUserByEmail,
    validateUser
} = require('../models/user')

const reqAuthentication = require('../lib/auth')

const router = Router()


/*
* Creating a user should be good.  Delete when checked
*/
// Create a new user
router.post('/', async function (req, res, next) {
    if (!admin(req) && req.body.admin) {
        res.status(403).json({
        error: `Only admins can create admins.`
        })
        return
    }
    try {
        const user = await createUser(req.body)
        res.status(201).json(user)
    } catch (err) {
        if (err instanceof ValidationError) {
            const messages = err.errors.map(e => e.message)
            res.status(400).json(messages)
        } else {
            next(err)
        }
    }
})

/*
* Still need to implement 400 and 500 errors, other than that should be good.
*/
// Route to login a user
router.post('/login', async function (req, res, next) {
    const { email, password } = req.body
    const user = await User.findOne({ where: { email: email }})
    if (user) {
        if (user.validPassword(password)) {
            // Respond with a JWT token
            const token = user.genToken()
            res.status(200).json({ token: token })
        } else {
            res.status(401).json(['Invalid email'])
        }
      } else {
            res.status(401).json(['Invalid password'])
        }
});


/*
* Still need to implement getting info on a user given their ID
*/

function authorized(req) {
    const authHeader = req.headers.authorization
    const auth = authHeader && authHeader.split(' ')[1]
    if (!auth) {
        return false
    }
    try {
        req.auth = jsonwebtoken.verify(auth, process.env.JWT_SECRET)
        return true
    }
    catch (e) {
        return false
    }
}
  
function admin(req) {
    return authorized(req) && req.jwt.admin
}
  
  module.exports = router