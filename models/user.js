const { ObjectId } = require('mongodb');

const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  INSTRUCTOR: 'instructor',
}

const UserSchema = {
  name: { required: true },
  email: { required: true },
  password: { required: true },
}

exports.ROLES = ROLES;
exports.UserSchema = UserSchema;
