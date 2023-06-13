const { Router } = require('express');

const { Course } = require('../models/course');

const router = Router();

router.get('/', async function (req, res, next) {
    try {
        const courses = await Course.getAllCourses();
        res.status(200).json(courses);
    } catch (err) {
        next(err);
    }
}