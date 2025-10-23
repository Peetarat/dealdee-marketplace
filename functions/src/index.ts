// This file is now 100% Firebase Functions v2.
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onUserCreated } from "firebase-functions/v2/identity"; // The v2 auth trigger.
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import algoliasearch from "algoliasearch";
import { defineString } from 'firebase-functions/params';

// Define parameters for environment variables
const algoliaId = defineString('SECRET_ALGOLIA_ID');
const algoliaAdminKey = defineString('SECRET_ALGOLIA_ADMIN_KEY');

// Initialize Firebase Admin SDK
admin.initializeApp();

// --- WELCOME BOT (v2) ---
export const createuserprofile = onUserCreated({ region: "asia-southeast1" }, async (event) => {
  const user = event.data;
  logger.log(`New user created via v2 trigger: ${user.uid}, Email: ${user.email}`);

  const newUserProfile = {
    email: user.email || "",
    displayName: user.displayName || "",
    photoURL: user.photoURL || "",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    tier: "standard",
    tierExpiryDate: null,
    credits: 0,
    lastPostTimestamp: null,
    postCountToday: 0,
    roles: [],
    isEmailVisible: false,
    galleryImages: [],
    description: "",
    socialLinks: {},
  };

  try {
    const userDocRef = admin.firestore().collection("users").doc(user.uid);
    await userDocRef.set(newUserProfile);
    logger.log(`Successfully created Firestore document for user: ${user.uid}`);
  } catch (error) {
    logger.error(`Error creating Firestore document for user: ${user.uid}`, error);
  }
});

// --- OTHER V2 FUNCTIONS ---

export const onProductWritten = onDocumentWritten({
    document: "products/{productId}",
    region: "asia-southeast1"
}, async (event) => {
    const ALGOLIA_ID = algoliaId.value();
    const ALGOLIA_ADMIN_KEY = algoliaAdminKey.value();
    const ALGOLIA_INDEX_NAME = 'dealdee_products';
    const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);
    const index = client.initIndex(ALGOLIA_INDEX_NAME);
    const productId = event.params.productId;
    if (!event.data?.after.exists) {
        logger.log(`Deleting product ${productId} from Algolia.`);
        return index.deleteObject(productId);
    }
    const productData = event.data.after.data();
    if (!productData) { return; }
    const algoliaRecord = { objectID: productId, ...productData, createdAt: productData.createdAt?._seconds };
    return index.saveObject(algoliaRecord);
});

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
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be an admin to perform this action.');
    const userDoc = await admin.firestore().collection('users').doc(request.auth.uid).get();
    if (!userDoc.exists || !userDoc.data()?.isAdmin) {
        throw new HttpsError('permission-denied', 'You must be an admin to perform this action.');
    }
    const categoryData = {
        id: 'other',
        icon: 'MoreHorizIcon',
        names: { en: 'Other', th: 'อื่นๆ', ja: 'その他', ko: '기타', zh: '其他', hi: 'अन्य' }
    };
    await admin.firestore().collection('categories').doc('other').set(categoryData);
    return { success: true, message: "'Other' category created successfully." };
});

export const addPaymentMethod = onCall({region: "asia-southeast1"}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    const { type, ...details } = request.data;
    const paymentMethodData = {
        sellerId: request.auth!.uid,
        type,
        isPrimary: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        ...details
    };
    const methodsRef = admin.firestore().collection('sellerPaymentMethods');
    const userMethodsSnap = await methodsRef.where('sellerId', '==', request.auth!.uid).get();
    if (userMethodsSnap.empty) {
        paymentMethodData.isPrimary = true;
    }
    await methodsRef.add(paymentMethodData);
    return { success: true };
});

export const deletePaymentMethod = onCall({region: "asia-southeast1"}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    const { methodId } = request.data;
    const methodRef = admin.firestore().collection('sellerPaymentMethods').doc(methodId);
    const doc = await methodRef.get();
    if (!doc.exists || doc.data()?.sellerId !== request.auth!.uid) {
        throw new HttpsError('permission-denied', 'Permission denied.');
    }
    if (doc.data()?.isPrimary) {
        const methodsRef = admin.firestore().collection('sellerPaymentMethods');
        const otherMethodsSnap = await methodsRef.where('sellerId', '==', request.auth!.uid).where(admin.firestore.FieldPath.documentId(), '!=', methodId).limit(1).get();
        if (!otherMethodsSnap.empty) {
            await otherMethodsSnap.docs[0].ref.update({ isPrimary: true });
        }
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
        if (!newPrimaryDoc.exists || newPrimaryDoc.data()?.sellerId !== request.auth!.uid) {
            throw new HttpsError('permission-denied', 'Permission denied.');
        }
        const q = methodsRef.where('sellerId', '==', request.auth!.uid).where('isPrimary', '==', true);
        const snap = await t.get(q);
        snap.forEach(doc => t.update(doc.ref, { isPrimary: false }));
        t.update(newPrimaryRef, { isPrimary: true });
    });
});

export const createOrder = onCall({region: "asia-southeast1"}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    const { productId } = request.data;
    const buyerId = request.auth!.uid;
    const productRef = admin.firestore().collection('products').doc(productId);
    const productDoc = await productRef.get();
    if (!productDoc.exists) throw new HttpsError('not-found', 'Product not found.');
    const productData = productDoc.data();
    if (!productData || productData.stock <= 0) throw new HttpsError('failed-precondition', 'Product is out of stock.');
    if (productData.ownerId === buyerId) throw new HttpsError('failed-precondition', 'You cannot buy your own product.');
    const paymentMethodsRef = admin.firestore().collection('sellerPaymentMethods');
    const q = paymentMethodsRef.where('sellerId', '==', productData.ownerId).where('isPrimary', '==', true).limit(1);
    const paymentMethodSnap = await q.get();
    if (paymentMethodSnap.empty) throw new HttpsError('failed-precondition', 'Seller has no primary payment method.');
    const paymentDetails = paymentMethodSnap.docs[0].data();
    const newOrder = {
        buyerId, sellerId: productData.ownerId, productId,
        productDetails: { name: productData.name, price: productData.price, imageUrls: productData.imageUrls || [] },
        totalPrice: productData.price,
        paymentDetails,
        status: 'pending_payment',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        slipImageUrl: null, trackingNumber: null,
    };
    const orderRef = await admin.firestore().collection('orders').add(newOrder);
    return { success: true, orderId: orderRef.id };
});

export const confirmSlipUpload = onCall({region: "asia-southeast1"}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    const { orderId, slipImageUrl } = request.data;
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists || orderDoc.data()?.buyerId !== request.auth!.uid) {
        throw new HttpsError('permission-denied', 'Permission denied.');
    }
    if (orderDoc.data()?.status !== 'pending_payment') {
        throw new HttpsError('failed-precondition', 'Order not awaiting payment.');
    }
    await orderRef.update({ slipImageUrl, status: 'pending_confirmation' });
    return { success: true };
});

export const confirmOrder = onCall({region: "asia-southeast1"}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    const { orderId } = request.data;
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists || orderDoc.data()?.sellerId !== request.auth!.uid) {
        throw new HttpsError('permission-denied', 'Permission denied.');
    }
    if (orderDoc.data()?.status !== 'pending_confirmation') {
        throw new HttpsError('failed-precondition', 'Order not awaiting confirmation.');
    }
    await orderRef.update({ status: 'confirmed' });
    return { success: true };
});

export const cancelOrder = onCall({region: "asia-southeast1"}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    const { orderId } = request.data;
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists) throw new HttpsError('not-found', 'Order not found.');
    const orderData = orderDoc.data();
    if (orderData?.sellerId !== request.auth!.uid && orderData?.buyerId !== request.auth!.uid) {
        throw new HttpsError('permission-denied', 'Permission denied.');
    }
    if (orderData?.status === 'shipped' || orderData?.status === 'cancelled') {
        throw new HttpsError('failed-precondition', 'Order cannot be cancelled.');
    }
    await orderRef.update({ status: 'cancelled' });
    return { success: true };
});

export const addTrackingInfo = onCall({region: "asia-southeast1"}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    const { orderId, trackingNumber } = request.data;
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists || orderDoc.data()?.sellerId !== request.auth!.uid) {
        throw new HttpsError('permission-denied', 'Permission denied.');
    }
    if (orderDoc.data()?.status !== 'confirmed') {
        throw new HttpsError('failed-precondition', 'Order not confirmed.');
    }
    await orderRef.update({ trackingNumber, status: 'shipped' });
    return { success: true };
});

export const editTrackingInfo = onCall({region: "asia-southeast1"}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    const { orderId, trackingNumber } = request.data;
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists || orderDoc.data()?.sellerId !== request.auth!.uid) {
        throw new HttpsError('permission-denied', 'Permission denied.');
    }
    if (orderDoc.data()?.status !== 'shipped') {
        throw new HttpsError('failed-precondition', 'Can only edit tracking for shipped orders.');
    }
    await orderRef.update({ trackingNumber });
    return { success: true };
});

export const markForPickup = onCall({region: "asia-southeast1"}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    const { orderId } = request.data;
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists || orderDoc.data()?.sellerId !== request.auth!.uid) {
        throw new HttpsError('permission-denied', 'Permission denied.');
    }
    if (orderDoc.data()?.status !== 'confirmed') {
        throw new HttpsError('failed-precondition', 'Order not confirmed.');
    }
    await orderRef.update({ status: 'awaiting_pickup' });
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
        if (!orderData || orderData.buyerId !== request.auth!.uid) {
            throw new HttpsError('permission-denied', 'Permission denied.');
        }
        if (orderData.status !== 'shipped' && orderData.status !== 'awaiting_pickup') {
            throw new HttpsError('failed-precondition', 'Order cannot be completed.');
        }
        t.update(orderRef, { status: 'completed' });
        const productRef = admin.firestore().collection('products').doc(orderData.productId);
        t.update(productRef, { stock: admin.firestore.FieldValue.increment(-1) });
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
    let updateData = {};
    if (orderData.buyerId === request.auth!.uid) {
        updateData = { buyerArchived: true };
    } else if (orderData.sellerId === request.auth!.uid) {
        updateData = { sellerArchived: true };
    } else {
        throw new HttpsError('permission-denied', 'Permission denied.');
    }
    await orderRef.update(updateData);
    return { success: true };
});

export const admin_listUsers = onCall({region: "asia-southeast1"}, async (request) => {
    try {
        const listUsersResult = await admin.auth().listUsers(1000);
        const db = admin.firestore();
        const usersPromise = listUsersResult.users.map(async (userRecord) => {
            const userDocRef = db.collection('users').doc(userRecord.uid);
            const userDoc = await userDocRef.get();
            const isAdmin = userDoc.exists && userDoc.data()?.isAdmin === true;
            return {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
                isAdmin: isAdmin,
            };
        });
        const users = await Promise.all(usersPromise);
        return { users };
    } catch (error) {
        logger.error("Error listing users:", error);
        throw new HttpsError('internal', 'Failed to list users.');
    }
});

export const admin_manualSync = onCall({
    region: "asia-southeast1",
}, async () => {
    try {
        logger.info("Starting manual sync to Algolia...");
        const ALGOLIA_ID = algoliaId.value();
        const ALGOLIA_ADMIN_KEY = algoliaAdminKey.value();
        const ALGOLIA_INDEX_NAME = 'dealdee_products';
        const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);
        const index = client.initIndex(ALGOLIA_INDEX_NAME);

        const firestore = admin.firestore();
        const productsSnapshot = await firestore.collection('products').get();
        
        if (productsSnapshot.empty) {
            logger.warn("No products found in Firestore to sync.");
            return { success: true, message: "No products to sync." };
        }

        const records = productsSnapshot.docs.map(doc => {
            const productData = doc.data();
            return {
                objectID: doc.id,
                ...productData,
                createdAt: productData.createdAt?._seconds,
            };
        });

        await index.saveObjects(records);
        logger.info(`Successfully synced ${records.length} products to Algolia.`);
        return { success: true, count: records.length };

    } catch (error: any) {
        logger.error("Critical error in admin_manualSync:", error);
        const errorMessage = error.message || 'An unknown error occurred.';
        throw new HttpsError('internal', `Sync Failed: ${errorMessage}`);
    }
});