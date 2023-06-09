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

/**
 * Get a user by their id
 * @param userId - the id of the user to get
 * @returns {Promise<*>} - the user with the specified id
 */
async function getUserById(userId) {
  const results = await getDbReference().collection(DB_COLLECTION_NAME).find({ _id: new ObjectId(userId) }).toArray();
  return results[0];
}

/**
 * Gets all users in the database with a specified email and returns the first one. Email is a unique field.
 * @param email - the email of the user to get
 * @returns {Promise<*>} - the user with the specified email
 */
async function getUserByEmail(email) {
  const results = await getDbReference().collection(DB_COLLECTION_NAME).find({ email: email }).toArray();
  return results[0];
}

exports.ROLES = ROLES;
exports.UserSchema = UserSchema;
