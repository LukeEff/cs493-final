const { ObjectId, GridFSBucket } = require('mongodb');
const { getDbReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');
const { fs } = require('fs');

const DB_COLLECTION_NAME = 'assignments';
const DB_COLLECTION_NAME_SUBMISSIONS = 'submissions';
const DB_SUBMISSION_FILE_BUCKET_NAME = 'submissions';

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

async function uploadSubmissionFile(submission, file) {
  return new Promise((resolve, reject) => {
    const bucket = new GridFSBucket(getDbReference(), { bucketName: DB_SUBMISSION_FILE_BUCKET_NAME });
    const metadata = {
            contentType: file.contentType,
        };

    fs.createReadStream(file.path).pipe(bucket.openUploadStreamWithId(
      new ObjectId(submission._id),
        file.filename, { metadata: metadata, chunkSizeBytes: 512 })
        .on('finish', () => {
          console.log("Finished uploading file");
          resolve(submission._id);
        })
        .on('error', (err) => {
          console.log("Error uploading file");
          reject(err);
        })
    )}
  );
}

async function downloadSubmissionFileById(submissionId, outputFile) {
  const db = getDbReference();
  const bucket = new GridFSBucket(db, { bucketName: DB_SUBMISSION_FILE_BUCKET_NAME });
  const downloadStream = bucket.openDownloadStream(new ObjectId(submissionId));
  downloadStream.pipe(outputFile);
}

async function doesSubmissionFileExist(submissionId) {
  const db = getDbReference();
  const bucket = new GridFSBucket(db, { bucketName: DB_SUBMISSION_FILE_BUCKET_NAME });
  const results = await bucket.find({ _id: new ObjectId(submissionId) }).toArray();
  return results.length > 0;
}

async function createSubmission(submission) {
    // TODO: File should be a URL to a file download. Could use GRIDFS to store files in MongoDB.
    return new Promise((resolve) => {
        submission = extractValidFields(submission, SubmissionSchema);
        getDbReference().collection(DB_COLLECTION_NAME_SUBMISSIONS).insertOne(submission).then(result => {
            resolve(result.insertId);
        });
    });
}

exports.doesSubmissionFileExist = doesSubmissionFileExist;
exports.uploadSubmissionFile = uploadSubmissionFile;
exports.downloadSubmissionFileById = downloadSubmissionFileById;
exports.SubmissionSchema = SubmissionSchema;
exports.createSubmission = createSubmission;
exports.getSubmissionsByAssignmentId = getSubmissionsByAssignmentId;
exports.deleteAssignment = deleteAssignment;