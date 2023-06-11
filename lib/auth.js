const jsonwebtoken = require('jsonwebtoken')

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
      error: 'Invalid JWT'
    })
  }
}

module.exports = reqAuthentication