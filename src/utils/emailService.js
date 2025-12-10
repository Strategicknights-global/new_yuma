// FILE: src/utils/emailService.js

import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

/**
 * Format cart items into HTML for email display
 * Uses table layout for better email client compatibility
 */
const formatOrderItemsHTML = (items) => {
  return items.map((item, index) => {
    const itemTotal = (item.price * item.quantity).toFixed(2);
    return `
      <div style="padding: 12px 0; border-bottom: 1px solid #eee;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: top; padding: 0;">
              <strong style="font-size: 14px;">${index + 1}. ${item.displayName || item.name}</strong><br>
              <span style="color: #666; font-size: 13px;">Quantity: ${item.quantity} × ₹${item.price.toFixed(2)}</span>
            </td>
            <td style="vertical-align: top; text-align: right; padding: 0; font-weight: bold; color: #57ba40; font-size: 16px; white-space: nowrap;">
              ₹${itemTotal}
            </td>
          </tr>
        </table>
      </div>
    `;
  }).join('');
};

/**
 * Format shipping address for email
 */
const formatShippingAddress = (shippingDetails) => {
  return `${shippingDetails.firstName} ${shippingDetails.lastName}<br>
${shippingDetails.street}<br>
${shippingDetails.city}, ${shippingDetails.state} - ${shippingDetails.pincode}<br>
${shippingDetails.country}`;
};

/**
 * Get shipping method description
 */
const getShippingMethodText = (method) => {
  return method === 'free' 
    ? 'Free Shipping (Delivery in 7-30 days)' 
    : 'Express Shipping (Delivery in 2-3 days)';
};

/**
 * Send order confirmation email to customer
 */
export const sendCustomerEmail = async (orderData) => {
  try {
    const templateParams = {
      to_email: orderData.shippingDetails.email, // ✅ Customer email from form
      customer_name: `${orderData.shippingDetails.firstName} ${orderData.shippingDetails.lastName}`,
      customer_email: orderData.shippingDetails.email,
      customer_phone: orderData.shippingDetails.phone,
      order_id: orderData.orderId,
      payment_id: orderData.razorpayPaymentId,
      payment_status: 'Paid', // Add payment status
      shipping_method: getShippingMethodText(orderData.shippingMethod),
      shipping_address: formatShippingAddress(orderData.shippingDetails),
      order_items: formatOrderItemsHTML(orderData.items),
      subtotal: orderData.subtotal.toFixed(2),
      shipping_cost: orderData.shippingCost === 0 ? 'Free' : orderData.shippingCost.toFixed(2),
      total_amount: orderData.totalAmount.toFixed(2),
    };

    console.log('📧 Sending customer email to:', templateParams.to_email);

    const response = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_CUSTOMER_TEMPLATE_ID,
      templateParams
    );

    console.log('✅ Customer email sent successfully:', response.status);
    return { success: true, response };
  } catch (error) {
    console.error('❌ Failed to send customer email:', error);
    return { success: false, error };
  }
};

/**
 * Send new order notification email to admin
 */
export const sendAdminEmail = async (orderData) => {
  try {
    const templateParams = {
      to_email: import.meta.env.VITE_ADMIN_EMAIL, // Admin email from env
      customer_name: `${orderData.shippingDetails.firstName} ${orderData.shippingDetails.lastName}`,
      customer_email: orderData.shippingDetails.email,
      customer_phone: orderData.shippingDetails.phone,
      order_id: orderData.orderId,
      payment_id: orderData.razorpayPaymentId,
      payment_status: 'Paid',
      order_date: new Date().toLocaleString('en-IN', { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      }),
      shipping_method: getShippingMethodText(orderData.shippingMethod),
      shipping_address: formatShippingAddress(orderData.shippingDetails),
      order_items: formatOrderItemsHTML(orderData.items),
      subtotal: orderData.subtotal.toFixed(2),
      shipping_cost: orderData.shippingCost === 0 ? 'Free' : orderData.shippingCost.toFixed(2),
      total_amount: orderData.totalAmount.toFixed(2),
    };

    console.log('📧 Sending admin email to:', templateParams.to_email);

    const response = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID,
      templateParams
    );

    console.log('✅ Admin email sent successfully:', response.status);
    return { success: true, response };
  } catch (error) {
    console.error('❌ Failed to send admin email:', error);
    return { success: false, error };
  }
};

/**
 * Send both customer and admin emails
 * Uses Promise.allSettled to ensure both are attempted even if one fails
 */
export const sendOrderEmails = async (orderData) => {
  console.log('📧 Sending order confirmation emails...');
  console.log('📧 Customer email:', orderData.shippingDetails.email);
  
  const results = await Promise.allSettled([
    sendCustomerEmail(orderData),
    sendAdminEmail(orderData)
  ]);

  const [customerResult, adminResult] = results;

  const emailResults = {
    customer: customerResult.status === 'fulfilled' 
      ? customerResult.value 
      : { success: false, error: customerResult.reason },
    admin: adminResult.status === 'fulfilled' 
      ? adminResult.value 
      : { success: false, error: adminResult.reason },
  };

  // Log summary
  const successCount = (emailResults.customer.success ? 1 : 0) + (emailResults.admin.success ? 1 : 0);
  console.log(`📧 Email Summary: ${successCount}/2 emails sent successfully`);
  
  if (emailResults.customer.success) {
    console.log('✅ Customer email delivered to:', orderData.shippingDetails.email);
  } else {
    console.error('❌ Customer email failed:', emailResults.customer.error);
  }
  
  if (emailResults.admin.success) {
    console.log('✅ Admin email delivered');
  } else {
    console.error('❌ Admin email failed:', emailResults.admin.error);
  }

  return emailResults;
};