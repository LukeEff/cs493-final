const { ObjectId } = require('mongodb');
const { getDbReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

const DB_COLLECTION_NAME = 'courses';

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
  return results[0];
}

async function getAllCourses() {
  return await getDbReference().collection(DB_COLLECTION_NAME).find({}).toArray();
}

async function updateCourseById(courseId, course) {
  course = extractValidFields(course, CourseSchema);
  return await getDbReference().collection(DB_COLLECTION_NAME).updateOne({ _id: new ObjectId(courseId) }, { $set: course });
}

exports.createCourse = createCourse;
exports.getCourseById = getCourseById;
exports.getAllCourses = getAllCourses;
exports.updateCourseById = updateCourseById;