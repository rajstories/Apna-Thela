// Declare speech recognition types for browser compatibility
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export class SpeechService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;

  constructor() {
    this.initializeRecognition();
    this.initializeSynthesis();
  }

  private initializeRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
    }
  }

  private initializeSynthesis() {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  async startListening(language: string = 'hi-IN'): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      this.recognition.lang = this.getRecognitionLanguage(language);
      
      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      this.recognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.start();
    });
  }

  speak(text: string, language: string = 'hi-IN'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.getSynthesisLanguage(language);
      
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));
      
      this.synthesis.speak(utterance);
    });
  }

  detectLanguageFromSpeech(transcript: string): string {
    const lowerTranscript = transcript.toLowerCase();
    console.log('Detecting language for transcript:', lowerTranscript);
    
    // Enhanced Hindi price inquiry detection patterns
    const hindiPricePatterns = [
      // Direct rate inquiries
      'kya rate', 'क्या रेट', 'kya bhav', 'क्या भाव', 'kitna rate', 'कितना रेट',
      'kitne ka', 'कितने का', 'price kya hai', 'प्राइस क्या है',
      'bhav kya hai', 'भाव क्या है', 'rate chal raha', 'रेट चल रहा',
      'rate chl rha', 'रेट चल रहा', 'kitne mein', 'कितने में',
      'kimat kitni', 'कीमत कितनी', 'ki kimat', 'की कीमत', 'kimat kya', 'कीमत क्या',
      
      // Vegetable specific patterns
      'pyaaz ka rate', 'प्याज का रेट', 'pyaj ka bhav', 'प्याज का भाव',
      'pyaj ka rate', 'pyaj ka', 'pyaaz ka', 'प्याज का',
      'aloo ka rate', 'आलू का रेट', 'aloo ka', 'आलू का',
      'tamatar ka rate', 'टमाटर का रेट', 'tamatar ka', 'टमाटर का',
      'adrak ka rate', 'अदरक का रेट', 'adrak ka', 'अदरक का',
      'jeera ka rate', 'जीरा का रेट', 'jeera ka', 'जीरा का',
      'haldi ka rate', 'हल्दी का रेट', 'haldi ka', 'हल्दी का',
      
      // Market inquiry patterns
      'mandi mein', 'मंडी में', 'market mein', 'मार्केट में',
      'sabzi ka rate', 'सब्जी का रेट', 'masala ka rate', 'मसाला का रेट',
      'suppliers ka rate', 'suppliers का रेट',
      'bhav bata', 'भाव बता', 'rate bata', 'रेट बता',
      'kya chal raha', 'क्या चल रहा', 'chal raha hai', 'चल रहा है',
      
      // Comparison patterns
      'compare karo', 'कंपेयर करो', 'tulna karo', 'तुलना करो',
      'sabse sasta', 'सबसे सस्ता', 'best rate', 'बेस्ट रेट'
    ];
    
    // Check if transcript contains Hindi price inquiry patterns
    const isHindiPriceInquiry = hindiPricePatterns.some(pattern => 
      lowerTranscript.includes(pattern.toLowerCase())
    );
    
    if (isHindiPriceInquiry) {
      console.log('Hindi price inquiry detected');
      return 'hi';
    }
    
    // First check for explicit language names
    if (lowerTranscript.includes('english') || lowerTranscript.includes('अंग्रेजी') || lowerTranscript.includes('इंग्लिश')) {
      return 'en';
    }
    if (lowerTranscript.includes('hindi') || lowerTranscript.includes('हिंदी') || lowerTranscript.includes('हिन्दी')) {
      return 'hi';
    }
    if (lowerTranscript.includes('bengali') || lowerTranscript.includes('বাংলা') || lowerTranscript.includes('बंगाली') || lowerTranscript.includes('bangla')) {
      return 'bn';
    }
    if (lowerTranscript.includes('marathi') || lowerTranscript.includes('मराठी')) {
      return 'mr';
    }
    if (lowerTranscript.includes('tamil') || lowerTranscript.includes('தமிழ்') || lowerTranscript.includes('तमिल')) {
      return 'ta';
    }
    if (lowerTranscript.includes('telugu') || lowerTranscript.includes('తెలుగు') || lowerTranscript.includes('तेलुगु')) {
      return 'te';
    }

    // Check for script patterns (most reliable)
    if (/[অআইউএওকখগঘচছজঝটঠডঢতথদধনপফবভমযরলশষসহ]/.test(transcript)) {
      return 'bn';
    }
    if (/[అ-హ]/g.test(transcript)) {
      return 'te';
    }
    if (/[அ-ஹ]/g.test(transcript)) {
      return 'ta';
    }
    
    // For Devanagari script (Hindi/Marathi), check specific words
    if (/[अआइईउऊएओकखगघचछजझटठडढतथदधनपफबभमयरलवशषसह]/.test(transcript)) {
      // Marathi-specific words
      if (/\b(आहे|तुम्ही|आम्ही|होते|आले|का|ते|मी)\b/.test(transcript)) {
        return 'mr';
      }
      // Default to Hindi for Devanagari
      return 'hi';
    }
    
    // Check for common English words and patterns (including phonetic Hindi transcriptions)
    if (/\b(hello|hi|yes|no|the|and|for|with|this|that|what|how|where|when|why|good|bad|ok|okay|english|speak|language|order|book|manage|can|should|will|please|thank|you|my|your|our|app|application)\b/.test(lowerTranscript) ||
        // Detect phonetic English written in Devanagari
        /\b(हाउ|व्हाट|व्हेयर|व्हेन|प्लीज|थैंक|ऑर्डर|बुक|मैनेज|कैन|शुड|विल|यू|माई|योर|आवर|ऐप|एप्लिकेशन)\b/.test(transcript)) {
      return 'en';
    }
    
    // Check for English words with price inquiry patterns
    if (/\b(what|is|the|price|of|cost|rate|how|much|does|tell|me|about)\b/.test(lowerTranscript) &&
        /\b(potato|tomato|onion|ginger|garlic|spinach|carrot|cabbage|rice|wheat|oil|salt|sugar|पोटैटो|टोमेटो|ओनियन|जिंजर|गार्लिक|स्पिनच|कैरोट|कैबेज|राइस|व्हीट|ऑयल|साल्ट|शुगर)\b/.test(lowerTranscript)) {
      return 'en'; // English price inquiry
    }

    // Check for common Hindi words (romanized) - expanded for all vegetables
    if (/\b(namaste|namaskar|kaise|kya|hai|hain|aap|hum|main|tum|accha|bura|theek|hindi|bol|baat|kaam|bhai|bhav|bata|rate|chal|raha|pyaj|pyaaz|aloo|tamatar|kimat|kitni|kitna|bhindi|karela|karele|lauki|gobhi|palak|methi|gajar|mooli|mirch|adrak|lahsun|jeera|haldi|chana|arhar|tel|atta|chawal|namak)\b/.test(lowerTranscript)) {
      return 'hi';
    }
    
    // Enhanced English detection for phonetic transcriptions
    // Check for common English sentence patterns in Devanagari
    if (/\b(हाउ\s+(आई|शुड|कैन|टू)|व्हाट\s+(इज़|आर|कैन)|प्लीज\s+|थैंक\s+यू|ऑर्डर\s+|बुक\s+|मैनेज\s+)\b/.test(transcript)) {
      return 'en';
    }
    
    // Check character distribution
    const englishChars = (transcript.match(/[a-zA-Z]/g) || []).length;
    const totalChars = transcript.replace(/\s/g, '').length;
    
    // If mostly English characters, assume English
    if (englishChars / totalChars > 0.7 && totalChars > 0) {
      return 'en';
    }
    
    // Default to Hindi for Indian context
    return 'hi';
  }

  // Parse voice order to extract quantity and product name
  parseVoiceOrder(transcript: string): { quantity: number; unit: string; product: string } | null {
    const lowerTranscript = transcript.toLowerCase().trim();
    console.log('Parsing voice order:', lowerTranscript);
    
    // Patterns for quantity and units in multiple languages
    const quantityPatterns = [
      // English patterns
      /(\d+(?:\.\d+)?)\s*(kg|kilo|kilogram|grams?|g|lbs?|pounds?|piece|pieces|pcs|packet|packets|bottle|bottles|liter|liters?|l)\s+(.+)/i,
      /(\d+(?:\.\d+)?)\s+(.+?)\s*(kg|kilo|kilogram|grams?|g|lbs?|pounds?|piece|pieces|pcs|packet|packets|bottle|bottles|liter|liters?|l)/i,
      
      // Hindi patterns  
      /(\d+(?:\.\d+)?)\s*(किलो|किग्रा|ग्राम|पैकेट|बोतल|लीटर|पीस)\s+(.+)/i,
      /(\d+(?:\.\d+)?)\s+(.+?)\s*(किलो|किग्रा|ग्राम|पैकेट|बोतल|लीटर|पीस)/i,
      
      // Number words in Hindi
      /(एक|दो|तीन|चार|पांच|पाँच|छह|सात|आठ|नौ|दस|ek|do|teen|char|panch|paanch|cheh|saat|aath|nau|das)\s*(किलो|किग्रा|ग्राम|पैकेट|बोतल|लीटर|पीस)\s+(.+)/i,
      /(एक|दो|तीन|चार|पांच|पाँच|छह|सात|आठ|नौ|दस|ek|do|teen|char|panch|paanch|cheh|saat|aath|nau|das)\s+(.+?)\s*(किलो|किग्रा|ग्राम|पैकेट|बोतल|लीटर|पीस)/i,
      
      // Simple patterns without units (assume kg)
      /(\d+(?:\.\d+)?)\s+(.+)/i,
      /(एक|दो|तीन|चार|पांच|पाँच|छह|सात|आठ|नौ|दस|ek|do|teen|char|panch|paanch|cheh|saat|aath|nau|das)\s+(.+)/i
    ];
    
    // Number word mappings
    const numberWords: Record<string, number> = {
      'एक': 1, 'ek': 1,
      'दो': 2, 'do': 2,
      'तीन': 3, 'teen': 3,
      'चार': 4, 'char': 4,
      'पांच': 5, 'पाँच': 5, 'panch': 5, 'paanch': 5,
      'छह': 6, 'cheh': 6,
      'सात': 7, 'saat': 7,
      'आठ': 8, 'aath': 8,
      'नौ': 9, 'nau': 9,
      'दस': 10, 'das': 10
    };
    
    // Unit normalization
    const unitNormalization: Record<string, string> = {
      'kilo': 'kg', 'kilogram': 'kg', 'किलो': 'kg', 'किग्रा': 'kg',
      'grams': 'g', 'gram': 'g', 'ग्राम': 'g',
      'lbs': 'kg', 'pounds': 'kg', 'pound': 'kg',
      'piece': 'piece', 'pieces': 'piece', 'pcs': 'piece', 'पीस': 'piece',
      'packet': 'packet', 'packets': 'packet', 'पैकेट': 'packet',
      'bottle': 'bottle', 'bottles': 'bottle', 'बोतल': 'bottle',
      'liter': 'liter', 'liters': 'liter', 'l': 'liter', 'लीटर': 'liter'
    };
    
    for (const pattern of quantityPatterns) {
      const match = lowerTranscript.match(pattern);
      if (match) {
        let quantity: number;
        let unit = 'kg'; // default unit
        let product: string;
        
        if (match.length === 3) {
          // Pattern: quantity + unit + product OR quantity + product + unit
          const part1 = match[1];
          const part2 = match[2];
          const part3 = match[3] || '';
          
          // Try to determine which part is quantity, unit, and product
          if (isNaN(Number(part1)) && (part1 in numberWords)) {
            quantity = numberWords[part1];
            if (part2 in unitNormalization) {
              unit = unitNormalization[part2];
              product = part3;
            } else {
              product = part2 + (part3 ? ' ' + part3 : '');
            }
          } else {
            quantity = parseFloat(part1);
            if (part2 in unitNormalization) {
              unit = unitNormalization[part2];
              product = part3;
            } else {
              product = part2 + (part3 ? ' ' + part3 : '');
            }
          }
        } else if (match.length === 4) {
          // Pattern: quantity + product + unit
          const part1 = match[1];
          const part2 = match[2];
          const part3 = match[3];
          
          if (isNaN(Number(part1)) && (part1 in numberWords)) {
            quantity = numberWords[part1];
          } else {
            quantity = parseFloat(part1);
          }
          product = part2;
          unit = unitNormalization[part3] || part3;
        } else {
          // Simple pattern: quantity + product (assume kg)
          const part1 = match[1];
          const part2 = match[2];
          
          if (isNaN(Number(part1)) && (part1 in numberWords)) {
            quantity = numberWords[part1];
          } else {
            quantity = parseFloat(part1);
          }
          product = part2;
        }
        
        if (quantity > 0 && product && product.trim().length > 0) {
          console.log('Parsed order:', { quantity, unit, product: product.trim() });
          return { quantity, unit, product: product.trim() };
        }
      }
    }
    
    console.log('Could not parse voice order');
    return null;
  }

  // Extract item name from Hindi price inquiries
  extractItemFromHindiQuery(transcript: string): string | null {
    const lowerTranscript = transcript.toLowerCase();
    console.log('Extracting item from transcript:', lowerTranscript);
    
    // First, check for direct English words (even in Devanagari script)
    const englishMappings: Record<string, string> = {
      'potato': 'Potato', 'aloo': 'Potato', 'aalu': 'Potato', 'aaloo': 'Potato', 'alu': 'Potato', 'पोटैटो': 'Potato', 'पोटेटो': 'Potato',
      'tomato': 'Tomato', 'टोमेटो': 'Tomato', 'टमाटो': 'Tomato',
      'onion': 'Onion', 'ओनियन': 'Onion',
      'ginger': 'Ginger', 'जिंजर': 'Ginger',
      'garlic': 'Garlic', 'गार्लिक': 'Garlic',
      'spinach': 'Spinach', 'स्पिनच': 'Spinach',
      'carrot': 'Carrot', 'कैरोट': 'Carrot',
      'cabbage': 'Cabbage', 'कैबेज': 'Cabbage',
      'cauliflower': 'Cauliflower', 'कॉलीफ्लावर': 'Cauliflower',
      'broccoli': 'Broccoli', 'ब्रोकली': 'Broccoli',
      'okra': 'Okra', 'ओकरा': 'Okra',
      'cucumber': 'Cucumber', 'कुकुंबर': 'Cucumber',
      'beetroot': 'Beetroot', 'बीटरूट': 'Beetroot',
      'radish': 'Radish', 'रेडिश': 'Radish',
      'capsicum': 'Bell Pepper', 'कैप्सिकम': 'Bell Pepper',
      'mushroom': 'Mushroom', 'मशरूम': 'Mushroom',
      'pumpkin': 'Pumpkin', 'पंपकिन': 'Pumpkin',
      'rice': 'Rice', 'राइस': 'Rice',
      'wheat': 'Wheat', 'व्हीट': 'Wheat',
      'oil': 'Oil', 'ऑयल': 'Oil',
      'salt': 'Salt', 'साल्ट': 'Salt',
      'sugar': 'Sugar', 'शुगर': 'Sugar'
    };

    // Check English words first
    for (const [englishTerm, item] of Object.entries(englishMappings)) {
      const regex = new RegExp(`\\b${englishTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(lowerTranscript)) {
        console.log('Found English item match:', englishTerm, '→', item);
        return item;
      }
    }
    
    // Comprehensive mapping for all vegetables, spices, and raw materials (Hindi/regional)
    const itemMappings: Record<string, string> = {
      // Common Vegetables
      'pyaaz': 'Onion', 'pyaj': 'Onion', 'प्याज': 'Onion', 'onion': 'Onion',
      'aloo': 'Potato', 'aalu': 'Potato', 'aaloo': 'Potato', 'alu': 'Potato', 'आलू': 'Potato', 'potato': 'Potato',
      'tamatar': 'Tomato', 'टमाटर': 'Tomato', 'tomato': 'Tomato',
      'bhindi': 'Okra', 'भिंडी': 'Okra', 'okra': 'Okra',
      'karela': 'Bitter Gourd', 'करेला': 'Bitter Gourd', 'karele': 'Bitter Gourd', 'bitter gourd': 'Bitter Gourd',
      'lauki': 'Bottle Gourd', 'लौकी': 'Bottle Gourd', 'bottle gourd': 'Bottle Gourd',
      'kaddu': 'Pumpkin', 'कद्दू': 'Pumpkin', 'pumpkin': 'Pumpkin',
      'tori': 'Ridge Gourd', 'तोरी': 'Ridge Gourd', 'ridge gourd': 'Ridge Gourd',
      'gilki': 'Sponge Gourd', 'गिल्की': 'Sponge Gourd', 'sponge gourd': 'Sponge Gourd',
      'nenua': 'Snake Gourd', 'नेनुआ': 'Snake Gourd', 'snake gourd': 'Snake Gourd',
      'parwal': 'Pointed Gourd', 'परवल': 'Pointed Gourd', 'pointed gourd': 'Pointed Gourd',
      
      // Leafy Vegetables
      'palak': 'Spinach', 'पालक': 'Spinach', 'spinach': 'Spinach',
      'methi': 'Fenugreek Leaves', 'मेथी': 'Fenugreek Leaves', 'fenugreek': 'Fenugreek Leaves',
      'dhania patta': 'Coriander', 'धनिया पत्ता': 'Coriander', 'coriander leaves': 'Coriander',
      'pudina': 'Mint', 'पुदीना': 'Mint', 'mint': 'Mint',
      'sarson ka saag': 'Mustard Greens', 'सरसों का साग': 'Mustard Greens', 'mustard greens': 'Mustard Greens',
      'bathua': 'Chenopodium', 'बथुआ': 'Chenopodium', 'chenopodium': 'Chenopodium',
      
      // Root Vegetables
      'gajar': 'Carrot', 'गाजर': 'Carrot', 'carrot': 'Carrot',
      'mooli': 'Radish', 'मूली': 'Radish', 'radish': 'Radish',
      'shalgam': 'Turnip', 'शलगम': 'Turnip', 'turnip': 'Turnip',
      'chukandar': 'Beetroot', 'चुकंदर': 'Beetroot', 'beetroot': 'Beetroot',
      'arvi': 'Colocasia', 'अरवी': 'Colocasia', 'colocasia': 'Colocasia',
      'shakarkand': 'Sweet Potato', 'शकरकंद': 'Sweet Potato', 'sweet potato': 'Sweet Potato',
      
      // Beans and Pods
      'sem': 'Broad Beans', 'सेम': 'Broad Beans', 'broad beans': 'Broad Beans',
      'farasbi': 'French Beans', 'फरासबी': 'French Beans', 'french beans': 'French Beans',
      'lobhia': 'Black Eyed Peas', 'लोभिया': 'Black Eyed Peas', 'black eyed peas': 'Black Eyed Peas',
      'gawar': 'Cluster Beans', 'गवार': 'Cluster Beans', 'cluster beans': 'Cluster Beans',
      'barbati': 'Long Beans', 'बरबटी': 'Long Beans', 'long beans': 'Long Beans',
      
      // Brassicas
      'gobhi': 'Cauliflower', 'गोभी': 'Cauliflower', 'cauliflower': 'Cauliflower',
      'patta gobhi': 'Cabbage', 'पत्ता गोभी': 'Cabbage', 'cabbage': 'Cabbage',
      'broccoli': 'Broccoli', 'ब्रोकली': 'Broccoli',
      
      // Chilies and Peppers
      'hari mirch': 'Green Chili', 'हरी मिर्च': 'Green Chili', 'green chili': 'Green Chili',
      'mirch': 'Chili', 'मिर्च': 'Chili', 'chili': 'Chili',
      'lal mirch': 'Red Chili', 'लाल मिर्च': 'Red Chili', 'red chili': 'Red Chili',
      'shimla mirch': 'Bell Pepper', 'शिमला मिर्च': 'Bell Pepper', 'bell pepper': 'Bell Pepper',
      
      // Spices and Seasonings
      'adrak': 'Ginger', 'अदरक': 'Ginger', 'ginger': 'Ginger',
      'lahsun': 'Garlic', 'लहसुन': 'Garlic', 'garlic': 'Garlic',
      'jeera': 'Cumin', 'जीरा': 'Cumin', 'cumin': 'Cumin',
      'dhaniya': 'Coriander Seeds', 'धनिया': 'Coriander Seeds', 'coriander seeds': 'Coriander Seeds',
      'haldi': 'Turmeric', 'हल्दी': 'Turmeric', 'turmeric': 'Turmeric',
      'kali mirch': 'Black Pepper', 'काली मिर्च': 'Black Pepper', 'black pepper': 'Black Pepper',
      'hing': 'Asafoetida', 'हींग': 'Asafoetida', 'asafoetida': 'Asafoetida',
      'ajwain': 'Carom Seeds', 'अजवाइन': 'Carom Seeds', 'carom seeds': 'Carom Seeds',
      'til': 'Sesame Seeds', 'तिल': 'Sesame Seeds', 'sesame': 'Sesame Seeds',
      'sarson ke beej': 'Mustard Seeds', 'सरसों के बीज': 'Mustard Seeds', 'mustard seeds': 'Mustard Seeds',
      'kalonji': 'Nigella Seeds', 'कलौंजी': 'Nigella Seeds', 'nigella': 'Nigella Seeds',
      'elaichi': 'Cardamom', 'इलायची': 'Cardamom', 'cardamom': 'Cardamom',
      'laung': 'Cloves', 'लौंग': 'Cloves', 'cloves': 'Cloves',
      'dalchini': 'Cinnamon', 'दालचीनी': 'Cinnamon', 'cinnamon': 'Cinnamon',
      'jaiphal': 'Nutmeg', 'जायफल': 'Nutmeg', 'nutmeg': 'Nutmeg',
      'javitri': 'Mace', 'जावित्री': 'Mace', 'mace': 'Mace',
      'tej patta': 'Bay Leaves', 'तेज पत्ता': 'Bay Leaves', 'bay leaves': 'Bay Leaves',
      
      // Pulses and Lentils  
      'arhar': 'Pigeon Pea', 'अरहर': 'Pigeon Pea', 'pigeon pea': 'Pigeon Pea',
      'toor': 'Toor Dal', 'तूर': 'Toor Dal', 'toor dal': 'Toor Dal',
      'chana': 'Chickpeas', 'चना': 'Chickpeas', 'chickpeas': 'Chickpeas',
      'masoor': 'Red Lentils', 'मसूर': 'Red Lentils', 'masoor dal': 'Red Lentils',
      'moong': 'Mung Beans', 'मूंग': 'Mung Beans', 'moong dal': 'Mung Beans',
      'urad': 'Black Gram', 'उड़द': 'Black Gram', 'urad dal': 'Black Gram',
      'rajma': 'Kidney Beans', 'राजमा': 'Kidney Beans', 'kidney beans': 'Kidney Beans',
      'kala chana': 'Black Chickpeas', 'काला चना': 'Black Chickpeas', 'black chickpeas': 'Black Chickpeas',
      
      // Oils and Cooking Media
      'tel': 'Oil', 'तेल': 'Oil', 'oil': 'Oil',
      'sarson ka tel': 'Mustard Oil', 'सरसों का तेल': 'Mustard Oil', 'mustard oil': 'Mustard Oil',
      'til ka tel': 'Sesame Oil', 'तिल का तेल': 'Sesame Oil', 'sesame oil': 'Sesame Oil',
      'nariyal tel': 'Coconut Oil', 'नारियल तेल': 'Coconut Oil', 'coconut oil': 'Coconut Oil',
      'ghee': 'Clarified Butter', 'घी': 'Clarified Butter', 'clarified butter': 'Clarified Butter',
      
      // Common Raw Materials for Street Food
      'atta': 'Wheat Flour', 'आटा': 'Wheat Flour', 'wheat flour': 'Wheat Flour',
      'maida': 'All Purpose Flour', 'मैदा': 'All Purpose Flour', 'all purpose flour': 'All Purpose Flour',
      'besan': 'Gram Flour', 'बेसन': 'Gram Flour', 'gram flour': 'Gram Flour',
      'suji': 'Semolina', 'सूजी': 'Semolina', 'semolina': 'Semolina',
      'poha': 'Flattened Rice', 'पोहा': 'Flattened Rice', 'flattened rice': 'Flattened Rice',
      'chawal': 'Rice', 'चावल': 'Rice', 'rice': 'Rice',
      'namak': 'Salt', 'नमक': 'Salt', 'salt': 'Salt',
      'cheeni': 'Sugar', 'चीनी': 'Sugar', 'sugar': 'Sugar',
      'gud': 'Jaggery', 'गुड़': 'Jaggery', 'jaggery': 'Jaggery'
    };
    
    for (const [hindiTerm, englishItem] of Object.entries(itemMappings)) {
      // Check for exact word matches to avoid false positives
      const regex = new RegExp(`\\b${hindiTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(lowerTranscript)) {
        console.log('Found item match:', hindiTerm, '→', englishItem);
        return englishItem;
      }
    }
    
    console.log('No item found in transcript');
    return null;
  }

  // Generate contextual voice confirmations in detected language
  getVoiceConfirmationMessage(language: string, itemName?: string): string {
    const messages: Record<string, string> = {
      'hi': itemName 
        ? `${itemName} की कीमतों की तुलना शुरू कर रहे हैं। पूरा ऐप हिंदी में बदल गया।`
        : 'हिंदी चुनी गई - पूरा ऐप हिंदी में बदल गया।',
      'en': itemName 
        ? `Starting price comparison for ${itemName}. Language switched to English.`
        : 'English selected - App language switched to English.',
      'bn': itemName 
        ? `${itemName} এর দাম তুলনা শুরু হচ্ছে। ভাষা বাংলায় পরিবর্তিত হয়েছে।`
        : 'বাংলা নির্বাচিত - অ্যাপের ভাষা বাংলায় পরিবর্তিত হয়েছে।',
      'mr': itemName 
        ? `${itemName} च्या किमतींची तुलना सुरू करत आहे। भाषा मराठीत बदलली.`
        : 'मराठी निवडली - अॅपची भाषा मराठीत बदलली.',
      'ta': itemName 
        ? `${itemName} விலை ஒப்பீடு தொடங்குகிறது. மொழி தமிழுக்கு மாற்றப்பட்டது.`
        : 'தமிழ் தேர்ந்தெடுக்கப்பட்டது - பயன்பாட்டின் மொழி தமிழுக்கு மாற்றப்பட்டது.',
      'te': itemName 
        ? `${itemName} ధరల పోలిక ప్రారంభమవుతోంది. భాష తెలుగులోకి మార్చబడింది.`
        : 'తెలుగు ఎంచుకోబడింది - యాప్ భాష తెలుగులోకి మార్చబడింది.'
    };
    
    return messages[language] || messages['en'];
  }

  private getRecognitionLanguage(language: string): string {
    const languageMap: Record<string, string> = {
      'hi': 'hi-IN',
      'en': 'en-US',
      'bn': 'bn-BD',
      'mr': 'mr-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
    };
    return languageMap[language] || 'hi-IN';
  }

  private getSynthesisLanguage(language: string): string {
    const languageMap: Record<string, string> = {
      'hi': 'hi-IN',
      'en': 'en-US',
      'bn': 'bn-BD',
      'mr': 'mr-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
    };
    return languageMap[language] || 'hi-IN';
  }

  isSupported(): { recognition: boolean; synthesis: boolean } {
    return {
      recognition: !!this.recognition,
      synthesis: !!this.synthesis,
    };
  }
}

export const speechService = new SpeechService();
