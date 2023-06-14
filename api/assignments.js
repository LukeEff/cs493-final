const { Router } = require('express');

const { Assignment } = require('../models/assignment');

const { reqAuthentication, reqAdmin, reqInstructor, reqUser } = require('../lib/auth');

const { ROLES } = require('../models/user');

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
    if (!await isCourseInstructor(req.jwt, req.body.courseId)) {
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

/**
 * Returns summary data about the Assignment, excluding the list of Submissions.
 */
router.get('/:assignmentId', async function (req, res, next) {
  try {
    const assignment = await Assignment.getAssignmentById(req.params.assignmentId);
    if (assignment) {
      res.status(200).json(assignment);
    } else {
      res.status(404).json({
        error: "Requested assignment ID not found"
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * Performs a partial update on the data for the Assignment. Note that submissions cannot be modified via this
 * endpoint. Only an authenticated User with 'admin' role or an authenticated 'instructor' User whose ID matches
 * the instructorId of the Course corresponding to the Assignment's courseId can update an Assignment.
 */
router.patch('/:assignmentId', reqAuthentication, reqInstructor, async function (req, res, next) {
  try {
    const assignment = await Assignment.getAssignmentById(req.params.assignmentId);

    if (assignment && (await isCourseInstructor(req.jwt, assignment.courseId))) {
      if (validateAgainstSchema(req.body, Assignment.AssignmentSchema)) {
        res.status(400).json({
          error: "Request body is not a valid assignment object"
        });
        return;
      }

      const updatedAssignment = await Assignment.updateAssignment(req.params.assignmentId, req.body);
      res.status(200).json(updatedAssignment);
    } else {
      res.status(404).json({
        error: "Requested assignment ID not found"
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * Completely removes the data for the specified Assignment, including all submissions. Only an authenticated User
 * with 'admin' role or an authenticated 'instructor' User whose ID matches the instructorId of the Course
 * corresponding to the Assignment's courseId can delete an Assignment.
 */
router.delete('/:assignmentId', reqAuthentication, reqInstructor, async function (req, res, next) {
  try {
    const assignment = await Assignment.getAssignmentById(req.params.assignmentId);

    if (assignment && (await isCourseInstructor(req.jwt, assignment.courseId))) {
      await Assignment.deleteAssignment(req.params.assignmentId);
      res.status(204).end();
    } else {
      res.status(404).json({
        error: "Requested assignment ID not found"
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * Returns the list of all Submissions for an Assignment. This list should be paginated. Only an authenticated User
 * with 'admin' role or an authenticated 'instructor' User whose ID matches the instructorId of the Course
 * corresponding to the Assignment's courseId can fetch the Submissions for an Assignment.
 *
 * // TODO verify that parsing and validating query parameters is correct
 */
router.get('/:assignmentId/submissions', reqAuthentication, reqInstructor, async function (req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const numPerPage = parseInt(req.query.perPage) || 10;
    const assignment = await Assignment.getAssignmentById(req.params.assignmentId);

    if (assignment && (await isCourseInstructor(req.jwt, assignment.courseId))) {
      const submissions = await Assignment.getSubmissionsByAssignmentId(req.params.assignmentId, page, numPerPage);
      res.status(200).json(submissions);
    } else {
      res.status(404).json({
        error: "Requested assignment ID not found"
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * Checks if the course with specified ID has an instructor with specified ID
 * @param jwt JWT of user making request
 * @param courseId ID of course to check
 * @returns {Promise<boolean>} true if course has instructor with specified ID or if user is an admin, false otherwise
 */
async function isCourseInstructor(jwt, courseId) {
  const instructorId = jwt._id;
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
