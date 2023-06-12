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

exports.CourseSchema = CourseSchema;

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
exports.createCourse = createCourse;

/**
* Get a list of all courses
*/


/**
* Get data about a course
* @param courseId - id of course to get data of
* @returns {Promise<*>} - the course with the specified id
*/
async function getCourseById(courseId) {
    const results = await getDbReference().collection(DB_COLLECTION_NAME).find({_id: new ObjectId(courseId) }).toArray();
    return results[0];
}

exports.getCourseById = getCourseById;

/**
* Update data on a specific course
* @param courseId - id of course to update
* @returns {Promise<*>} - the updated course
*/
async function updateCourse(courseId) {

}
exports.updateCourse = updateCourse;

/**
* Delete a course
* @param courseId - id of course to delete
* @returns {Promise<*>} - confirm deleted course
*/
async function deleteCourse(courseId) {

}
exports.deleteCourse = deleteCourse;

/**
* Get array of students in a specific course
* @param courseId - id of course to get array of students from
* @returns {Promise<*>} - array of students enrolled
*/
async function getArrayOfStudents(courseId) {

}
exports.getArrayOfStudents = getArrayOfStudents;

/**
* Update enrollment for a course
* @param courseId - course to update
* @returns {Promise<*>} - updated course
*/
async function updateEnrollment(courseId) {

}
exports.updateEnrollment = updateEnrollment;

/**
* Get csv file of students enrolled in a course
* @param courseId - course to get roster for
* @returns {Promise<*>} - csv file of roster
*/
async function getCSVFileOfStudents(courseId) {

}
exports.getCSVFileOfStudents = getCSVFileOfStudents;

/**
* Get list of all assignments for a course
* @param courseId - course that we want to get list of assignments from
* @returns {Promise<*>} - list of assignments for specified course
*/
async function getListOfAssignments(courseId) {

}
exports.getListOfAssignments = getListOfAssignments;