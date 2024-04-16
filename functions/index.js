const functions = require("firebase-functions")
const admin = require("firebase-admin")

admin.initializeApp()

exports.getUserIdByEmail = functions.https.onCall(async (data) => {
  const { email } = data

  if (!email) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Email is required.",
    )
  }

  try {
    const userRecord = await admin.auth().getUserByEmail(email)
    return userRecord.uid
  } catch (error) {
    return null
  }
})
