const { Router } = require('express');

const { Assignment } = require('../models/assignment');

const { reqAuthentication, reqAdmin, reqInstructor, reqUser } = require('../lib/auth');

const { validateAgainstSchema } = require('../lib/validation');
const {Course} = require("../models/course");

const router = Router();

/**
 * Create and store a new Assignment with specified data and adds it to the application's database. Only an
 * authenticated User with 'admin' role or an authenticated 'instructor' User whose ID matches the instructorId of
 * the Course corresponding to the Assignment's courseId can create an Assignment.
 */
router.post('/', reqAuthentication, reqInstructor,  async function (req, res, next) {
    try {
      // Check if the authenticated user is the instructor of the course specified in the request body
      if (!await isCourseInstructor(req.jwt._id, req.body.courseId)) {
        res.status(403).json({
          error: "Unauthorized to create the specified assignment"
        });
        return;
      }

      // Check if the request body is a valid assignment object
      if (validateAgainstSchema(req.body, Assignment.AssignmentSchema)) {
        res.status(400).json({
            error: "Request body is not a valid assignment object"
        });
        return;
      }

      // Create and store the new assignment
      const assignment = await Assignment.createAssignment(req.body);
      res.status(201).json(assignment);

    } catch (err) {
        next(err);
    }
});

async function isCourseInstructor(instructorId, courseId) {
  const course = await Course.getCourseById(courseId);
  if (course) {
    return course.instructorId === instructorId;
  } else {
    return false;
  }
}

module.exports = router;
