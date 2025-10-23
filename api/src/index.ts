// --- THIS IS THE COMPLETE api/src/index.ts FILE (v6 - Mixed v1 Auth + v2 Others - Cleaned) ---

// v2 Imports (Keep these for existing v2 functions)
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger"; // v2 logger
import algoliasearch from "algoliasearch";
import { defineString } from 'firebase-functions/params'; // v2 params

// --- v1 IMPORTS FOR AUTH FUNCTION ---
// Import the v1 entrypoint explicitly so TypeScript sees the v1 API (region, auth triggers)
import * as functions from "firebase-functions/v1"; // Use v1 SDK for the auth trigger
import { UserRecord } from "firebase-admin/auth"; // Type from Admin SDK (used by v1 trigger)

// Define parameters for environment variables (using v2 style is fine)
const algoliaId = defineString('SECRET_ALGOLIA_ID');
const algoliaAdminKey = defineString('SECRET_ALGOLIA_ADMIN_KEY');

// Initialize Firebase Admin SDK
admin.initializeApp();

// --- v1 Syntax for onUserCreate (Welcome Bot) ---
/**
 * Triggered when a new user is created in Firebase Authentication (v1 Syntax).
 * Creates a corresponding document in the 'users' collection in Firestore.
 */
export const onUserCreateV1 = functions // Use v1 'functions' object
  .region("asia-southeast1") // Correct v1 region placement
  .auth.user()
  .onCreate(async (user: UserRecord) => { // Type user parameter
    logger.log(`New user created (v1): ${user.uid}, Email: ${user.email}`);

    // Prepare the default user data
    const newUserProfile = {
      email: user.email || "",
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      tier: "starter",
      tierExpiryDate: null,
      credits: 0,
      lastPostTimestamp: null,
      postCountToday: 0,
      roles: [],
    };

    try {
      const userDocRef = admin.firestore().collection("users").doc(user.uid);
      await userDocRef.set(newUserProfile);
      logger.log(`Successfully created Firestore document (v1) for user: ${user.uid}`);
      return null;
    } catch (error) {
      logger.error(`Error creating Firestore document (v1) for user: ${user.uid}`, error);
      return null;
    }
});
// --- END OF v1 onUserCreate ---


// --- Existing v2 Functions Below --- (Keep these as they are, using v2 imports)

export const onProductWritten = onDocumentWritten({
    document: "products/{productId}",
}, async (event) => {
    const ALGOLIA_ID = algoliaId.value(); // Use v2 params access
    const ALGOLIA_ADMIN_KEY = algoliaAdminKey.value(); // Use v2 params access
    const ALGOLIA_INDEX_NAME = 'dealdee_products';
    const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);
    const index = client.initIndex(ALGOLIA_INDEX_NAME);
    const productId = event.params.productId;
    if (!event.data?.after.exists) {
        logger.log(`Deleting product ${productId} from Algolia.`); // Use v2 logger
        return index.deleteObject(productId);
    }
    const productData = event.data.after.data();
    if (!productData) { return; }
    // Convert Timestamp for Algolia if necessary
    const createdAtSeconds = productData.createdAt instanceof admin.firestore.Timestamp
        ? productData.createdAt.seconds
        : productData.createdAt; // Handle cases where it might not be a timestamp
    const algoliaRecord = { objectID: productId, ...productData, createdAt: createdAtSeconds };
    return index.saveObject(algoliaRecord);
});

// --- Callable Functions --- (Keep v2 syntax)

export const createProduct = onCall({region: "asia-southeast1"}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    const { name, description, price, stock, category } = request.data;
    if (!name || !description || !category || typeof price !== 'number' || typeof stock !== 'number') {
        throw new HttpsError('invalid-argument', 'Missing or invalid data.');
    }
    const newProduct = {
        name, description, price, stock, category,
        ownerId: request.auth!.uid,
        isPublished: false, isPromoted: false, isSold: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        imageUrls: [],
    };
    const productRef = await admin.firestore().collection('products').add(newProduct);
    return { success: true, productId: productRef.id };
});

export const admin_addCategory = onCall({region: "asia-southeast1"}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    const userDoc = await admin.firestore().collection('users').doc(request.auth.uid).get();
    // Assuming 'roles' is an array in your user document
    if (!userDoc.exists || !userDoc.data()?.roles?.includes('ADMIN')) {
        throw new HttpsError('permission-denied', 'You must be an admin to perform this action.');
    }
    const categoryData = {
        id: 'other', icon: 'MoreHorizIcon',
        names: { en: 'Other', th: 'อื่นๆ', ja: 'その他', ko: '기타', zh: '其他', hi: 'अन्य' }
    };
    await admin.firestore().collection('categories').doc('other').set(categoryData);
    return { success: true, message: "'Other' category created successfully." };
});

export const addPaymentMethod = onCall({region: "asia-southeast1"}, async (request) => {
     if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    const { type, ...details } = request.data;
    const paymentMethodData = {
        sellerId: request.auth!.uid, type, isPrimary: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(), ...details
    };
    const methodsRef = admin.firestore().collection('sellerPaymentMethods');
    const userMethodsSnap = await methodsRef.where('sellerId', '==', request.auth!.uid).get();
    if (userMethodsSnap.empty) paymentMethodData.isPrimary = true;
    await methodsRef.add(paymentMethodData);
    return { success: true };
});

export const deletePaymentMethod = onCall({region: "asia-southeast1"}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    const { methodId } = request.data;
    const methodRef = admin.firestore().collection('sellerPaymentMethods').doc(methodId);
    const doc = await methodRef.get();
    if (!doc.exists || doc.data()?.sellerId !== request.auth!.uid) throw new HttpsError('permission-denied', 'Permission denied.');
    if (doc.data()?.isPrimary) {
        const methodsRef = admin.firestore().collection('sellerPaymentMethods');
        const otherMethodsSnap = await methodsRef.where('sellerId', '==', request.auth!.uid).where(admin.firestore.FieldPath.documentId(), '!=', methodId).limit(1).get();
        if (!otherMethodsSnap.empty) await otherMethodsSnap.docs[0].ref.update({ isPrimary: true });
    }
    await methodRef.delete();
    return { success: true };
});

export const setPrimaryMethod = onCall({region: "asia-southeast1"}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    const { methodId } = request.data;
    const methodsRef = admin.firestore().collection('sellerPaymentMethods');
    const newPrimaryRef = methodsRef.doc(methodId);
    return admin.firestore().runTransaction(async (t) => {
        const newPrimaryDoc = await t.get(newPrimaryRef);
        if (!newPrimaryDoc.exists || newPrimaryDoc.data()?.sellerId !== request.auth!.uid) throw new HttpsError('permission-denied', 'Permission denied.');
        const q = methodsRef.where('sellerId', '==', request.auth!.uid).where('isPrimary', '==', true);
        const snap = await t.get(q);
        snap.forEach(doc => t.update(doc.ref, { isPrimary: false }));
        t.update(newPrimaryRef, { isPrimary: true });
    });
});

export const createOrder = onCall({region: "asia-southeast1"}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    const { productId /*, variantId */ } = request.data; // Add variantId later
    const buyerId = request.auth!.uid;
    const productRef = admin.firestore().collection('products').doc(productId);
    const productDoc = await productRef.get();
    if (!productDoc.exists) throw new HttpsError('not-found', 'Product not found.');
    const productData = productDoc.data();
    // TODO: Add variant stock check later based on variantId
    if (!productData || productData.stock <= 0) throw new HttpsError('failed-precondition', 'Product is out of stock.');
    if (productData.ownerId === buyerId) throw new HttpsError('failed-precondition', 'You cannot buy your own product.');
    const paymentMethodsRef = admin.firestore().collection('sellerPaymentMethods');
    const q = paymentMethodsRef.where('sellerId', '==', productData.ownerId).where('isPrimary', '==', true).limit(1);
    const paymentMethodSnap = await q.get();
    if (paymentMethodSnap.empty) throw new HttpsError('failed-precondition', 'Seller has no primary payment method.');
    const paymentDetails = paymentMethodSnap.docs[0].data();
    // TODO: Fetch variant price if applicable
    const priceToUse = productData.price;
    const newOrder = {
        buyerId, sellerId: productData.ownerId, productId, /* variantId, */
        productDetails: {
            name: productData.name,
            price: priceToUse,
            imageUrls: productData.imageUrls || []
            // Add variant specifics like size/color later
        },
        totalPrice: priceToUse, // Adjust for quantity later
        paymentDetails, status: 'pending_payment',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        slipImageUrl: null, trackingNumber: null, carrier: null, // Added carrier
        buyerArchived: false, sellerArchived: false, // Added archive flags
        cancellationReason: null, // Added cancellation reason
    };
    const orderRef = await admin.firestore().collection('orders').add(newOrder);
    return { success: true, orderId: orderRef.id };
});

export const confirmSlipUpload = onCall({region: "asia-southeast1"}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    const { orderId, slipImageUrl } = request.data;
    if (!slipImageUrl) throw new HttpsError('invalid-argument', 'Missing slip image URL.');
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists || orderDoc.data()?.buyerId !== request.auth!.uid) throw new HttpsError('permission-denied', 'Permission denied.');
    if (orderDoc.data()?.status !== 'pending_payment') throw new HttpsError('failed-precondition', 'Order not awaiting payment.');
    await orderRef.update({ slipImageUrl, status: 'pending_confirmation' });
    // TODO: Send notification to seller
    return { success: true };
});

export const confirmOrder = onCall({region: "asia-southeast1"}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    const { orderId } = request.data;
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists || orderDoc.data()?.sellerId !== request.auth!.uid) throw new HttpsError('permission-denied', 'Permission denied.');
    if (orderDoc.data()?.status !== 'pending_confirmation') throw new HttpsError('failed-precondition', 'Order not awaiting confirmation.');

    // TODO: Implement stock reduction logic considering variants if applicable
    // This needs careful handling, maybe in a transaction if complex

    await orderRef.update({ status: 'confirmed' });
    // TODO: Send notification to buyer
    return { success: true };
});

export const cancelOrder = onCall({region: "asia-southeast1"}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    const { orderId, reason } = request.data;
    if (!reason) throw new HttpsError('invalid-argument', 'Cancellation reason is required.');
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists) throw new HttpsError('not-found', 'Order not found.');
    const orderData = orderDoc.data();

    const isBuyer = orderData?.buyerId === request.auth!.uid;
    const isSeller = orderData?.sellerId === request.auth!.uid;

    if (!isBuyer && !isSeller) throw new HttpsError('permission-denied', 'Permission denied.');

    // Define cancellable statuses
    const cancellableStatuses = ['pending_payment', 'pending_confirmation', 'confirmed', 'awaiting_pickup'];
    if (!cancellableStatuses.includes(orderData?.status)) {
        throw new HttpsError('failed-precondition', `Order in status '${orderData?.status}' cannot be cancelled.`);
    }

    // TODO: Implement stock restoration logic if applicable (especially if cancelled after 'confirmed')
    // This needs careful handling, maybe in a transaction

    await orderRef.update({ status: 'cancelled', cancellationReason: reason });
    // TODO: Send notifications to both buyer and seller
    return { success: true };
});

export const addTrackingInfo = onCall({region: "asia-southeast1"}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    const { orderId, trackingNumber, carrier } = request.data;
    if (!trackingNumber || !carrier) throw new HttpsError('invalid-argument', 'Tracking number and carrier are required.');
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists || orderDoc.data()?.sellerId !== request.auth!.uid) throw new HttpsError('permission-denied', 'Permission denied.');
    if (orderDoc.data()?.status !== 'confirmed') throw new HttpsError('failed-precondition', 'Order must be confirmed before adding tracking.');
    await orderRef.update({ trackingNumber, carrier, status: 'shipped' });
    // TODO: Send notification to buyer
    return { success: true };
});

export const editTrackingInfo = onCall({region: "asia-southeast1"}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    const { orderId, trackingNumber, carrier } = request.data;
    if (!trackingNumber || !carrier) throw new HttpsError('invalid-argument', 'Tracking number and carrier are required.');
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists || orderDoc.data()?.sellerId !== request.auth!.uid) throw new HttpsError('permission-denied', 'Permission denied.');
    // Allow editing only if shipped or awaiting pickup (in case tracking was added before pickup)
    if (!['shipped', 'awaiting_pickup'].includes(orderDoc.data()?.status)) {
        throw new HttpsError('failed-precondition', 'Can only edit tracking for shipped or awaiting pickup orders.');
    }
    await orderRef.update({ trackingNumber, carrier });
    return { success: true };
});

export const markForPickup = onCall({region: "asia-southeast1"}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    const { orderId } = request.data;
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists || orderDoc.data()?.sellerId !== request.auth!.uid) throw new HttpsError('permission-denied', 'Permission denied.');
    if (orderDoc.data()?.status !== 'confirmed') throw new HttpsError('failed-precondition', 'Order must be confirmed before marking for pickup.');
    await orderRef.update({ status: 'awaiting_pickup' });
     // TODO: Send notification to buyer
    return { success: true };
});

export const completeOrder = onCall({region: "asia-southeast1"}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    const { orderId } = request.data;
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    return admin.firestore().runTransaction(async (t) => {
        const orderDoc = await t.get(orderRef);
        if (!orderDoc.exists) throw new HttpsError('not-found', 'Order not found.');
        const orderData = orderDoc.data();
        if (!orderData || orderData.buyerId !== request.auth!.uid) throw new HttpsError('permission-denied', 'Permission denied.');
        // Allow completion if shipped or awaiting pickup
        if (!['shipped', 'awaiting_pickup'].includes(orderData.status)) {
            throw new HttpsError('failed-precondition', 'Order cannot be completed yet.');
        }
        t.update(orderRef, { status: 'completed' });
        // TODO: Handle stock reduction for variants if applicable
        // const productRef = admin.firestore().collection('products').doc(orderData.productId);
        // Maybe find the specific variant using variantId from orderData
        // t.update(variantRef, { stock: admin.firestore.FieldValue.increment(-1) });
         // TODO: Send notification to seller? Initiate payout process?
    });
});

export const archiveOrder = onCall({region: "asia-southeast1"}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    const { orderId } = request.data;
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists) throw new HttpsError('not-found', 'Order not found.');
    const orderData = orderDoc.data();
    if (!orderData) throw new HttpsError('internal', 'Order data missing.');

    // Only allow archiving completed or cancelled orders
    if (!['completed', 'cancelled'].includes(orderData.status)){
         throw new HttpsError('failed-precondition', 'Only completed or cancelled orders can be archived.');
    }

    let updateData = {};
    if (orderData.buyerId === request.auth!.uid) updateData = { buyerArchived: true };
    else if (orderData.sellerId === request.auth!.uid) updateData = { sellerArchived: true };
    else throw new HttpsError('permission-denied', 'Permission denied.');
    await orderRef.update(updateData);
    return { success: true };
});

export const admin_listUsers = onCall({region: "asia-southeast1"}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    // Proper Admin Check using roles from Firestore
    const adminUserDoc = await admin.firestore().collection('users').doc(request.auth.uid).get();
    if (!adminUserDoc.exists || !adminUserDoc.data()?.roles?.includes('ADMIN')) { // Check if user has ADMIN role
        throw new HttpsError('permission-denied', 'Admin role required.');
    }
    try {
        const listUsersResult = await admin.auth().listUsers(1000); // Consider pagination for more users
        const db = admin.firestore();
        const usersPromise = listUsersResult.users.map(async (userRecord) => {
            const userDocRef = db.collection('users').doc(userRecord.uid);
            const userDoc = await userDocRef.get();
            const docData = userDoc.data();
            return {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
                photoURL: userRecord.photoURL,
                disabled: userRecord.disabled,
                creationTime: userRecord.metadata.creationTime,
                lastSignInTime: userRecord.metadata.lastSignInTime,
                // Firestore data (should exist due to onUserCreateV1)
                tier: docData?.tier || 'N/A', // Provide fallback just in case
                credits: docData?.credits ?? 'N/A',
                roles: docData?.roles || [],
            };
        });
        const users = await Promise.all(usersPromise);
        return { users };
    } catch (error) {
        logger.error("Error listing users:", error);
        throw new HttpsError('internal', 'Failed to list users.');
    }
});

export const admin_manualSync = onCall({ region: "asia-southeast1" }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    // Proper Admin Check
    const adminUserDoc = await admin.firestore().collection('users').doc(request.auth.uid).get();
    if (!adminUserDoc.exists || !adminUserDoc.data()?.roles?.includes('ADMIN')) {
        throw new HttpsError('permission-denied', 'Admin role required.');
    }
    try {
        logger.info("Starting manual sync to Algolia...");
        const ALGOLIA_ID = algoliaId.value();
        const ALGOLIA_ADMIN_KEY = algoliaAdminKey.value();
        const ALGOLIA_INDEX_NAME = 'dealdee_products';
        const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);
        const index = client.initIndex(ALGOLIA_INDEX_NAME);

        const firestore = admin.firestore();
        // Consider fetching in batches if you have many products
        const productsSnapshot = await firestore.collection('products').get();

        if (productsSnapshot.empty) {
            logger.warn("No products found in Firestore to sync.");
            return { success: true, message: "No products to sync." };
        }

        const records = productsSnapshot.docs.map(doc => {
            const productData = doc.data();
            const createdAtSeconds = productData.createdAt instanceof admin.firestore.Timestamp
                ? productData.createdAt.seconds
                : productData.createdAt;
            return {
                objectID: doc.id,
                ...productData,
                createdAt: createdAtSeconds,
            };
        });

        // Use partialUpdateObjects to only update existing or add new, instead of replacing all
        const { objectIDs } = await index.partialUpdateObjects(records, { createIfNotExists: true });
        logger.info(`Successfully synced/updated ${objectIDs.length} products to Algolia.`);
        return { success: true, count: objectIDs.length };

    } catch (error: any) {
        logger.error("Critical error in admin_manualSync:", error);
        const errorMessage = error.message || 'An unknown error occurred.';
        throw new HttpsError('internal', `Sync Failed: ${errorMessage}`);
    }
});

// TODO: Add functions for managing user roles (admin_setUserRole)
// TODO: Add functions for managing credit packages (admin_addCreditPackage, etc.)
// TODO: Add functions for handling credit purchases (createCreditOrder, confirmCreditSlip)
// TODO: Add functions for handling promotions (promoteProduct)
// TODO: Add functions for reports (generateSalesReport - maybe scheduled?)
// TODO: Add functions for ticketing (createEvent, createSeatMap, purchaseTicket, checkInTicket)
// TODO: Add functions for chat translation? (Might be better client-side or dedicated API)