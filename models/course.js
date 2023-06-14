const { ObjectId } = require('mongodb');
const { getDbReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

const DB_COLLECTION_NAME = 'courses';
const DB_COLLECTION_NAME_ENROLLMENTS = 'enrollments';

const EnrollmentSchema = {
  courseId: { required: true },
  studentId: { required: true }
}

const CourseSchema = {
  _id: { required: true, unique: true },
  subject: { required: true },
  number: { required: true },
  title: { required: true },
  term: { required: true },
  instructorId: { required: true }
}

/**
 * Create a new course in the database
 * @param course - the course schema to create
 * @returns {Promise<unknown>} - the id of the created course
 */
async function createCourse(course) {
  return new Promise((resolve) => {
    course = extractValidFields(course, CourseSchema);
    getDbReference().collection(DB_COLLECTION_NAME).insertOne(course).then(result => {
      resolve(result.insertedId);
    });
  });
}

/**
 * Get a course by its id
 * @param courseId - the id of the course to get
 * @returns {Promise<*>} - the course with the specified id
 */
async function getCourseById(courseId) {
  const results = await getDbReference().collection(DB_COLLECTION_NAME).find({ _id: new ObjectId(courseId) }).toArray();
  return results[0] || null; // TODO - ensure error is not thrown if no results
}

/**
 * Gets paginated courses
 * @param subject - the subject of the courses to get
 * @param number - fetch courses with the specified course number
 * @param term - fetch courses in the specified academic term
 * @param page - the page of courses to get
 * @param numPerPage - the number of courses per page
 * @returns {Promise<*>} - the courses on the specified page
 */
async function getAllCourses(subject, number, term, page = 0, numPerPage = 20) {
  const results = await getDbReference().collection(DB_COLLECTION_NAME).find({
    subject: subject,
    number: number,
    term: term
  }).toArray();

  // Less efficient, but less complicated
  return results.slice(page * numPerPage, (page + 1) * numPerPage);
}

async function getCourseIdsByInstructorId(instructorId) {
  const results = await getDbReference().collection(DB_COLLECTION_NAME).find({ instructorId: instructorId }).toArray();
  return results.map(result => result._id);
}

async function getCourseIdsEnrolledByStudent(userId) {
  const results = await getDbReference().collection(DB_COLLECTION_NAME_ENROLLMENTS).find({ studentId: userId }).toArray();
  return results.map(result => result.courseId);
}

async function updateCourseById(courseId, course) {
  course = extractValidFields(course, CourseSchema);
  return await getDbReference().collection(DB_COLLECTION_NAME).updateOne({ _id: new ObjectId(courseId) }, { $set: course });
}

async function deleteCourseById(courseId) {
  return await getDbReference().collection(DB_COLLECTION_NAME).deleteOne({ _id: new ObjectId(courseId) });
}

////////////////////////
// ENROLLMENT METHODS //
////////////////////////

async function getStudentsEnrolledInCourse(courseId) {
  return await getDbReference().collection(DB_COLLECTION_NAME_ENROLLMENTS).find({courseId: courseId}).toArray();
}

async function getCSVofStudentsEnrolledInCourse(courseId) {
  const students = await getStudentsEnrolledInCourse(courseId);
  const studentIds = students.map(student => student.studentId);
  const studentObjects = await getDbReference().collection('users').find({_id: {$in: studentIds}}).toArray();
  return studentObjects.map(student =>
      student.userId + ',' + student.name + ',' + student.email
  ).join('\n');
}

async function enrollStudentInCourse(enrollment) {
enrollment = extractValidFields(enrollment, EnrollmentSchema);
  return await getDbReference().collection(DB_COLLECTION_NAME_ENROLLMENTS).insertOne(enrollment);
}

async function unenrollStudentInCourse(enrollment) {
  enrollment = extractValidFields(enrollment, EnrollmentSchema);
  return await getDbReference().collection(DB_COLLECTION_NAME_ENROLLMENTS).deleteOne(enrollment);
}

async function getAssignmentsForCourse(courseId) {
  return await getDbReference().collection('assignments').find({courseId: courseId}).toArray();
}

exports.EnrollmentSchema = EnrollmentSchema;
exports.CourseSchema = CourseSchema;
exports.createCourse = createCourse;
exports.getCourseById = getCourseById;
exports.getAllCourses = getAllCourses;
exports.updateCourseById = updateCourseById;
exports.deleteCourseById = deleteCourseById;
exports.getStudentsEnrolledInCourse = getStudentsEnrolledInCourse;
exports.getCSVofStudentsEnrolledInCourse = getCSVofStudentsEnrolledInCourse;
exports.enrollStudentInCourse = enrollStudentInCourse;
exports.unenrollStudentInCourse = unenrollStudentInCourse;
exports.getAssignmentsForCourse = getAssignmentsForCourse;
exports.getCourseIdsByInstructorId = getCourseIdsByInstructorId;
exports.getCourseIdsEnrolledByStudent = getCourseIdsEnrolledByStudent;