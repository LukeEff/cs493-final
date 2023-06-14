const { Router } = require('express');

const Course = require('../models/course');

const { reqAuthentication, reqAdmin, reqInstructor, reqUser } = require('../lib/auth');

const { validateAgainstSchema } = require('../lib/validation');

const { ROLES } = require('../models/user');

const router = Router();

/**
 * Returns the list of all Courses. This list should be paginated.
 * The Courses returned should not contain the list of students in the Course or the list of Assignments for the Course.
 */
router.get('/', async function (req, res, next) {
    try {
        const term = req.query.term;
        const subject = req.query.subject;
        const number = req.query.number;
        const page = parseInt(req.query.page) || 1;
        const coursesPerPage = (req.query.numPerPage) || 10;

        const courses = await Course.getAllCourses(subject, number, term, page, coursesPerPage);
        res.status(200).json(courses);
    } catch (err) {
        next(err);
    }
});


/**
 * Creates a new Course with specified data and adds it to the application's database.
 * Only an authenticated User with 'admin' role can create a new Course.
 */
router.post('/', reqAuthentication, reqAdmin, async function (req, res, next) {
    try {
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

/**
 * Returns summary data about the Course, excluding the list of students enrolled in the course and the list
 * of Assignments for the course.
 */
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

/**
 * Performs a partial update on the data for the Course. Note that enrolled students and assignments cannot be
 * modified via this endpoint. Only an authenticated User with 'admin' role or an authenticated 'instructor'
 * User whose ID matches the instructorId of the Course can update Course information.
 */
router.patch('/:courseId', reqAuthentication, reqInstructor, async function (req, res, next) {
    try {
        const course = await Course.getCourseById(req.params.courseId);

        if (course && await isCourseInstructor(req.jwt, req.params.courseId)) {
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

/**
 * Completely removes the data for the specified Course, including all enrolled students, all Assignments, etc. Only
 * an authenticated User with 'admin' role can remove a Course.
 */
router.delete('/:courseId', reqAuthentication, reqAdmin, async function (req, res, next) {
    try {
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

/**
 * Returns a list containing the User IDs of all students currently enrolled in the Course. Only an authenticated
 * User with 'admin' role or an authenticated 'instructor' User whose ID matches the instructorId of
 * the Course can fetch the list of enrolled students.
 */
router.get('/:courseId/students', reqAuthentication, reqInstructor, async function (req, res, next) {
    try {
        const course = await Course.getCourseById(req.params.courseId);

        if (course && await isCourseInstructor(req.jwt, req.params.courseId) ) {
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

/**
 * Enrolls and/or unenrolls students from a Course. Only an authenticated User with 'admin' role or an authenticated
 * 'instructor' User whose ID matches the instructorId of the Course can update the students enrolled in the Course.
 */
router.post('/:courseId/students', reqAuthentication, reqInstructor, async function (req, res, next) {
    try {
        const course = await Course.getCourseById(req.params.courseId);
        const body = req.body;

        if (course && await isCourseInstructor(req.jwt, req.params.courseId)) {
            if (!body["add"] && !body["remove"]) {
                res.status(400).json({
                    error: "Request body must contain 'add' and/or 'remove' array(s) of student IDs"
                });
                return;
            }

            if (body["add"]) {
                for (let i = 0; i < body["add"].length; i++) {
                    await Course.enrollStudentInCourse(req.params.courseId, body["add"][i]);
                }
            }
            if (body["remove"]) {
                for (let i = 0; i < body["remove"].length; i++) {
                    await Course.unenrollStudentInCourse(req.params.courseId, body["remove"][i]);
                }
            }
            res.status(200).json(body);
        } else {
            res.status(404).json({
                error: "Requested course ID not found"
            });
        }
    } catch (err) {
        next(err);
    }
});

/**
 * Returns a CSV file containing information about all of the students currently enrolled in the Course,
 * including names, IDs, and email addresses. Only an authenticated User with 'admin' role or an authenticated
 * 'instructor' User whose ID matches the instructorId of the Course can fetch the course roster.
 *
 * // TODO: Need to verify that the CSV file is being returned correctly
 */
router.get('/:courseId/roster', reqAuthentication, reqInstructor, async function (req, res, next) {
    try {
        const course = await Course.getCourseById(req.params.courseId);
        if (course && await isCourseInstructor(req.jwt, req.params.courseId)) {
            const roster = await Course.getCSVofStudentsEnrolledInCourse(req.params.courseId);
            res.setHeader('Content-disposition', 'attachment; filename=roster.csv');
            res.set('Content-Type', 'text/csv');
            res.status(200).send(roster);
        } else {
            res.status(404).json({
                error: "Requested course ID not found"
            });
        }
    } catch (err) {
        next(err);
    }
});

/**
 * Returns a list containing the Assignment IDs of all Assignments for the Course.
 */
router.get('/:courseId/assignments', reqAuthentication, reqUser, async function (req, res, next) {
    try {
        const course = await Course.getCourseById(req.params.courseId);
        if (course) {
            const assignments = await Course.getAssignmentsForCourse(req.params.courseId);
            res.status(200).json(assignments);
        } else {
            res.status(404).json({
                error: "Requested course ID not found"
            });
        }
    } catch (err) {
        next(err);
    }
});

async function isCourseInstructor(jwt, courseId) {
    const instructorId = jwt.id;
    const role = jwt.role;

    if (role === ROLES.ADMIN) {
        return true;
    }

    const course = await Course.getCourseById(courseId);
    if (course) {
        return course.instructorId === instructorId;
    } else {
        return false;
    }
}

module.exports = router;