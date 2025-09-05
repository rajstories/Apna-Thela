import { speechService } from './speech';

export interface VoiceOrder {
  quantity: number;
  unit: string;
  product: string;
}

export interface VoiceOrderResult {
  success: boolean;
  message: string;
  redirectUrl?: string;
  product?: {
    name: string;
    platform: string;
    translatedName?: string;
  };
}

// Dynamic platform search URLs for unlimited product search
const PLATFORMS = [
  { name: 'BigBasket', searchUrl: 'https://www.bigbasket.com/ps/?q=', priority: 0.3 },
  { name: 'Zepto', searchUrl: 'https://www.zepto.co.in/search?query=', priority: 0.25 },
  { name: 'BlinkIt', searchUrl: 'https://blinkit.com/search?q=', priority: 0.2 },
  { name: 'Instamart', searchUrl: 'https://www.swiggy.com/instamart/search?query=', priority: 0.15 },
  { name: 'JioMart', searchUrl: 'https://www.jiomart.com/search/', priority: 0.05 },
  { name: 'Amazon Fresh', searchUrl: 'https://www.amazon.in/s?k=', priority: 0.05 }
];

export class VoiceShoppingService {
  // Comprehensive product name translation from Hindi/regional to English
  private translateProductName(productName: string): string {
    const translations: Record<string, string> = {
      // Vegetables
      'आलू': 'potato', 'aloo': 'potato', 'alu': 'potato', 'aaloo': 'potato',
      'प्याज': 'onion', 'pyaz': 'onion', 'pyaaz': 'onion',
      'टमाटर': 'tomato', 'tamatar': 'tomato', 'टोमेटो': 'tomato',
      'अदरक': 'ginger', 'adrak': 'ginger', 'जिंजर': 'ginger',
      'लहसुन': 'garlic', 'lahsun': 'garlic', 'गार्लिक': 'garlic',
      'भिंडी': 'okra', 'bhindi': 'okra', 'lady finger': 'okra',
      'पालक': 'spinach', 'palak': 'spinach', 'स्पिनच': 'spinach',
      'मेथी': 'fenugreek leaves', 'methi': 'fenugreek leaves',
      'धनिया': 'coriander', 'dhania': 'coriander', 'cilantro': 'coriander',
      'पुदीना': 'mint', 'pudina': 'mint',
      'गाजर': 'carrot', 'gajar': 'carrot', 'कैरोट': 'carrot',
      'मूली': 'radish', 'mooli': 'radish', 'रेडिश': 'radish',
      'बैंगन': 'brinjal', 'baingan': 'brinjal', 'eggplant': 'brinjal',
      'कद्दू': 'pumpkin', 'kaddu': 'pumpkin', 'पंपकिन': 'pumpkin',
      'करेला': 'bitter gourd', 'karela': 'bitter gourd',
      'लौकी': 'bottle gourd', 'lauki': 'bottle gourd',
      'तोरी': 'ridge gourd', 'tori': 'ridge gourd',
      'शिमला मिर्च': 'bell pepper', 'shimla mirch': 'bell pepper', 'capsicum': 'bell pepper',
      'हरी मिर्च': 'green chili', 'hari mirch': 'green chili',
      'खीरा': 'cucumber', 'kheera': 'cucumber', 'कुकुंबर': 'cucumber',
      'ककड़ी': 'cucumber', 'kakdi': 'cucumber',
      
      // Grains & Pulses
      'चावल': 'rice', 'chawal': 'rice', 'राइस': 'rice',
      'गेहूं': 'wheat', 'gehun': 'wheat', 'व्हीट': 'wheat',
      'आटा': 'flour', 'atta': 'flour', 'wheat flour': 'flour',
      'मैदा': 'all purpose flour', 'maida': 'all purpose flour',
      'सूजी': 'semolina', 'sooji': 'semolina', 'rava': 'semolina',
      'दाल': 'lentils', 'dal': 'lentils',
      'चना': 'chickpeas', 'chana': 'chickpeas', 'gram': 'chickpeas',
      'राजमा': 'kidney beans', 'rajma': 'kidney beans',
      'मसूर': 'red lentils', 'masoor': 'red lentils',
      'तूर दाल': 'pigeon peas', 'toor dal': 'pigeon peas', 'arhar': 'pigeon peas',
      'उड़द': 'black gram', 'urad': 'black gram',
      'मूंग': 'green gram', 'moong': 'green gram',
      'काला चना': 'black chickpeas', 'kala chana': 'black chickpeas',
      
      // Spices & Seasonings
      'हल्दी': 'turmeric', 'haldi': 'turmeric',
      'मिर्च पाउडर': 'chili powder', 'mirch powder': 'chili powder', 'lal mirch': 'red chili powder',
      'धनिया पाउडर': 'coriander powder', 'dhania powder': 'coriander powder',
      'जीरा': 'cumin', 'jeera': 'cumin',
      'राई': 'mustard seeds', 'rai': 'mustard seeds', 'sarson': 'mustard seeds',
      'तेज पत्ता': 'bay leaves', 'tej patta': 'bay leaves',
      'दालचीनी': 'cinnamon', 'dalchini': 'cinnamon',
      'इलायची': 'cardamom', 'elaichi': 'cardamom',
      'लौंग': 'cloves', 'laung': 'cloves',
      'काली मिर्च': 'black pepper', 'kali mirch': 'black pepper',
      'गर्म मसाला': 'garam masala', 'garam masala': 'garam masala',
      'चाट मसाला': 'chaat masala', 'chat masala': 'chaat masala',
      'अमचूर': 'dry mango powder', 'amchur': 'dry mango powder',
      'हींग': 'asafoetida', 'hing': 'asafoetida',
      
      // Dairy & Proteins
      'दूध': 'milk', 'doodh': 'milk',
      'दही': 'yogurt', 'dahi': 'yogurt', 'curd': 'yogurt',
      'पनीर': 'paneer', 'cottage cheese': 'paneer',
      'मक्खन': 'butter', 'makhan': 'butter',
      'घी': 'ghee', 'clarified butter': 'ghee',
      'चीज़': 'cheese', 'cheese': 'cheese',
      'अंडे': 'eggs', 'ande': 'eggs',
      'मुर्गा': 'chicken', 'murga': 'chicken', 'chicken': 'chicken',
      'मछली': 'fish', 'machli': 'fish', 'fish': 'fish',
      'झींगा': 'prawns', 'jhinga': 'prawns', 'shrimp': 'prawns',
      'बकरा': 'mutton', 'bakra': 'mutton', 'goat meat': 'mutton',
      
      // Cooking Essentials
      'तेल': 'oil', 'tel': 'oil',
      'सरसों का तेल': 'mustard oil', 'sarson ka tel': 'mustard oil',
      'नारियल तेल': 'coconut oil', 'nariyal tel': 'coconut oil',
      'नमक': 'salt', 'namak': 'salt',
      'चीनी': 'sugar', 'cheeni': 'sugar', 'शक्कर': 'sugar', 'shakkar': 'jaggery',
      'गुड़': 'jaggery', 'gud': 'jaggery',
      'सिरका': 'vinegar', 'sirka': 'vinegar',
      'नींबू': 'lemon', 'nimbu': 'lemon', 'lime': 'lime',
      
      // Dry Fruits & Nuts
      'बादाम': 'almonds', 'badam': 'almonds',
      'काजू': 'cashews', 'kaju': 'cashews',
      'अखरोट': 'walnuts', 'akhrot': 'walnuts',
      'किशमिश': 'raisins', 'kishmish': 'raisins',
      'खजूर': 'dates', 'khajur': 'dates',
      'पिस्ता': 'pistachios', 'pista': 'pistachios',
      
      // Beverages
      'चाय': 'tea', 'chai': 'tea',
      'कॉफी': 'coffee', 'coffee': 'coffee',
      'पानी': 'water', 'paani': 'water',
      
      // Common additions/cleanup
      'पोटैटो': 'potato', 'पोटेटो': 'potato',
      'टोमैटो': 'tomato', 'ओनियन': 'onion'
    };

    const lowerName = productName.toLowerCase().trim();
    
    // Direct translation
    if (translations[lowerName]) {
      return translations[lowerName];
    }
    
    // Check for partial matches
    for (const [original, translation] of Object.entries(translations)) {
      if (lowerName.includes(original) || original.includes(lowerName)) {
        return translation;
      }
    }
    
    // Return original if no translation found (might already be in English)
    return productName;
  }

  // Smart platform selection with weighted randomness
  private selectPlatform(): typeof PLATFORMS[0] {
    const random = Math.random();
    let cumulative = 0;
    
    for (const platform of PLATFORMS) {
      cumulative += platform.priority;
      if (random <= cumulative) {
        return platform;
      }
    }
    
    // Fallback to first platform
    return PLATFORMS[0];
  }

  async processVoiceOrder(transcript: string): Promise<VoiceOrderResult> {
    console.log('Processing voice order:', transcript);
    
    try {
      // Parse the voice order
      const parsedOrder = speechService.parseVoiceOrder(transcript);
      if (!parsedOrder) {
        return {
          success: false,
          message: 'Could not understand the order. Please try saying something like "1 kg potato" or "एक किलो आलू"'
        };
      }
      
      console.log('Parsed order:', parsedOrder);
      
      // Translate product name to English for better search results
      const translatedProduct = this.translateProductName(parsedOrder.product);
      console.log('Translated product:', parsedOrder.product, '→', translatedProduct);
      
      // Select platform for search
      const selectedPlatform = this.selectPlatform();
      console.log('Selected platform:', selectedPlatform.name);
      
      // Create search URL with translated product name
      const searchQuery = encodeURIComponent(translatedProduct);
      const redirectUrl = selectedPlatform.searchUrl + searchQuery;
      
      console.log('Search URL:', redirectUrl);
      
      return {
        success: true,
        message: `Searching for ${parsedOrder.quantity} ${parsedOrder.unit} ${parsedOrder.product} on ${selectedPlatform.name}...`,
        redirectUrl: redirectUrl,
        product: {
          name: parsedOrder.product,
          platform: selectedPlatform.name,
          translatedName: translatedProduct !== parsedOrder.product ? translatedProduct : undefined
        }
      };
      
    } catch (error) {
      console.error('Error processing voice order:', error);
      return {
        success: false,
        message: 'Error processing order. Please try again.'
      };
    }
  }
}

export const voiceShoppingService = new VoiceShoppingService();