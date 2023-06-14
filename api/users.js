const { Router } = require('express')

const { User } = require('../models/user')

const { reqAuthentication, reqAdmin, reqUser, reqInstructor, isAdmin } = require('../lib/auth')

const { UserSchema, createUser, getUserById, getUserByEmail } = require('../models/user')

const router = Router()


/**
 * Create and store a new application User with specified data and adds it to the application's database. Only an
 * authenticated User with 'admin' role can create users with the 'admin' or 'instructor' roles.
 */
router.post('/', async function (req, res, next) {
  const desiredRole = req.body.role;

  // Ensure permissions are not being violated
  if (desiredRole === User.ROLES.ADMIN || desiredRole === User.ROLES.INSTRUCTOR) {
    if (!isAdmin(req)) {
      res.status(403).json({
        error: `Only admins can create users with the '${desiredRole}' role.`
      });
      return
    }
  }

  // Attempt to create the user
  try {
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json(err);
  }
});

/**
 * Authenticate a specific User with their email address and password.
 */
router.post('/login', async function (req, res, next) {
  const { email, password } = req.body;
  try {
    const user = await getUserByEmail(email);
    if (user && user.comparePassword(password)) {
      const token = user.generateAuthToken();
      res.status(200).json({ token: token });
    } else {
      res.status(401).json({
        error: "Invalid credentials"
      });
    }
  } catch (err) {
    next(err);
  }
});

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