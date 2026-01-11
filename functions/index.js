/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const express = require('express');
const cors = require('cors');

// Initialize Admin only once if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Configuration
setGlobalOptions({
  maxInstances: 10,
  region: 'asia-south1'
});

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Routes
app.use('/projects', require('./routes/projects'));
app.use('/blogs', require('./routes/blogs'));
app.use('/photos', require('./routes/photos'));
app.use('/songs', require('./routes/songs'));
app.use('/contacts', require('./routes/contacts'));

// Export API
exports.api = onRequest(app);

/**
 * Trigger: Runs when a new contact message is created in Firestore.
 * Purpose: Sanitize input and Send email notification (Simulated).
 * 
 * To enable real emails:
 * 1. Install nodemailer: `npm install nodemailer`
 * 2. Configure a transporter (Gmail/SendGrid)
 */
exports.onNewContact = onDocumentCreated("contacts/{contactId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    return;
  }

  const data = snapshot.data();
  const { name, email, message } = data;

  // 1. Basic Validation / Sanitization
  if (!email || !message) {
    logger.warn("Invalid contact submission", { id: event.params.contactId });
    return snapshot.ref.update({ status: "invalid" });
  }

  logger.info(`New Contact Message from: ${name} <${email}>`);

  // 2. TODO: Send Email Notification
  // const mailOptions = {
  //   from: '"Portfolio Bot" <noreply@firebase.com>',
  //   to: "ritik@example.com", // YOUR EMAIL HERE
  //   subject: `New Message from ${name}`,
  //   text: message
  // };
  // await transporter.sendMail(mailOptions);

  // 3. Update status to 'unread' for Admin Dashboard
  return snapshot.ref.update({
    status: "unread",
    processedAt: admin.firestore.FieldValue.serverTimestamp()
  });
});

/**
 * Callable: Create a new Admin User.
 * Usage: Call this ONCE from the frontend or a script to create your admin account.
 * Security: This function should be deleted or secured after initial use.
 */
exports.createAdminUser = onCall(async (request) => {
  // OPTIONAL: Add a secret key check to prevent public abuse
  // if (request.data.secret !== "MY_SUPER_SECRET_KEY") {
  //   throw new HttpsError('permission-denied', 'Not authorized');
  // }

  const { email, password } = request.data;

  if (!email || !password) {
    throw new HttpsError('invalid-argument', 'Email and password required');
  }

  try {
    // Check if user exists
    try {
      await admin.auth().getUserByEmail(email);
      // If exists, maybe just set custom claims?
      logger.info("User already exists, checking claims...");
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        await admin.auth().createUser({
          email,
          password,
        });
        logger.info("Created new user");
      } else {
        throw e;
      }
    }

    // Set custom admin claim
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });

    return { success: true, message: `Admin ${email} created/updated successfully.` };
  } catch (error) {
    logger.error("Error creating admin", error);
    throw new HttpsError('internal', 'Failed to create admin');
  }
});
