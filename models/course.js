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