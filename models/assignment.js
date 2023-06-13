const { ObjectId } = require('mongodb');
const { getDbReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

const DB_COLLECTION_NAME = 'assignments';

const AssignmentSchema = {
    _id: { required: true, unique: true },
    courseNum: { required: true },
    title: { required: true },
    points: { required: true },
    due: { required: true }
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