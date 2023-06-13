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

router.get('/:courseId', async function (req, res, next) {
    try {
        const course = await Course.getCourseById(req.params.courseId);
        if (course) {
            res.status(200).json(course);
        } else {
            res.status(404).json({
                error: "Requested course ID not found"
            });
        }
    } catch (err) {
        next(err);
    }
});

router.patch('/:courseId', async function (req, res, next) {
    try {
        // TODO - Middleware to check if user is authorized to update a course

        const course = await Course.getCourseById(req.params.courseId);
        if (course) {
            if (validateAgainstSchema(req.body, Course.CourseSchema)) {
                res.status(400).json({
                    error: "Request body is not a valid course object"
                });
                return;
            }
            const updatedCourse = await Course.updateCourseById(req.params.courseId, req.body);
            res.status(200).json(updatedCourse);
        } else {
            res.status(404).json({
                error: "Requested course ID not found"
            });
        }
    } catch (err) {
        next(err);
    }
});

router.delete('/:courseId', async function (req, res, next) {
    try {
        // TODO - Middleware to check if user is authorized to delete a course

        const course = await Course.getCourseById(req.params.courseId);
        if (course) {
            await Course.deleteCourseById(req.params.courseId);
            res.status(204).end();
        } else {
            res.status(404).json({
                error: "Requested course ID not found"
            });
        }
    } catch (err) {
        next(err);
    }
});

router.get('/:courseId/students', async function (req, res, next) {
    try {
        // TODO - Middleware to check if user is authorized to view students in a course

        const course = await Course.getCourseById(req.params.courseId);
        if (course) {
            const students = await Course.getStudentsEnrolledInCourse(req.params.courseId);
            res.status(200).json(students);
        } else {
            res.status(404).json({
                error: "Requested course ID not found"
            });
        }
    } catch (err) {
        next(err);
    }
});

router.post('/:courseId/students', async function (req, res, next) {
    try {
        // TODO - Middleware to check if user is authorized to add a student to a course

        if (validateAgainstSchema(req.body, Course.EnrollmentSchema)) {
            res.status(400).json({
                error: "Request body is not a valid enrollment object"
            });
            return;
        }

        const course = await Course.getCourseById(req.params.courseId);
        if (course) {
            const student = await Course.enrollStudentInCourse(req.params.courseId, req.body);
            res.status(200).json(student);
        } else {
            res.status(404).json({
                error: "Requested course ID not found"
            });
        }
    } catch (err) {
        next(err);
    }
});
