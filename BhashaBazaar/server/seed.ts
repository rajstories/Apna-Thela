import { db } from "./db";
import { suppliers, inventoryItems, userPreferences, supplierProducts } from "@shared/schema";

async function seedDatabase() {
  console.log("Starting database seeding...");

  try {
    // Clear existing data
    await db.delete(supplierProducts);
    await db.delete(inventoryItems);
    await db.delete(suppliers);
    await db.delete(userPreferences);

    // Seed suppliers
    const sampleSuppliers = [
      {
        name: "Fresh Vegetables Mart",
        nameHi: "ताज़ी सब्जी मार्ट",
        nameBn: "তাজা সবজি মার্ট",
        category: "vegetables",
        phone: "+91 98765 43210",
        address: "Local Market, Sector 15",
        city: "Delhi",
        rating: "4.5",
        verified: true,
        deliveryTime: "Same day",
        minOrderAmount: "500.00",
        isActive: true,
      },
      {
        name: "Spice World",
        nameHi: "मसाला वर्ल्ड",
        nameBn: "মসলা ওয়ার্ল্ড",
        category: "spices",
        phone: "+91 98765 43211",
        address: "Spice Market, Old City",
        city: "Mumbai",
        rating: "4.8",
        verified: true,
        deliveryTime: "1-2 days",
        minOrderAmount: "300.00",
        isActive: true,
      },
      {
        name: "Oil & Grains Co.",
        nameHi: "तेल और अनाज कंपनी",
        nameBn: "তেল ও শস্য কোম্পানি",
        category: "oil",
        phone: "+91 98765 43212",
        address: "Wholesale Market",
        city: "Pune",
        rating: "4.2",
        verified: true,
        deliveryTime: "2-3 days",
        minOrderAmount: "1000.00",
        isActive: true,
      },
      {
        name: "Dairy Fresh",
        nameHi: "डेयरी फ्रेश",
        nameBn: "ডেইরি ফ্রেশ",
        category: "dairy",
        phone: "+91 98765 43213",
        address: "Milk Market, Central Area",
        city: "Kolkata",
        rating: "4.6",
        verified: true,
        deliveryTime: "Same day",
        minOrderAmount: "200.00",
        isActive: true,
      },
      {
        name: "Meat & Poultry Corner",
        nameHi: "मांस एवं पोल्ट्री कॉर्नर",
        nameBn: "মাংস ও পোল্ট্রি কর্নার",
        category: "meat",
        phone: "+91 98765 43214",
        address: "Non-Veg Market",
        city: "Bangalore",
        rating: "4.3",
        verified: false,
        deliveryTime: "1-2 days",
        minOrderAmount: "800.00",
        isActive: true,
      }
    ];

    const insertedSuppliers = await db.insert(suppliers).values(sampleSuppliers).returning();
    console.log("✓ Suppliers seeded");

    // Seed supplier products for marketplace
    const sampleProducts = [
      // Fresh Vegetables Mart products
      {
        supplierId: insertedSuppliers[0].id,
        productName: "Fresh Potatoes",
        productNameHi: "ताज़े आलू",
        productNameBn: "তাজা আলু",
        category: "vegetables",
        unit: "kg",
        pricePerUnit: "12.00",
        availability: true,
        description: "Premium quality farm fresh potatoes",
      },
      {
        supplierId: insertedSuppliers[0].id,
        productName: "Red Onions",
        productNameHi: "लाल प्याज",
        productNameBn: "লাল পিঁয়াজ",
        category: "vegetables",
        unit: "kg",
        pricePerUnit: "18.00",
        availability: true,
        description: "High quality red onions",
      },
      {
        supplierId: insertedSuppliers[0].id,
        productName: "Fresh Tomatoes",
        productNameHi: "ताज़े टमाटर",
        productNameBn: "তাজা টমেটো",
        category: "vegetables",
        unit: "kg",
        pricePerUnit: "22.00",
        availability: true,
        description: "Ripe and fresh tomatoes",
      },
      // Spice World products
      {
        supplierId: insertedSuppliers[1].id,
        productName: "Pure Turmeric Powder",
        productNameHi: "शुद्ध हल्दी पाउडर",
        productNameBn: "খাঁটি হলুদ গুঁড়া",
        category: "spices",
        unit: "kg",
        pricePerUnit: "140.00",
        availability: true,
        description: "100% pure turmeric powder",
      },
      {
        supplierId: insertedSuppliers[1].id,
        productName: "Red Chili Powder",
        productNameHi: "लाल मिर्च पाউडर",
        productNameBn: "লাল মরিচ গুঁড়া",
        category: "spices",
        unit: "kg",
        pricePerUnit: "170.00",
        availability: true,
        description: "Spicy and aromatic chili powder",
      },
      {
        supplierId: insertedSuppliers[1].id,
        productName: "Coriander Powder",
        productNameHi: "धनिया पाउडर",
        productNameBn: "ধনিয়া গুঁড়া",
        category: "spices",
        unit: "kg",
        pricePerUnit: "90.00",
        availability: true,
        description: "Fresh ground coriander powder",
      },
      // Oil & Grains Co. products
      {
        supplierId: insertedSuppliers[2].id,
        productName: "Refined Cooking Oil",
        productNameHi: "खाना पकाने का तेल",
        productNameBn: "রান্নার তেল",
        category: "oil",
        unit: "liters",
        pricePerUnit: "110.00",
        availability: true,
        description: "Premium refined cooking oil",
      },
      {
        supplierId: insertedSuppliers[2].id,
        productName: "Mustard Oil",
        productNameHi: "सरसों का तेल",
        productNameBn: "সরিষার তেল",
        category: "oil",
        unit: "liters",
        pricePerUnit: "160.00",
        availability: true,
        description: "Pure mustard oil",
      },
    ];

    await db.insert(supplierProducts).values(sampleProducts);
    console.log("✓ Supplier products seeded");

    // Seed inventory items
    const sampleInventory = [
      {
        name: "Potatoes",
        nameHi: "आलू",
        nameBn: "আলু",
        category: "vegetables",
        quantity: 25,
        unit: "kg",
        minThreshold: 10,
        pricePerUnit: "15.00",
      },
      {
        name: "Onions",
        nameHi: "प्याज",
        nameBn: "পিঁয়াজ",
        category: "vegetables",
        quantity: 8,
        unit: "kg",
        minThreshold: 15,
        pricePerUnit: "20.00",
      },
      {
        name: "Turmeric Powder",
        nameHi: "हल्दी पाउडर",
        nameBn: "হলুদ গুঁড়া",
        category: "spices",
        quantity: 3,
        unit: "kg",
        minThreshold: 2,
        pricePerUnit: "150.00",
      },
      {
        name: "Tomatoes",
        nameHi: "टमाटर",
        nameBn: "টমেটো",
        category: "vegetables",
        quantity: 20,
        unit: "kg",
        minThreshold: 12,
        pricePerUnit: "25.00",
      },
      {
        name: "Cooking Oil",
        nameHi: "खाना पकाने का तेल",
        nameBn: "রান্নার তেল",
        category: "oil",
        quantity: 5,
        unit: "liters",
        minThreshold: 3,
        pricePerUnit: "120.00",
      },
      {
        name: "Red Chili Powder",
        nameHi: "लाल मिर्च पाउडर",
        nameBn: "লাল মরিচ গুঁড়া",
        category: "spices",
        quantity: 2,
        unit: "kg",
        minThreshold: 1,
        pricePerUnit: "180.00",
      }
    ];

    await db.insert(inventoryItems).values(sampleInventory);
    console.log("✓ Inventory items seeded");

    // Seed user preferences
    await db.insert(userPreferences).values({
      language: "hi",
      voiceEnabled: true,
      lowStockAlerts: true,
    });
    console.log("✓ User preferences seeded");

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { seedDatabase };