import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import { useSpeech } from '@/hooks/use-speech';
import { Mic, MicOff } from 'lucide-react';
import { useLocation } from 'wouter';
import nlp from 'compromise';

export function GlobalVoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [, navigate] = useLocation();
  const { language, setLanguage } = useLanguage();
  const { startListening, isSupported } = useSpeech();
  const { toast } = useToast();

  // Auto-detect language and store in localStorage
  const detectAndSetLanguage = (transcript: string) => {
    const lowerText = transcript.toLowerCase();
    
    // Language detection patterns
    if (/[आ-ह]/.test(transcript) || lowerText.includes('नमस्ते') || lowerText.includes('धन्यवाद')) {
      setLanguage('hi');
      localStorage.setItem('detectedLanguage', 'hi');
      return 'hi';
    } else if (/[ক-হ]/.test(transcript) || lowerText.includes('নমস্কার') || lowerText.includes('ধন্যবাদ')) {
      setLanguage('bn');
      localStorage.setItem('detectedLanguage', 'bn');
      return 'bn';
    } else if (/[क-ह]/.test(transcript) || lowerText.includes('नमस्कार') || lowerText.includes('धन्यवाद')) {
      setLanguage('mr');
      localStorage.setItem('detectedLanguage', 'mr');
      return 'mr';
    } else if (/[அ-ஹ]/.test(transcript) || lowerText.includes('வணக்கம்') || lowerText.includes('நன்றி')) {
      setLanguage('ta');
      localStorage.setItem('detectedLanguage', 'ta');
      return 'ta';
    } else if (/[అ-హ]/.test(transcript) || lowerText.includes('నమస్కారం') || lowerText.includes('ధన్యవాదాలు')) {
      setLanguage('te');
      localStorage.setItem('detectedLanguage', 'te');
      return 'te';
    } else {
      setLanguage('en');
      localStorage.setItem('detectedLanguage', 'en');
      return 'en';
    }
  };

  // Process voice commands with NLP
  const processVoiceCommand = (transcript: string) => {
    const detectedLang = detectAndSetLanguage(transcript);
    const lowerText = transcript.toLowerCase();
    
    // Use compromise.js for basic NLP
    const doc = nlp(lowerText);
    const verbs = doc.verbs().text();
    const nouns = doc.nouns().text();

    // Command patterns for different languages
    const commandPatterns = {
      // Navigation commands
      order: /\b(order|ऑर्डर|অর্ডার|ऑर्डर|ஆர்டர்|ఆర్డర్|buy|खरीद|কিন|खरेदी|வாங்கு|కొను)\b/i,
      stock: /\b(stock|स्टॉक|স্টক|स्टॉक|ஸ்டாக்|స్టాక్|inventory|इन्वेंटरी|ইনভেন্টরি|इन्व्हेंटरी|இன்வென்டரி|ఇన్వెంటరీ)\b/i,
      wallet: /\b(wallet|वॉलेट|ওয়ালেট|वॉलेट|வாலெட்|వాలెట్|money|पैसा|টাকা|पैसे|பணம்|డబ్బు)\b/i,
      marketplace: /\b(market|मार्केट|বাজার|बाजार|சந்தை|మార్కెట్|supplier|सप्लायर|সরবরাহকারী|पुरवठादार|சப்ளையர్|సరఫరాదారు)\b/i,
      profile: /\b(profile|प्रोफाइल|প্রোফাইল|प्रोफाइल|ప్రొఫైల్|account|अकाउंट|অ্যাকাউন্ট|खाते|கணக்கு|ఖాతా)\b/i,
    };

    // Product matching
    const productPatterns = {
      aloo: /\b(aloo|आलू|আলু|बटाटे|உருளைக்கிழங்கு|బంగాళాదుంప|potato)\b/i,
      pyaz: /\b(pyaz|प्याज|পেঁয়াজ|कांदा|வெங்காயம్|ఉల్లిపాయ|onion)\b/i,
      tamatar: /\b(tamatar|टमाटर|টমেটো|टोमॅटो|தக்காளி|టమాటా|tomato)\b/i,
      oil: /\b(oil|तेल|তেল|तेल|எண்ணெய్|నూనె)\b/i,
    };

    // Execute commands
    if (commandPatterns.order.test(lowerText)) {
      // Check for specific products
      let productQuery = '';
      if (productPatterns.aloo.test(lowerText)) productQuery = '?search=aloo';
      else if (productPatterns.pyaz.test(lowerText)) productQuery = '?search=pyaz';
      else if (productPatterns.tamatar.test(lowerText)) productQuery = '?search=tamatar';
      else if (productPatterns.oil.test(lowerText)) productQuery = '?search=oil';

      navigate(`/buy-ingredients${productQuery}`);
      toast({
        title: getSuccessMessage(detectedLang, 'order'),
        description: getDescription(detectedLang, 'order', productQuery),
      });
    } else if (commandPatterns.stock.test(lowerText)) {
      navigate('/inventory');
      toast({
        title: getSuccessMessage(detectedLang, 'stock'),
        description: getDescription(detectedLang, 'stock'),
      });
    } else if (commandPatterns.wallet.test(lowerText)) {
      navigate('/wallet');
      toast({
        title: getSuccessMessage(detectedLang, 'wallet'),
        description: getDescription(detectedLang, 'wallet'),
      });
    } else if (commandPatterns.marketplace.test(lowerText)) {
      navigate('/marketplace');
      toast({
        title: getSuccessMessage(detectedLang, 'marketplace'),
        description: getDescription(detectedLang, 'marketplace'),
      });
    } else if (commandPatterns.profile.test(lowerText)) {
      navigate('/profile');
      toast({
        title: getSuccessMessage(detectedLang, 'profile'),
        description: getDescription(detectedLang, 'profile'),
      });
    } else {
      // Unknown command
      toast({
        title: getErrorMessage(detectedLang),
        description: getHelpMessage(detectedLang),
        variant: 'destructive',
      });
    }
  };

  const getSuccessMessage = (lang: string, action: string) => {
    const messages = {
      hi: {
        order: '🛒 खरीदारी पेज खोला गया',
        stock: '📦 स्टॉक पेज खोला गया',
        wallet: '💳 वॉलेट खोला गया',
        marketplace: '🏪 मार्केटप्लेस खोला गया',
        profile: '👤 प्रोफाइल खोला गया',
      },
      bn: {
        order: '🛒 কেনাকাটা পৃষ্ঠা খোলা হয়েছে',
        stock: '📦 স্টক পৃষ্ঠা খোলা হয়েছে',
        wallet: '💳 ওয়ালেট খোলা হয়েছে',
        marketplace: '🏪 মার্কেটপ্লেস খোলা হয়েছে',
        profile: '👤 প্রোফাইল খোলা হয়েছে',
      },
      en: {
        order: '🛒 Shopping page opened',
        stock: '📦 Inventory page opened',
        wallet: '💳 Wallet opened',
        marketplace: '🏪 Marketplace opened',
        profile: '👤 Profile opened',
      },
    };
    return messages[lang]?.[action] || messages.en[action];
  };

  const getDescription = (lang: string, action: string, extra?: string) => {
    const descriptions = {
      hi: {
        order: extra ? 'प्रोडक्ट खोजने के लिए तैयार' : 'सभी प्रोडक्ट्स देखें',
        stock: 'अपना इन्वेंटरी चेक करें',
        wallet: 'पैसों का हिसाब देखें',
        marketplace: 'सप्लायर्स खोजें',
        profile: 'अपनी जानकारी देखें',
      },
      bn: {
        order: extra ? 'পণ্য খোঁজার জন্য প্রস্তুত' : 'সব পণ্য দেখুন',
        stock: 'আপনার ইনভেন্টরি চেক করুন',
        wallet: 'টাকার হিসাব দেখুন',
        marketplace: 'সরবরাহকারী খুঁজুন',
        profile: 'আপনার তথ্য দেখুন',
      },
      en: {
        order: extra ? 'Ready to search products' : 'View all products',
        stock: 'Check your inventory',
        wallet: 'View money details',
        marketplace: 'Find suppliers',
        profile: 'View your information',
      },
    };
    return descriptions[lang]?.[action] || descriptions.en[action];
  };

  const getErrorMessage = (lang: string) => {
    const messages = {
      hi: '❓ समझ नहीं आया',
      bn: '❓ বুঝতে পারলাম না',
      en: '❓ Didn\'t understand',
    };
    return messages[lang] || messages.en;
  };

  const getHelpMessage = (lang: string) => {
    const messages = {
      hi: '"ऑर्डर आलू", "स्टॉक चेक", "वॉलेट खोलो" जैसे कमांड बोलें',
      bn: '"অর্ডার আলু", "স্টক চেক", "ওয়ালেট খোলো" এরকম কমান্ড বলুন',
      en: 'Try commands like "Order aloo", "Check stock", "Open wallet"',
    };
    return messages[lang] || messages.en;
  };

  const handleVoiceInput = async () => {
    if (!isSupported) {
      toast({
        title: language === 'hi' ? 'एरर' : 'Error',
        description: language === 'hi' ? 'वॉयस इनपुट सपोर्ट नहीं है' : 'Voice input not supported',
        variant: 'destructive',
      });
      return;
    }

    setIsListening(true);
    
    try {
      const transcript = await startListening(language);
      if (transcript && transcript.trim().length > 0) {
        processVoiceCommand(transcript);
      }
    } catch (error) {
      toast({
        title: language === 'hi' ? 'एरर' : 'Error',
        description: language === 'hi' ? 'वॉयस इनपुट में समस्या' : 'Voice input failed',
        variant: 'destructive',
      });
    } finally {
      setIsListening(false);
    }
  };

  // Load saved language on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('detectedLanguage');
    if (savedLanguage && savedLanguage !== language) {
      setLanguage(savedLanguage);
    }
  }, [language, setLanguage]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleVoiceInput}
        disabled={!isSupported || isListening}
        className={`w-14 h-14 rounded-full shadow-lg transition-all ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
        size="lg"
      >
        {isListening ? (
          <MicOff className="h-6 w-6 text-white" />
        ) : (
          <Mic className="h-6 w-6 text-white" />
        )}
      </Button>
    </div>
  );
}