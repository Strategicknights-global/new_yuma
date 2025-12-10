# Coupon System Documentation

## Firestore Collection Structure

Create a collection named `coupons` in your Firestore database.

### Document Structure

Each document in the `coupons` collection represents a single coupon.

**Fields:**

- `code` (string): The code the user enters (e.g., "WELCOME10").
- `type` (string): Either "percentage" or "flat".
- `value` (number): The discount amount (e.g., 10 for 10% or 100 for ₹100 off).
- `startDate` (timestamp/date): When the coupon becomes active.
- `endDate` (timestamp/date): When the coupon expires.
- `maxRedemptions` (number): Total number of times this coupon can be used globally.
- `perUserLimit` (number): Max times a single user can use this coupon.
- `usageCount` (number): Current total usages (initialize to 0).
- `usersRedeemed` (map): Tracks usage per user. Initialize as empty map `{}`.

### Example Document

```json
{
  "code": "SAVE20",
  "type": "percentage",
  "value": 20,
  "startDate": "2023-01-01T00:00:00Z",
  "endDate": "2025-12-31T23:59:59Z",
  "maxRedemptions": 1000,
  "perUserLimit": 1,
  "usageCount": 0,
  "usersRedeemed": {}
}
```

## Implementation Details

### CartContext

- Manages the state of the applied coupon.
- Validates the coupon against Firestore rules (dates, limits).
- Calculates the discount amount.

### CheckoutPage & CartPage

- Allows users to enter the coupon code.
- Displays the discount and adjusted total.
- `CheckoutPage` handles the final validation and usage incrementing within the order transaction to ensure data integrity.

### Security Note

- The current implementation validates on the client side and during the checkout transaction.
- Ensure your Firestore security rules allow reading the `coupons` collection for authenticated users, but restrict writing/updating to only the `usageCount` and `usersRedeemed` fields (or handle this via a backend function if stricter security is needed).
