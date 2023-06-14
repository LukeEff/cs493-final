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

  if (!email || !password) {
    res.status(400).json({
      error: "Request body must contain both an email and password"
    });
    return;
  }

  try {
    const jwt = await User.validateUser(email, password)

    if (jwt) {
      res.status(200).json(jwt)
    }
    else {
      res.status(401).json({
        error: "Invalid credentials"
      })
    }

  } catch (err) {
    next(err);
  }
});

module.exports = router