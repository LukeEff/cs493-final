const { Router } = require('express')

const { User } = require('../models/user')

const reqAuthentication = require('../lib/auth')

const router = Router()


// Create a new user
router.post('/', async function (req, res, next) {
    if (!admin(req) && req.body.admin) {
        res.status(403).json({
        error: `Only admins can create admins.`
        })
        return
    }
    try {
        const user = await User.create(req.body)
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