import { db } from "./db";
import { suppliers, inventoryItems, userPreferences, supplierProducts } from "@shared/schema";

async function seedProductionDatabase() {
  console.log("Starting PRODUCTION database seeding...");

  try {
    // Check if data already exists
    const existingSuppliers = await db.select().from(suppliers).limit(1);
    const existingProducts = await db.select().from(supplierProducts).limit(1);
    
    if (existingSuppliers.length > 0 && existingProducts.length > 0) {
      console.log("Production database already has data, skipping seed");
      return;
    }

    console.log("Seeding production database with marketplace data...");

    // Clear existing data safely
    await db.delete(supplierProducts);
    await db.delete(inventoryItems);
    await db.delete(suppliers);

    // Seed suppliers for production
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
      }
    ];

    const insertedSuppliers = await db.insert(suppliers).values(sampleSuppliers).returning();
    console.log(`Inserted ${insertedSuppliers.length} suppliers for production`);

    // Seed marketplace products for production
    const vegetableSupplier = insertedSuppliers.find(s => s.category === "vegetables")!;
    const spiceSupplier = insertedSuppliers.find(s => s.category === "spices")!;
    const oilSupplier = insertedSuppliers.find(s => s.category === "oil")!;

    const sampleProducts = [
      // Vegetables
      {
        supplierId: vegetableSupplier.id,
        productName: "Fresh Potatoes",
        productNameHi: "ताज़े आलू",
        productNameBn: "তাজা আলু",
        category: "vegetables",
        unit: "kg",
        pricePerUnit: "12.00",
        availability: true,
        description: "Premium quality farm fresh potatoes",
        onlineStoreUrl: "https://www.bigbasket.com/pd/10000181/fresho-potato-500-g/",
        lastUpdated: new Date(),
      },
      {
        supplierId: vegetableSupplier.id,
        productName: "Red Onions",
        productNameHi: "लाल प्याज",
        productNameBn: "লাল পিঁয়াজ",
        category: "vegetables",
        unit: "kg",
        pricePerUnit: "18.00",
        availability: true,
        description: "High quality red onions",
        onlineStoreUrl: "https://www.bigbasket.com/pd/10000153/fresho-onion-500-g/",
        lastUpdated: new Date().toISOString(),
      },
      {
        supplierId: vegetableSupplier.id,
        productName: "Fresh Tomatoes",
        productNameHi: "ताज़े टमाटर",
        productNameBn: "তাজা টমেটো",
        category: "vegetables",
        unit: "kg",
        pricePerUnit: "22.00",
        availability: true,
        description: "Ripe and fresh tomatoes",
        onlineStoreUrl: "https://www.bigbasket.com/pd/10000204/fresho-tomato-500-g/",
        lastUpdated: new Date().toISOString(),
      },
      // Spices
      {
        supplierId: spiceSupplier.id,
        productName: "Pure Turmeric Powder",
        productNameHi: "शुद्ध हल्दी पाउडर",
        productNameBn: "খাঁটি হলুদ গুঁড়া",
        category: "spices",
        unit: "kg",
        pricePerUnit: "140.00",
        availability: true,
        description: "100% pure turmeric powder",
        onlineStoreUrl: "https://www.bigbasket.com/pd/242467/tata-sampann-turmeric-powder-200-g/",
        lastUpdated: new Date().toISOString(),
      },
      {
        supplierId: spiceSupplier.id,
        productName: "Red Chili Powder",
        productNameHi: "लाल मिर्च पाउडर",
        productNameBn: "লাল মরিচ গুঁড়া",
        category: "spices",
        unit: "kg",
        pricePerUnit: "170.00",
        availability: true,
        description: "Spicy and aromatic chili powder",
        onlineStoreUrl: "https://www.bigbasket.com/pd/242468/tata-sampann-red-chilli-powder-200-g/",
        lastUpdated: new Date().toISOString(),
      },
      {
        supplierId: spiceSupplier.id,
        productName: "Coriander Powder",
        productNameHi: "धनिया पाउडर",
        productNameBn: "ধনিয়া গুঁড়া",
        category: "spices",
        unit: "kg",
        pricePerUnit: "90.00",
        availability: true,
        description: "Fresh ground coriander powder",
        onlineStoreUrl: "https://www.bigbasket.com/pd/242465/tata-sampann-coriander-powder-200-g/",
        lastUpdated: new Date().toISOString(),
      },
      // Oils
      {
        supplierId: oilSupplier.id,
        productName: "Refined Cooking Oil",
        productNameHi: "खाना पकाने का तेल",
        productNameBn: "রান্নার তেল",
        category: "oil",
        unit: "liters",
        pricePerUnit: "110.00",
        availability: true,
        description: "Premium refined cooking oil",
        onlineStoreUrl: "https://www.bigbasket.com/pd/265049/fortune-refined-sunflower-oil-1-l/",
        lastUpdated: new Date().toISOString(),
      },
      {
        supplierId: oilSupplier.id,
        productName: "Mustard Oil",
        productNameHi: "सरसों का तेल",
        productNameBn: "সরিষার তেল",
        category: "oil",
        unit: "liters",
        pricePerUnit: "160.00",
        availability: true,
        description: "Pure mustard oil",
        onlineStoreUrl: "https://www.bigbasket.com/pd/265097/fortune-mustard-oil-1-l/",
        lastUpdated: new Date().toISOString(),
      }
    ];

    const insertedProducts = await db.insert(supplierProducts).values(sampleProducts).returning();
    console.log(`Inserted ${insertedProducts.length} marketplace products for production`);

    // Add basic inventory items for production
    const sampleInventory = [
      {
        name: "आलू (Potatoes)",
        itemNameHi: "आलू",
        itemNameBn: "আলু",
        category: "vegetables",
        currentStock: 25,
        lowStockThreshold: 10,
        unit: "kg",
        lastRestocked: new Date(),
        supplierId: vegetableSupplier.id,
        pricePerUnit: "12.00",
      },
      {
        itemName: "हल्दी पाउडर (Turmeric)",
        itemNameHi: "हल्दी पाउडर",
        itemNameBn: "হলুদ গুঁড়া",
        category: "spices",
        currentStock: 8,
        lowStockThreshold: 15,
        unit: "kg",
        lastRestocked: new Date().toISOString(),
        supplierId: spiceSupplier.id,
        pricePerUnit: "140.00",
      },
      {
        itemName: "खाना पकाने का तेल (Cooking Oil)",
        itemNameHi: "खाना पकाने का तेल",
        itemNameBn: "রান্নার তেল",
        category: "oil",
        currentStock: 15,
        lowStockThreshold: 20,
        unit: "liters",
        lastRestocked: new Date().toISOString(),
        supplierId: oilSupplier.id,
        pricePerUnit: "110.00",
      }
    ];

    const insertedInventory = await db.insert(inventoryItems).values(sampleInventory).returning();
    console.log(`Inserted ${insertedInventory.length} inventory items for production`);

    console.log("✅ Production database seeding completed successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding production database:", error);
    throw error;
  }
}

// Run immediately if called directly
if (require.main === module) {
  seedProductionDatabase()
    .then(() => {
      console.log("Production seeding script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Production seeding script failed:", error);
      process.exit(1);
    });
}

export { seedProductionDatabase };