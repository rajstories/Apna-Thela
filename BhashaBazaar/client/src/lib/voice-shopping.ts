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
  { name: 'BigBasket', searchUrl: 'https://www.bigbasket.com/ps/?q=', priority: 0.35 },
  { name: 'Amazon Fresh', searchUrl: 'https://www.amazon.in/s?k=', priority: 0.3 },
  { name: 'JioMart', searchUrl: 'https://www.jiomart.com/search/', priority: 0.2 },
  { name: 'Grofers/BlinkIt', searchUrl: 'https://grofers.com/search/?query=', priority: 0.15 }
];

export class VoiceShoppingService {
  // Detect language from voice input using pattern recognition
  private detectLanguageFromInput(input: string): 'hi' | 'en' | 'bn' {
    const devanagariPattern = /[\u0900-\u097F]/; // Hindi/Devanagari script
    const bengaliPattern = /[\u0980-\u09FF]/; // Bengali script
    
    // Hindi words and patterns
    const hindiWords = ['किलो', 'ग्राम', 'पीस', 'पाव', 'चाहिए', 'दे', 'दो', 'एक', 'दूध', 'आलू', 'प्याज', 'टमाटर', 'अदरक'];
    const englishWords = ['kg', 'kilo', 'gram', 'piece', 'want', 'need', 'give', 'one', 'two'];
    
    // Check for Devanagari script
    if (devanagariPattern.test(input)) {
      return 'hi';
    }
    
    // Check for Bengali script  
    if (bengaliPattern.test(input)) {
      return 'bn';
    }
    
    // Check for Hindi words in Roman script
    const lowerInput = input.toLowerCase();
    const hindiWordCount = hindiWords.filter(word => lowerInput.includes(word.toLowerCase())).length;
    const englishWordCount = englishWords.filter(word => lowerInput.includes(word)).length;
    
    // Also check for transliterated Hindi words
    const hindiTransliterations = ['aloo', 'pyaz', 'tamatar', 'adrak', 'doodh', 'chawal', 'dal', 'paav', 'chahiye'];
    const hindiTranslitCount = hindiTransliterations.filter(word => lowerInput.includes(word)).length;
    
    if (hindiWordCount > 0 || hindiTranslitCount > englishWordCount) {
      return 'hi';
    }
    
    return 'en'; // Default to English
  }

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

  async processVoiceOrder(transcript: string, onLanguageDetected?: (language: 'hi' | 'en' | 'bn') => void): Promise<VoiceOrderResult> {
    console.log('Processing voice order:', transcript);
    
    try {
      // Detect language from voice input
      const detectedLanguage = this.detectLanguageFromInput(transcript);
      console.log('Detected language:', detectedLanguage);
      
      // Notify about language detection for UI switching
      if (onLanguageDetected) {
        onLanguageDetected(detectedLanguage);
      }
      
      // Parse the voice order
      const parsedOrder = speechService.parseVoiceOrder(transcript);
      if (!parsedOrder) {
        const errorMessage = detectedLanguage === 'hi' 
          ? 'समझ नहीं आया। कृपया "1 किलो आलू" जैसे कहें।'
          : detectedLanguage === 'bn'
          ? 'বুঝতে পারিনি। দয়া করে "১ কেজি আলু" এর মতো বলুন।'
          : 'Could not understand the order. Please try saying something like "1 kg potato"';
          
        return {
          success: false,
          message: errorMessage
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
      
      // Create localized success message
      const successMessage = detectedLanguage === 'hi'
        ? `${parsedOrder.quantity} ${parsedOrder.unit} ${parsedOrder.product} के लिए ${selectedPlatform.name} पर खोज रहे हैं...`
        : detectedLanguage === 'bn' 
        ? `${parsedOrder.quantity} ${parsedOrder.unit} ${parsedOrder.product} এর জন্য ${selectedPlatform.name} এ খোঁজ করছি...`
        : `Searching for ${parsedOrder.quantity} ${parsedOrder.unit} ${parsedOrder.product} on ${selectedPlatform.name}...`;
      
      return {
        success: true,
        message: successMessage,
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