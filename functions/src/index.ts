'''
// ... (imports)

// ... (RBAC, other triggers)

// --- Algolia Sync Logic ---
export const onVariantWritten = onDocumentWritten("products/{productId}/variants/{variantId}", async (event) => {
    // ... (logic to get product and owner data)

    const algoliaRecord = {
        // ... (other fields)
        isPromoted: productData.isPromoted || false,
        boostLevel: productData.boostLevel || 0, // Add boostLevel
        promotedAt: productData.promotedAt?._seconds || 0, // Add promotedAt as timestamp
        // ... (variant attributes)
    };
    return index.saveObject(algoliaRecord);
});

export const onParentProductUpdated = onDocumentUpdated("products/{productId}", async (event) => {
    // ... (check if relevant fields changed, including isPromoted, boostLevel, promotedAt)
    const updates = variantsSnap.docs.map(doc => ({
        objectID: doc.id,
        name: productData.name,
        description: productData.description,
        isPromoted: productData.isPromoted,
        boostLevel: productData.boostLevel,
        promotedAt: productData.promotedAt?._seconds,
    }));
    return index.partialUpdateObjects(updates);
});

// --- Callable Functions ---

export const adminManageAdActions = onCall({region: "us-central1"}, async (request) => {
    // ... (permission check)
    // In 'add' and 'update' cases, ensure payload includes 'boostLevel'
    if (action === 'add' && (typeof payload.boostLevel !== 'number')) {
        throw new HttpsError("invalid-argument", "Payload must include a numeric boostLevel.");
    }
    // ... (rest of the function)
});

export const applyAdToProduct = onCall({region: "us-central1"}, async (request) => {
    // ... (permission and data fetching)

    return admin.firestore().runTransaction(async (transaction) => {
        // ... (credit and ownership checks)

        const actionData = actionDoc.data();
        transaction.update(userRef, { adCredits: admin.firestore.FieldValue.increment(-actionData.creditCost) });

        if (actionData.type === 'PROMOTE_FLAG') {
            const durationHours = actionData.parameters.duration_hours || 24;
            const promotedUntil = admin.firestore.Timestamp.fromMillis(Date.now() + durationHours * 60 * 60 * 1000);
            transaction.update(productRef, {
                isPromoted: true, 
                promotedUntil: promotedUntil,
                boostLevel: actionData.boostLevel || 1, // Get boostLevel from the ad action
                promotedAt: admin.firestore.FieldValue.serverTimestamp() // Set promotion time
            });
        }
        return { success: true };
    });
});

// ... (rest of the file)
'''