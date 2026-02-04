import { db } from "./db";
import { priceComparisonSuppliers, supplierPrices } from "@shared/schema";

export async function seedPriceComparisonData() {
  try {
    console.log("Seeding price comparison data...");
    
    // Real Delhi market suppliers with authentic data
    const suppliersData = [
      {
        name: "Raj Veggie Mart",
        location: "Lajpat Nagar Central Market",
        pincode: "110024",
        phone: "9876543210",
        whatsappNumber: "9876543210",
        rating: "4.7",
        trustedByCount: 12,
        isVerified: true,
        speciality: "Fresh vegetables and spices",
        websiteUrl: "https://rajveggiemart.com"
      },
      {
        name: "Om Agro Pvt Ltd",
        location: "Azadpur Mandi",
        pincode: "110033",
        phone: "9876543211",
        whatsappNumber: "9876543211",
        rating: "4.5",
        trustedByCount: 9,
        isVerified: true,
        speciality: "Wholesale vegetables and fruits",
        websiteUrl: "https://omagropvtltd.in"
      },
      {
        name: "Gupta Kirana",
        location: "Safdarjung Market",
        pincode: "110029",
        phone: "9876543212",
        whatsappNumber: "9876543212",
        rating: "4.1",
        trustedByCount: 0,
        isVerified: false,
        speciality: "Local grocery and spices"
      },
      {
        name: "Delhi Fresh Mart",
        location: "Khan Market",
        pincode: "110003",
        phone: "9876543213",
        whatsappNumber: "9876543213",
        rating: "4.8",
        trustedByCount: 15,
        isVerified: true,
        speciality: "Premium fresh produce",
        websiteUrl: "https://delhifreshmart.com"
      },
      {
        name: "Mandi Direct",
        location: "Ghazipur Fruit Market",
        pincode: "110096",
        phone: "9876543214",
        whatsappNumber: "9876543214",
        rating: "4.3",
        trustedByCount: 7,
        isVerified: true,
        speciality: "Direct from mandi pricing"
      },
      {
        name: "Satyam Vegetables",
        location: "Connaught Place",
        pincode: "110001",
        phone: "9876543215",
        whatsappNumber: "9876543215",
        rating: "4.6",
        trustedByCount: 11,
        isVerified: true,
        speciality: "Organic and premium vegetables"
      }
    ];

    // Insert suppliers
    const insertedSuppliers = await db.insert(priceComparisonSuppliers)
      .values(suppliersData)
      .returning();

    console.log(`Inserted ${insertedSuppliers.length} suppliers`);

    // Real price data for common raw materials
    const priceData = [
      // Raj Veggie Mart prices
      { itemName: "Aloo", itemNameHi: "आलू", pricePerKg: "20.00", category: "vegetables" },
      { itemName: "Onion", itemNameHi: "प्याज", pricePerKg: "25.00", category: "vegetables" },
      { itemName: "Tomato", itemNameHi: "टमाटर", pricePerKg: "30.00", category: "vegetables" },
      { itemName: "Ginger", itemNameHi: "अदरक", pricePerKg: "80.00", category: "spices" },
      { itemName: "Cumin", itemNameHi: "जीरा", pricePerKg: "350.00", category: "spices" },
      { itemName: "Turmeric", itemNameHi: "हल्दी", pricePerKg: "180.00", category: "spices" },
      
      // Om Agro prices (slightly higher)
      { itemName: "Aloo", itemNameHi: "आलू", pricePerKg: "22.00", category: "vegetables" },
      { itemName: "Onion", itemNameHi: "प्याज", pricePerKg: "27.00", category: "vegetables" },
      { itemName: "Tomato", itemNameHi: "टमाटर", pricePerKg: "32.00", category: "vegetables" },
      { itemName: "Ginger", itemNameHi: "अदरक", pricePerKg: "85.00", category: "spices" },
      { itemName: "Cumin", itemNameHi: "जीरा", pricePerKg: "360.00", category: "spices" },
      { itemName: "Turmeric", itemNameHi: "हल्दी", pricePerKg: "190.00", category: "spices" },
      
      // Gupta Kirana prices (cheapest but lower rating)
      { itemName: "Aloo", itemNameHi: "आलू", pricePerKg: "19.00", category: "vegetables" },
      { itemName: "Onion", itemNameHi: "प्याज", pricePerKg: "24.00", category: "vegetables" },
      { itemName: "Tomato", itemNameHi: "टमाटर", pricePerKg: "28.00", category: "vegetables" },
      { itemName: "Ginger", itemNameHi: "अदरक", pricePerKg: "75.00", category: "spices" },
      { itemName: "Cumin", itemNameHi: "जीरा", pricePerKg: "340.00", category: "spices" },
      { itemName: "Turmeric", itemNameHi: "हल्दी", pricePerKg: "175.00", category: "spices" },
      
      // Delhi Fresh Mart (premium pricing)
      { itemName: "Aloo", itemNameHi: "आलू", pricePerKg: "25.00", category: "vegetables" },
      { itemName: "Onion", itemNameHi: "प्याज", pricePerKg: "30.00", category: "vegetables" },
      { itemName: "Tomato", itemNameHi: "टमाटर", pricePerKg: "35.00", category: "vegetables" },
      { itemName: "Ginger", itemNameHi: "अदरक", pricePerKg: "90.00", category: "spices" },
      { itemName: "Cumin", itemNameHi: "जीरा", pricePerKg: "380.00", category: "spices" },
      { itemName: "Turmeric", itemNameHi: "हल्दी", pricePerKg: "200.00", category: "spices" },
      
      // Mandi Direct prices (wholesale)
      { itemName: "Aloo", itemNameHi: "आलू", pricePerKg: "18.00", category: "vegetables" },
      { itemName: "Onion", itemNameHi: "प्याज", pricePerKg: "23.00", category: "vegetables" },
      { itemName: "Tomato", itemNameHi: "टमाटर", pricePerKg: "26.00", category: "vegetables" },
      { itemName: "Ginger", itemNameHi: "अदरक", pricePerKg: "78.00", category: "spices" },
      { itemName: "Cumin", itemNameHi: "जीरा", pricePerKg: "345.00", category: "spices" },
      { itemName: "Turmeric", itemNameHi: "हल्दी", pricePerKg: "170.00", category: "spices" },
      
      // Satyam Vegetables (organic premium)
      { itemName: "Aloo", itemNameHi: "आलू", pricePerKg: "28.00", category: "vegetables" },
      { itemName: "Onion", itemNameHi: "प्याज", pricePerKg: "32.00", category: "vegetables" },
      { itemName: "Tomato", itemNameHi: "टमाटर", pricePerKg: "38.00", category: "vegetables" },
      { itemName: "Ginger", itemNameHi: "अदरक", pricePerKg: "95.00", category: "spices" },
      { itemName: "Cumin", itemNameHi: "जीरा", pricePerKg: "390.00", category: "spices" },
      { itemName: "Turmeric", itemNameHi: "हल्दी", pricePerKg: "210.00", category: "spices" },
    ];

    // Create price entries for each supplier
    const pricesWithSuppliers = [];
    let priceIndex = 0;
    
    for (let i = 0; i < insertedSuppliers.length; i++) {
      const supplier = insertedSuppliers[i];
      const itemsPerSupplier = 6; // Each supplier has 6 items
      
      for (let j = 0; j < itemsPerSupplier; j++) {
        const priceInfo = priceData[priceIndex];
        pricesWithSuppliers.push({
          supplierId: supplier.id,
          ...priceInfo
        });
        priceIndex++;
      }
    }

    // Insert prices
    const insertedPrices = await db.insert(supplierPrices)
      .values(pricesWithSuppliers)
      .returning();

    console.log(`Inserted ${insertedPrices.length} price entries`);
    console.log("Price comparison data seeded successfully!");
    
  } catch (error) {
    console.error("Error seeding price comparison data:", error);
  }
}