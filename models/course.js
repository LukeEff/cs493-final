const { ObjectId } = require('mongodb');
const { getDbReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

const DB_COLLECTION_NAME = 'courses';

const CourseSchema = {
  _id: { required: true, unique: true },
  subject: { required: true },
  number: { required: true },
  title: { required: true },
  term: { required: true },
  instructorId: { required: true }
}