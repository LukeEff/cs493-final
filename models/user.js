const { ObjectId } = require('mongodb');
const { getDbReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt")

const DB_COLLECTION_NAME = 'users';

const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student'
}

const UserSchema = {
  _id: { required: true, unique: true },
  name: { required: true },
  email: { required: true, unique: true },
  password: { required: true },
  role: { required: true }
}

async function initIndexes() {
  await getDbReference().collection(DB_COLLECTION_NAME).createIndex({ email: 1 }, { unique: true });
}

/**
 * Creates a new user in the database
 * @param user - the user schema to create
 * @returns {Promise<unknown>} - the id of the created user
 */
async function createUser(user) {
  return new Promise((resolve, reject) => {
    user = extractValidFields(user, UserSchema);

    // Encrypt password
    const salt = bcrypt.genSaltSync()
    user.password = bcrypt.hashSync(user.password, salt)

    user.role ??= ROLES.USER;
    getDbReference().collection(DB_COLLECTION_NAME).insertOne(user).then(result => {
      resolve(result.insertedId);
    }).catch(
      err => {
        reject(err);
      }
    );
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
  if (user && bcrypt.compareSync(password, user.password)) {
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

async function insertBulkUsers(users, dropPrevMatchingId = true) {
  console.log("Inserting bulk users: ", users);
  const usersToInsert = users.map(user => {
    user = extractValidFields(user, UserSchema);
    user.role ??= ROLES.STUDENT;
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync());
    return user;
  });
  try {
    if (dropPrevMatchingId) {
      await getDbReference().collection(DB_COLLECTION_NAME).deleteMany({ _id: { $in: usersToInsert.map(user => user._id) } });
    }

    const results = await getDbReference().collection(DB_COLLECTION_NAME).insertMany(usersToInsert);
    console.log("Inserted bulk users: ", results.insertedIds);
    return results.insertedIds;
  } catch (e) {
    console.log("Could not insert bulk users, probably because they already exist: ");
  }
}

exports.initIndexes = initIndexes;
exports.insertBulkUsers = insertBulkUsers;
exports.ROLES = ROLES;
exports.UserSchema = UserSchema;
exports.createUser = createUser;
exports.getUserById = getUserById;
exports.getUserByEmail = getUserByEmail;
exports.validateUser = validateUser;