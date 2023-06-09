/*
 * This file contains a simple script to populate the database with initial
 * data from the files in the data/ directory.  The following environment
 * variables must be set to run this script:
 *
 *   MONGO_DB_NAME - The name of the database into which to insert data.
 *   MONGO_USER - The user to use to connect to the MongoDB server.
 *   MONGO_PASSWORD - The password for the specified user.
 *   MONGO_AUTH_DB_NAME - The database where the credentials are stored for
 *     the specified user.
 *
 * In addition, you may set the following environment variables to create a
 * new user with permissions on the database specified in MONGO_DB_NAME:
 *
 *   MONGO_CREATE_USER - The name of the user to create.
 *   MONGO_CREATE_PASSWORD - The password for the user.
 */

const { connectToDb, getDbReference, closeDbConnection } = require('./lib/mongo')

const sampleUsers = require('./data/sample-users.json')

const { insertBulkUsers, initIndexes } = require('./models/user')

const mongoCreateUser = process.env.MONGO_CREATE_USER
const mongoCreatePassword = process.env.MONGO_CREATE_PASSWORD

console.log("== Calling connectToDb")

connectToDb(async function () {
  /*
   * Insert initial user data into the database.
   */

  /*
  const db = getDbReference()
  const collection = db.collection("users")
  await collection.drop()
  */

  // Require email to be unique.
  await initIndexes()
  const ids = await insertBulkUsers(sampleUsers)
  console.log("== Inserted users with IDs:", ids)

  /*
   * Create a new, lower-privileged database user if the correct environment
   * variables were specified.
   */
  if (mongoCreateUser && mongoCreatePassword) {
    const db = getDbReference()
    try {
      const result = await db.addUser(mongoCreateUser, mongoCreatePassword, {
        roles: "readWrite"
      })
      console.log("== New user created:", result)
    } catch (err) {
      // This error will occur if the user already exists in the database.
      console.log("== Did not create user")
      // console.error("== Failed to create user:", err)
    }
  }

  closeDbConnection(function () {
    console.log("== DB connection closed")
  })
})
