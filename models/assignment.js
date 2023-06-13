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

exports.CourseSchema = CourseSchema;