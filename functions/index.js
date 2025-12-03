const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/**
 * Cloud Function to update inventory and sales counts when a new order is created.
 * This is the secure way to manage inventory, as the logic runs on the server.
 */
exports.processNewOrder = functions.firestore
  .document("orders/{orderId}")
  .onCreate(async (snap, context) => {
    const orderData = snap.data();
    const orderId = context.params.orderId;

    if (!orderData || !Array.isArray(orderData.items)) {
      console.log(`Order ${orderId} has no items. Exiting.`);
      return null;
    }

    const batch = db.batch();

    try {
      // Process each item in the order
      for (const item of orderData.items) {
        // --- 1. Update Sales Count on the Product ---
        const productRef = db.collection("products").doc(item.id);
        batch.update(productRef, {
          salesCount: admin.firestore.FieldValue.increment(item.quantity),
        });

        // --- 2. Update Inventory ---
        const productName = item.displayName || (item.variant ? `${item.name} (${item.variant.size})` : item.name);
        const inventoryQuery = db.collection("inventory_items").where("productName", "==", productName).limit(1);
        const inventorySnap = await inventoryQuery.get();
        
        if (!inventorySnap.empty) {
          const inventoryDocRef = inventorySnap.docs[0].ref;
          const currentStock = inventorySnap.docs[0].data().currentStock;
          const newStock = currentStock - item.quantity;
          
          batch.update(inventoryDocRef, { currentStock: newStock });

          // --- 3. Create an Inventory Log ---
          const logRef = db.collection("inventory_logs").doc();
          batch.set(logRef, {
            productId: item.id,
            productName: productName,
            change: -item.quantity, // Log as a negative change for sales
            type: "sale",
            notes: `Sale from Order #${orderData.orderId}`,
            previousStock: currentStock,
            newStock: newStock,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            orderId: orderId,
          });
        } else {
          console.warn(`No inventory item found for product: "${productName}"`);
        }
      }

      await batch.commit();
      console.log(`Successfully processed inventory for order ${orderId}`);
      return null;

    } catch (error) {
      console.error(`Error processing order ${orderId}:`, error);
      // Optional: Update the order status to 'failed' to flag it for manual review
      return db.collection("orders").doc(orderId).update({
        status: "Failed",
        error: error.message,
      });
    }
  });