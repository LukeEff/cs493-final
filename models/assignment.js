const { ObjectId } = require('mongodb');
const { getDbReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

const DB_COLLECTION_NAME = 'assignments';
const DB_COLLECTION_NAME_SUBMISSIONS = 'submissions';

const AssignmentSchema = {
    _id: { required: true, unique: true },
    courseNum: { required: true },
    title: { required: true },
    points: { required: true },
    due: { required: true }
}

const SubmissionSchema = {
    _id: { required: true, unique: true },
    assignmentId: { required: true },
    studentId: { required: true },
    timestamp: { required: true },
    file: { required: true },
    grade: { required: false }
}

exports.AssignmentSchema = AssignmentSchema;


/**
* Create a new assignment
* @param assignment - assignment schema created
* @returns {Promise<unknown>} - id of created assignment
*/
async function createAssignment(assignment) {
    return new Promise((resolve) => {
        assignment = extractValidFields(assignment, AssignmentSchema);
        getDbReference().collection(DB_COLLECTION_NAME).insertOne(assignment).then(result => {
            resolve(result.insertId);
        });
    });
}
exports.createAssignment = createAssignment;


/**
* Get data about an assignment
* @param assignmentId - id of assignment to get data of
* @returns {Promise<*>} - the assignment with the specified id
*/
async function getAssignmentById(assignmentId) {
    const results = await getDbReference().collection(DB_COLLECTION_NAME).find({_id: new ObjectId(assignmentId) }).toArray();
    return results[0];
}

exports.getAssignmentById = getAssignmentById;

/**
* Update assignment
* @param assignmentId - id of assignment to update
* @returns {Promis<ObjectId*>} - updated assignment
* 
*/
async function updateAssignment(assignmentId) {

}
exports.updateAssignment = updateAssignment;

/**
* Delete an assignment
* @param courseId - id of assignment to delete
* @returns {Promise<*>} - confirm deleted assignment
*/
async function deleteAssignment(assignmentId) {

}

async function getSubmissionsByAssignmentId(assignmentId, page = 0, numPerPage = 20) {
    const results = await getDbReference().collection(DB_COLLECTION_NAME_SUBMISSIONS).find({
        assignmentId: assignmentId
    }).toArray();

    // Now use page and numPerPage to determine which results to return
    return results.slice(page * numPerPage, (page + 1) * numPerPage);
}

async function createSubmission(submission) {
    return new Promise((resolve) => {
        submission = extractValidFields(submission, SubmissionSchema);
        getDbReference().collection(DB_COLLECTION_NAME_SUBMISSIONS).insertOne(submission).then(result => {
            resolve(result.insertId);
        });
    });
}

exports.createSubmission = createSubmission;
exports.getSubmissionsByAssignmentId = getSubmissionsByAssignmentId;
exports.deleteAssignment = deleteAssignment;