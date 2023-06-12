const { ObjectId } = require('mongodb');
const { getDbReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

const DB_COLLECTION_NAME = 'courses';

const CourseSchema = {
    _id: { required: true, unique: true },
    number: { required: true },
    title: { required: true, unique: true },
    term: { required: true },
    instructorId: { required: true }
  }

/**
* Create a new course
* @param course - course schema created
* @returns {Promise<unknown>} - id of created course
*/
async function createCourse(course) {
    return new Promise((resolve) => {
        course = extractValidFields(course, CourseSchema);
        getDbReference().collection(DB_COLLECTION_NAME).insertOne(course).then(result => {
            resolve(result.insertId);
        });
    });
}

/**
* Get a list of all courses
*/
