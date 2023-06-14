const { Router } = require('express')

const { ROLES, validateUser, createUser, getUserById } = require('../models/user')

const { Course } = require('../models/course')

const { reqAuthentication, reqUser, isAdmin } = require('../lib/auth')

const router = Router()


/**
 * Create and store a new application User with specified data and adds it to the application's database. Only an
 * authenticated User with 'admin' role can create users with the 'admin' or 'instructor' roles.
 */
router.post('/', async function (req, res, next) {
  const desiredRole = req.body.role;

  // Ensure permissions are not being violated
  if (desiredRole === ROLES.ADMIN || desiredRole === ROLES.INSTRUCTOR) {
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
    if (err.code === 11000) {
      res.status(400).json({
        error: "Email already in use"
      });
    } else {
      res.status(400).json(err);
    }
  }
});

/**
 * Authenticate a specific User with their email address and password.
 */
router.post('/login', async function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).json({
      error: "Request body must contain both an email and password"
    });
    return;
  }

  try {
    const jwt = await validateUser(email, password)

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

/**
 * Returns information about the specified User. If the User has the 'instructor' role, the response should include a
 * list of the IDs of the Courses the User teaches (i.e. Courses whose instructorId field matches the ID of this
 * User). If the User has the 'student' role, the response should include a list of the IDs of the Courses the User
 * is enrolled in. Only an authenticated User whose ID matches the ID of the requested User can fetch this information.
 */
router.get('/:id', reqAuthentication, reqUser, async function (req, res, next) {
  const id = req.params.id;

  if (!id) {
    res.status(400).json({
      error: "Request body must contain a user ID"
    });
    return;
  }

  // Users can only access their own information (unless they are an admin)
  if (!isAdmin(req) && req.jwt.id !== id) {
    res.status(403).json({
      error: "Unauthorized to access the specified resource"
    });
    return;
  }

  try {
    const user = await getUserById(id);
    if (user) {
      res.status(200).json(user);

      if (user.role === ROLES.INSTRUCTOR) {
        user['courses'] = await Course.getCourseIdsByInstructorId(id)
      }
      else if (user.role === ROLES.STUDENT) {
        user['courses'] = await Course.getCourseIdsEnrolledByStudent(id)
      }
    } else {
      res.status(404).json({
        error: "Requested user ID not found"
      });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router