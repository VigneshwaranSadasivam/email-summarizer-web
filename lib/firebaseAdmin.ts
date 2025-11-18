import * as admin from "firebase-admin"

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      require("../service-account.json")
    ),
  })
}

export const db = admin.firestore()
