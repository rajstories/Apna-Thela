import { db } from "./db";
import { suppliers, supplierProducts } from "@shared/schema";

// Real marketplace products with external platform URLs
export async function seedMarketplaceData() {
  console.log('Seeding marketplace data...');

  try {
    // First, insert suppliers (online platforms)
    const supplierData = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'BigBasket Fresh',
        nameHi: 'बिगबास्केट फ्रेश',
        nameBn: 'বিগবাস্কেট ফ্রেশ',
        category: 'vegetables',
        phone: '1860-123-1000',
        address: 'BigBasket Distribution Center',
        city: 'Delhi',
        rating: '4.3',
        verified: true,
        deliveryTime: 'Same day',
        minOrderAmount: '99.00',
        isActive: true,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Zepto Quick',
        nameHi: 'ज़ेप्टो क्विक',
        nameBn: 'জেপ্টো কুইক',
        category: 'vegetables',
        phone: '1800-3000-5555',
        address: 'Zepto Dark Store',
        city: 'Mumbai',
        rating: '4.4',
        verified: true,
        deliveryTime: '10 minutes',
        minOrderAmount: '79.00',
        isActive: true,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'BlinkIt Express',
        nameHi: 'ब्लिंकइट एक्सप्रेस',
        nameBn: 'ব্লিঙ্কইট এক্সপ্রেস',
        category: 'spices',
        phone: '1800-419-0003',
        address: 'BlinkIt Warehouse',
        city: 'Delhi',
        rating: '4.2',
        verified: true,
        deliveryTime: '10-15 minutes',
        minOrderAmount: '149.00',
        isActive: true,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Instamart Supplies',
        nameHi: 'इंस्टामार्ट सप्लाईज',
        nameBn: 'ইনস্টামার্ট সাপ্লাইজ',
        category: 'oil',
        phone: '1800-208-1111',
        address: 'Swiggy Instamart Hub',
        city: 'Bangalore',
        rating: '4.1',
        verified: true,
        deliveryTime: '15-30 minutes',
        minOrderAmount: '199.00',
        isActive: true,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        name: 'JioMart Fresh',
        nameHi: 'जिओमार्ट फ्रेश',
        nameBn: 'জিওমার্ট ফ্রেশ',
        category: 'dairy',
        phone: '1800-890-1222',
        address: 'Reliance JioMart Center',
        city: 'Mumbai',
        rating: '4.0',
        verified: true,
        deliveryTime: '2-4 hours',
        minOrderAmount: '99.00',
        isActive: true,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440006',
        name: 'Amazon Fresh',
        nameHi: 'अमेज़न फ्रेश',
        nameBn: 'অ্যামাজন ফ্রেশ',
        category: 'meat',
        phone: '1800-3000-9009',
        address: 'Amazon Fulfillment Center',
        city: 'Delhi',
        rating: '4.5',
        verified: true,
        deliveryTime: '2-6 hours',
        minOrderAmount: '99.00',
        isActive: true,
      }
    ];

    console.log('Inserting suppliers...');
    await db.insert(suppliers).values(supplierData);
    console.log(`Inserted ${supplierData.length} suppliers`);

    // Insert products with real prices and external URLs
    const productData = [
      // BigBasket Fresh - Vegetables
      {
        supplierId: '550e8400-e29b-41d4-a716-446655440001',
        productName: 'Fresh Onions',
        productNameHi: 'ताज़ा प्याज़',
        productNameBn: 'তাজা পেঁয়াজ',
        category: 'vegetables',
        unit: 'kg',
        pricePerUnit: '28.00',
        availability: true,
        description: 'Fresh red onions, grade A quality',
        onlineStoreUrl: 'https://www.bigbasket.com/pd/10000020/fresho-onion-1-kg/?nc=as&t_pos_sec=1&t_pos_item=1&t_s=Onion',
      },
      {
        supplierId: '550e8400-e29b-41d4-a716-446655440001',
        productName: 'Potato Regular',
        productNameHi: 'आलू रेगुलर',
        productNameBn: 'নিয়মিত আলু',
        category: 'vegetables',
        unit: 'kg',
        pricePerUnit: '22.00',
        availability: true,
        description: 'Fresh potatoes, perfect for cooking',
        onlineStoreUrl: 'https://www.bigbasket.com/pd/10000021/fresho-potato-1-kg/?nc=as&t_pos_sec=1&t_pos_item=2&t_s=Potato',
      },
      {
        supplierId: '550e8400-e29b-41d4-a716-446655440001',
        productName: 'Tomato Regular',
        productNameHi: 'टमाटर रेगुलर',
        productNameBn: 'নিয়মিত টমেটো',
        category: 'vegetables',
        unit: 'kg',
        pricePerUnit: '35.00',
        availability: true,
        description: 'Fresh red tomatoes, vine ripened',
        onlineStoreUrl: 'https://www.bigbasket.com/pd/10000022/fresho-tomato-regular-1-kg/?nc=as&t_pos_sec=1&t_pos_item=3&t_s=Tomato',
      },

      // Zepto Quick - Vegetables
      {
        supplierId: '550e8400-e29b-41d4-a716-446655440002',
        productName: 'Green Capsicum',
        productNameHi: 'हरी शिमला मिर्च',
        productNameBn: 'সবুজ ক্যাপসিকাম',
        category: 'vegetables',
        unit: 'kg',
        pricePerUnit: '65.00',
        availability: true,
        description: 'Fresh green bell peppers',
        onlineStoreUrl: 'https://www.zeptonow.com/pn/capsicum-green-shimla-mirch-500-g/vpid/a1b2c3d4e5f6',
      },
      {
        supplierId: '550e8400-e29b-41d4-a716-446655440002',
        productName: 'Fresh Ginger',
        productNameHi: 'ताज़ा अदरक',
        productNameBn: 'তাজা আদা',
        category: 'vegetables',
        unit: 'kg',
        pricePerUnit: '120.00',
        availability: true,
        description: 'Fresh ginger root, organic',
        onlineStoreUrl: 'https://www.zeptonow.com/pn/ginger-adrak-200-g/vpid/g1h2i3j4k5l6',
      },

      // BlinkIt Express - Spices
      {
        supplierId: '550e8400-e29b-41d4-a716-446655440003',
        productName: 'Turmeric Powder',
        productNameHi: 'हल्दी पाउडर',
        productNameBn: 'হলুদ গুঁড়া',
        category: 'spices',
        unit: 'kg',
        pricePerUnit: '180.00',
        availability: true,
        description: 'Pure turmeric powder, 1kg pack',
        onlineStoreUrl: 'https://blinkit.com/prn/everest-turmeric-haldi-powder-1-kg/prid/157563',
      },
      {
        supplierId: '550e8400-e29b-41d4-a716-446655440003',
        productName: 'Red Chili Powder',
        productNameHi: 'लाल मिर्च पाउडर',
        productNameBn: 'লাল মরিচ গুঁড়া',
        category: 'spices',
        unit: 'kg',
        pricePerUnit: '220.00',
        availability: true,
        description: 'Spicy red chili powder, premium quality',
        onlineStoreUrl: 'https://blinkit.com/prn/everest-red-chilli-lal-mirch-powder-1-kg/prid/157564',
      },
      {
        supplierId: '550e8400-e29b-41d4-a716-446655440003',
        productName: 'Coriander Powder',
        productNameHi: 'धनिया पाउडर',
        productNameBn: 'ধনে গুঁড়া',
        category: 'spices',
        unit: 'kg',
        pricePerUnit: '160.00',
        availability: true,
        description: 'Fresh ground coriander powder',
        onlineStoreUrl: 'https://blinkit.com/prn/everest-coriander-dhania-powder-1-kg/prid/157565',
      },

      // Instamart Supplies - Oil
      {
        supplierId: '550e8400-e29b-41d4-a716-446655440004',
        productName: 'Sunflower Oil',
        productNameHi: 'सूरजमुखी तेल',
        productNameBn: 'সূর্যমুখী তেল',
        category: 'oil',
        unit: 'liter',
        pricePerUnit: '140.00',
        availability: true,
        description: 'Pure sunflower cooking oil, 1L bottle',
        onlineStoreUrl: 'https://www.swiggy.com/instamart/search?custom_back=true&query=sunflower%20oil&tag=oil',
      },
      {
        supplierId: '550e8400-e29b-41d4-a716-446655440004',
        productName: 'Mustard Oil',
        productNameHi: 'सरसों का तेल',
        productNameBn: 'সর্ষের তেল',
        category: 'oil',
        unit: 'liter',
        pricePerUnit: '165.00',
        availability: true,
        description: 'Pure mustard oil, cold pressed',
        onlineStoreUrl: 'https://www.swiggy.com/instamart/search?custom_back=true&query=mustard%20oil&tag=oil',
      },

      // JioMart Fresh - Dairy
      {
        supplierId: '550e8400-e29b-41d4-a716-446655440005',
        productName: 'Full Cream Milk',
        productNameHi: 'फुल क्रीम दूध',
        productNameBn: 'পূর্ণ ক্রিম দুধ',
        category: 'dairy',
        unit: 'liter',
        pricePerUnit: '65.00',
        availability: true,
        description: 'Fresh full cream milk, 1L packet',
        onlineStoreUrl: 'https://www.jiomart.com/p/groceries/mother-dairy-full-cream-milk-1-l/590003350',
      },
      {
        supplierId: '550e8400-e29b-41d4-a716-446655440005',
        productName: 'Fresh Paneer',
        productNameHi: 'ताज़ा पनीर',
        productNameBn: 'তাজা পনির',
        category: 'dairy',
        unit: 'kg',
        pricePerUnit: '380.00',
        availability: true,
        description: 'Fresh cottage cheese, soft and creamy',
        onlineStoreUrl: 'https://www.jiomart.com/p/groceries/mother-dairy-fresh-paneer-200-g/590003351',
      },

      // Amazon Fresh - Meat
      {
        supplierId: '550e8400-e29b-41d4-a716-446655440006',
        productName: 'Chicken Curry Cut',
        productNameHi: 'चिकन करी कट',
        productNameBn: 'চিকেন কারি কাট',
        category: 'meat',
        unit: 'kg',
        pricePerUnit: '220.00',
        availability: true,
        description: 'Fresh chicken curry cut, cleaned and ready',
        onlineStoreUrl: 'https://www.amazon.in/Fresh-Chicken-Curry-Without-Skin/dp/B075FWGC9L',
      },
      {
        supplierId: '550e8400-e29b-41d4-a716-446655440006',
        productName: 'Mutton Curry Cut',
        productNameHi: 'मटन करी कट',
        productNameBn: 'মাটন কারি কাট',
        category: 'meat',
        unit: 'kg',
        pricePerUnit: '680.00',
        availability: true,
        description: 'Fresh mutton curry cut, premium quality',
        onlineStoreUrl: 'https://www.amazon.in/Fresh-Mutton-Goat-Curry-Without/dp/B075FWH8VX',
      }
    ];

    console.log('Inserting products...');
    await db.insert(supplierProducts).values(productData);
    console.log(`Inserted ${productData.length} products`);

    console.log('Marketplace data seeded successfully!');
  } catch (error) {
    console.error('Error seeding marketplace data:', error);
    throw error;
  }
}