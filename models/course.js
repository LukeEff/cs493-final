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