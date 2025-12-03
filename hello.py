import firebase_admin
from firebase_admin import credentials, firestore

# 1. Initialize Firebase
cred = credentials.Certificate("serviceaccount.json")  # Path to your Firebase service account JSON
firebase_admin.initialize_app(cred)

db = firestore.client()

# 2. Product document ID (replace with your product ID from Firestore)
product_id = "gXYz4SUUi90jY3zToyJX"

# 3. Data to insert/update
product_data = {
    "description": (
        "Carrot Malt is a nutrition-packed drink infused with the natural sweetness of carrots, "
        "nuts, and jaggery. Loaded with Vitamin A and antioxidants, it promotes good vision, "
        "skin health, and overall vitality. Its mild earthy-sweet flavor makes it enjoyable for "
        "both kids and adults."
    ),

    "benefits": [
        "Supports sharp eyesight and healthy skin",
        "Boosts immunity naturally",
        "Improves digestion and gut balance",
        "Keeps energy levels high throughout the day"
    ],

    "ingredientsBenefits": [
        {"ingredient": "Carrot", "benefit": "Source of Vitamin A, enhances eye & skin health"},
        {"ingredient": "Cashew & Badam", "benefit": "Add strength, stamina, and nourishment"},
        {"ingredient": "Elaichi", "benefit": "Aids digestion and adds refreshing taste"},
        {"ingredient": "Jaggery", "benefit": "Natural sweetener, boosts iron levels"}
    ],

    "howToUse": (
        "Take 1.5 to 2 teaspoons of malt. Add into 100 ml of hot or warm milk. "
        "Stir well until dissolved. Do not boil with milk."
    ),

    "purityPackaging": (
        "Made with handpicked fresh fruits, grains, and nuts, dried and powdered hygienically, "
        "and packed with love. 100% free from chemicals, preservatives, and artificial additives."
    )
}

# 4. Update Firestore document
db.collection("products").document(product_id).update(product_data)

print(f"✅ Product {product_id} updated successfully with new Carrot Malt content!")
