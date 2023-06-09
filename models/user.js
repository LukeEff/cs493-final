const { ObjectId } = require('mongodb');
const { getDbReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');
const { jsonwebtoken } = require('jsonwebtoken');

const DB_COLLECTION_NAME = 'users';

const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  INSTRUCTOR: 'instructor',
}

const UserSchema = {
  name: { required: true },
  email: { required: true, unique: true },
  password: { required: true },
  role: { required: true }
}

/**
 * Creates a new user in the database
 * @param user - the user schema to create
 * @returns {Promise<unknown>} - the id of the created user
 */
async function createUser(user) {
  return new Promise((resolve, reject) => {
    user = extractValidFields(user, UserSchema);
    user.role ??= ROLES.USER;
    getDbReference().collection(DB_COLLECTION_NAME).insertOne(user).then(result => {
      resolve(result.insertedId);
    });
  });
}

exports.ROLES = ROLES;
exports.UserSchema = UserSchema;
