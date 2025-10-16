import {onRequest, onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

admin.initializeApp();

// --- Helper Types and Constants ---
const VALID_ROLES = [
  "unverified",
  "member",
  "seller_advanced",
  "seller_premium",
  "admin",
];
const SELLER_ROLES = ["seller_advanced", "seller_premium", "admin"];

// --- Auth Triggers ---
// (No auth triggers are currently defined)


// --- Callable Functions ---

/**
 * Lists all users in the system.
 * The caller must be an authenticated admin.
 */
export const listUsers = onCall(
  {region: "us-central1"}, async (request) => {
  // 1. Check for admin role
  if (request.auth?.token.role !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can list users.");
  }

  // 2. List users from Firebase Auth
  try {
    const userRecords = await admin.auth().listUsers(1000); // Get up to 1000 users
    const users = userRecords.users.map((user) => ({
      uid: user.uid,
      email: user.email,
      role: user.customClaims?.role || "unverified",
    }));
    return {users};
  } catch (error) {
    logger.error("Error listing users:", error);
    throw new HttpsError("internal", 
        "An unexpected error occurred while listing users.");
  }
});

/**
 * Creates a new product listing.
 * The caller must be an authenticated seller.
 */
export const createProduct = onCall(
  {region: "us-central1"}, async (request) => {
  // 1. Check for authentication
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated", "You must be logged in to create a product.");
    }

    // 2. Check for seller role
    const userRole = request.auth.token.role;
    if (!userRole || !SELLER_ROLES.includes(userRole)) {
      throw new HttpsError(
        "permission-denied", "You must be a seller to create a product.");
    }

    // 3. Validate input data
    const {name, description, price} = request.data;
    if (!name || typeof name !== "string" || name.length > 100) {
      throw new HttpsError("invalid-argument",
        "Product name must be a string up to 100 characters.");
    }
    if (typeof price !== "number" || price < 0) {
      throw new HttpsError("invalid-argument",
        "Price must be a non-negative number.");
    }

    // 4. Add product to Firestore
    try {
      const productData = {
        name,
        description: description || "",
        price,
        ownerId: request.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const productRef = await admin.firestore()
        .collection("products").add(productData);
      logger.info(
        `New product created with ID: ${productRef.id} by user ${request.auth.uid}`
      );

      return {
        productId: productRef.id,
        message: "Product created successfully.",
      };
    } catch (error) {
      logger.error("Error creating product:", error);
      throw new HttpsError("internal",
        "An unexpected error occurred while creating the product.");
    }
  });

/**
 * A generic callable function to set a user's role.
 * The caller must be an authenticated admin.
 */
export const setUserRole = onCall({region: "us-central1"}, async (request) => {
  // 1. Check if the caller is an authenticated admin.
  if (request.auth?.token.role !== "admin") {
    logger.error("Permission denied for user:", request.auth?.uid);
    throw new HttpsError(
      "permission-denied",
      "Only admins can set user roles.",
    );
  }

  // 2. Validate request data.
  const {uid, role} = request.data;
  if (typeof uid !== "string" || !uid) {
    throw new HttpsError(
      "invalid-argument",
      "The function must be called with a 'uid' argument.",
    );
  }
  if (typeof role !== "string" || !VALID_ROLES.includes(role)) {
    throw new HttpsError(
      "invalid-argument",
      `'${role}' is not a valid role. ` +
      `Must be one of: ${VALID_ROLES.join(", ")}`,
    );
  }

  try {
    // 3. Set the custom claim for the target user.
    await admin.auth().setCustomUserClaims(uid, {role: role});

    // 4. Revoke refresh tokens to force the user's token to be refreshed.
    await admin.auth().revokeRefreshTokens(uid);

    logger.info(
      `Success! User ${uid} is now a ${role}. Set by ${request.auth?.uid}.`,
    );
    return {
      message: `Success! User ${uid} is now a ${role}.`,
    };
  } catch (error) {
    logger.error("Error setting custom claims", {error, uid, role});
    throw new HttpsError(
      "internal",
      "An error occurred while setting custom claims.",
    );
  }
});


// --- HTTP & Test Functions (Kept for testing) ---

/**
 * A simple HTTP function for testing.
 */
export const helloWorld = onRequest(
  {region: "us-central1"},
  (request, response) => {
    logger.info("Hello logs from TS! This is your Super App Market Place.", {
      structuredData: true,
    });
    response.send(
      "Hello from Firebase! This is your Super App Market Place function.",
    );
  },
);

/**
 * A simple JSON API.
 */
export const helloApi = onRequest(
  {region: "us-central1"},
  (request, response) => {
    logger.info("Hello logs from helloApi!", {structuredData: true});
    response.json({
      message: "Hello from Firebase!",
      data: {
        "name": "Gemini",
        "type": "AI",
      },
    });
  },
);
