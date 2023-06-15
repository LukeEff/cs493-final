const { ObjectId, GridFSBucket } = require('mongodb');
const { getDbReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');
const fs = require('fs');

const DB_COLLECTION_NAME = 'assignments';
const DB_COLLECTION_NAME_SUBMISSIONS = 'submissions';
const DB_SUBMISSION_FILE_BUCKET_NAME = 'submissions';

const AssignmentSchema = {
    _id: { required: true, unique: true },
    courseId: { required: true },
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
      resolve(result.insertedId);
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
  if (!ObjectId.isValid(assignmentId)) return null;
  const results = await getDbReference().collection(DB_COLLECTION_NAME).find({_id: new ObjectId(assignmentId) }).toArray();
  return results[0];
}

exports.getAssignmentById = getAssignmentById;

/**
* Update assignment
* @param assignmentId - id of assignment to update
 * @param assignment - assignment schema to update
 * @returns {Promise<*>} - confirm updated assignment
*/
async function updateAssignment(assignmentId, assignment) {
  if (!ObjectId.isValid(assignmentId)) return null;
  return await getDbReference().collection(DB_COLLECTION_NAME).updateOne({_id: new ObjectId(assignmentId)}, {$set: assignment});
}
exports.updateAssignment = updateAssignment;

/**
* Delete an assignment
* @param assignmentId - id of assignment to delete
* @returns {Promise<*>} - confirm deleted assignment
 * Do we want to delete submissions for this assignment as well?
*/
async function deleteAssignment(assignmentId) {
  if (!ObjectId.isValid(assignmentId)) return null;
  return await getDbReference().collection(DB_COLLECTION_NAME).deleteOne({_id: new ObjectId(assignmentId)});
}

async function getSubmissionsByAssignmentId(assignmentId, page = 0, numPerPage = 20) {
  const results = await getDbReference().collection(DB_COLLECTION_NAME_SUBMISSIONS).find({
    assignmentId: assignmentId
  }).toArray();

  // Now use page and numPerPage to determine which results to return
  return results.slice(page * numPerPage, (page + 1) * numPerPage).map((submission) => {
    return {
      ...submission,
      file: `/media/submissions/${submission._id}`
    }
  });
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
  if (!ObjectId.isValid(submissionId)) return null;
  const db = getDbReference();
  const bucket = new GridFSBucket(db, { bucketName: DB_SUBMISSION_FILE_BUCKET_NAME });
  const downloadStream = bucket.openDownloadStream(new ObjectId(submissionId));
  downloadStream.pipe(outputFile);
}

async function doesSubmissionFileExist(submissionId) {
  if (!ObjectId.isValid(submissionId)) return null;
  const db = getDbReference();
  const bucket = new GridFSBucket(db, { bucketName: DB_SUBMISSION_FILE_BUCKET_NAME });
  const results = await bucket.find({ _id: new ObjectId(submissionId) }).toArray();
  return results.length > 0;
}

async function createSubmission(submission) {
  submission = extractValidFields(submission, SubmissionSchema);

  return new Promise((resolve) => {
    // Extract file and store it in GridFS
    const file = submission.file;

    // Remove file from submission object, so we can store the rest of the submission in MongoDB
    delete submission.file;

    getDbReference().collection(DB_COLLECTION_NAME_SUBMISSIONS).insertOne(submission).then(result => {
      // Upload file to GridFS using the newly created submission ID
      uploadSubmissionFile(submission, file)
      resolve(result.insertedId);
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