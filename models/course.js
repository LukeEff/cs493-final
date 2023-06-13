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

async function getAllCourses() {
  return await getDbReference().collection(DB_COLLECTION_NAME).find({}).toArray();
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
  return studentObjects.map(student => student.name).join(',');
}

async function enrollStudentInCourse(enrollment) {
enrollment = extractValidFields(enrollment, EnrollmentSchema);
  return await getDbReference().collection(DB_COLLECTION_NAME_ENROLLMENTS).insertOne(enrollment);
}

async function unenrollStudentInCourse(enrollment) {
  enrollment = extractValidFields(enrollment, EnrollmentSchema);
  return await getDbReference().collection(DB_COLLECTION_NAME_ENROLLMENTS).deleteOne(enrollment);
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