const jsonwebtoken = require('jsonwebtoken')

const { ROLES } = require('../models/user')


function reqAuthentication(req, res, next) {
  const authHeader = req.headers.authorization
  const jwt = authHeader && authHeader.split(' ')[1]
  if (!jwt) {
    res.status(401).json({
      error: 'Invalid authorization header'
    })
    return
  }
  try {
    req.jwt = jsonwebtoken.verify(jwt, process.env.JWT_SECRET)
    next()
  } catch (e) {
    res.status(401).json({
      error: 'Missing or Invalid JWT'
    })
  }
}

function reqAdmin(req, res, next) {
  const role = req.jwt.role
  if (role !== ROLES.ADMIN) {
    res.status(403).json({
      error: 'User is not an admin'
    })
    return
  }
  next()
}

function reqUser(req, res, next) {
  const role = req.jwt.role
  if (role !== ROLES.USER && role !== ROLES.INSTRUCTOR && role !== ROLES.USER) {
    res.status(403).json({
      error: 'User is not a user'
    })
    return
  }
  next()
}

function reqInstructor(req, res, next) {
  const role = req.jwt.role
  if (role !== ROLES.ADMIN && role !== ROLES.INSTRUCTOR) {
    res.status(403).json({
      error: 'User is not an instructor'
    })
    return
  }
  next()
}

exports.reqAuthentication = reqAuthentication
exports.reqAdmin = reqAdmin
exports.reqUser = reqUser
exports.reqInstructor = reqInstructor