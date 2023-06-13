const { Router } = require('express');

const { Course } = require('../models/course');

const { validateAgainstSchema } = require('../lib/validation');

const router = Router();

router.get('/', async function (req, res, next) {
    try {
        const courses = await Course.getAllCourses();
        res.status(200).json(courses);
    } catch (err) {
        next(err);
    }
});

router.post('/', async function (req, res, next) {
    try {

        // TODO - Middleware to check if user is authorized to create a course

        if (validateAgainstSchema(req.body, Course.CourseSchema)) {
            res.status(400).json({
                error: "Request body is not a valid course object"
            });
            return;
        }

        const course = await Course.createCourse(req.body);
        res.status(201).json(course);
    } catch (err) {
        next(err);
    }
});