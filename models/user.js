const { ObjectId } = require('mongodb');
const { getDbReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');
const { jwt } = require('jsonwebtoken');

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
  return new Promise((resolve) => {
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

async function validateUser(email, password) {
  const user = await getUserByEmail(email);
  if (user && user.password === password) {
    return generateJWT(user);
  }
  return null;
}

async function generateJWT(user) {
  return jwt.sign({
    id: user._id,
    role: user.role,
    name: user.name,
    email: user.email
  }, process.env.JWT_SECRET, { expiresIn: '24h' })
}

exports.ROLES = ROLES;
exports.UserSchema = UserSchema;
exports.createUser = createUser;
exports.getUserById = getUserById;
exports.getUserByEmail = getUserByEmail;
exports.validateUser = validateUser;