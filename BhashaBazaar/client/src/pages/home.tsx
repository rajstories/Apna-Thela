import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LanguageModal } from '@/components/language-modal';
import { VoiceInputButton } from '@/components/voice-input-button';
import { BottomNavigation } from '@/components/bottom-navigation';
import { FloatingHelpButton } from '@/components/floating-help-button';
import { LanguageLoadingOverlay } from '@/components/language-loading-overlay';
import { SupportChat } from '@/components/support-chat';
import CalculatorModal from '@/components/calculator-modal';
import { useLanguage } from '@/hooks/use-language';
import { useSpeech } from '@/hooks/use-speech';
import { useToast } from '@/hooks/use-toast';
import { getTranslation, getRandomTagline } from '@/lib/i18n';
import { ShoppingCart, Package, Mic, MapPin, Calculator, HelpCircle, Globe, User, Volume2, Wallet, Check, RotateCcw } from 'lucide-react';
import ApnaThelaLogo from '@/assets/apna-thela-logo.svg';
import { useLocation } from 'wouter';
import type { InventoryItem } from '@shared/schema';

export default function Home() {
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showVoiceOrderModal, setShowVoiceOrderModal] = useState(false);
  const [showSupportChat, setShowSupportChat] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [orderText, setOrderText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const { language, setLanguage, isChangingLanguage } = useLanguage();
  const { speak, startListening, isListening } = useSpeech();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [randomTagline] = useState(() => getRandomTagline(language));

  // Check if user has selected a language before
  useEffect(() => {
    const storedLanguage = localStorage.getItem('preferredLanguage');
    if (!storedLanguage) {
      setShowLanguageModal(true);
    }
  }, []);

  // Fetch low stock items for alerts
  const { data: lowStockItems } = useQuery<InventoryItem[]>({
    queryKey: ['/api/inventory/low-stock'],
  });

  const lowStockCount = lowStockItems?.length || 0;

  // Voice Order Functions
  const handleVoiceOrder = () => {
    setShowVoiceOrderModal(true);
    setOrderText('');
  };

  const startRecording = () => {
    setIsRecording(true);
    const voiceLanguage = language === 'hi' ? 'hi-IN' : 
                          language === 'bn' ? 'bn-IN' :
                          language === 'mr' ? 'mr-IN' :
                          language === 'ta' ? 'ta-IN' :
                          language === 'te' ? 'te-IN' : 'en-US';
    
    startListening(voiceLanguage).then((transcript: string | null) => {
      if (!transcript) return;
      setOrderText(transcript);
      setIsRecording(false);
      
      // Voice confirmation
      const message = language === 'hi' ? 
        `आपका ऑर्डर: ${transcript}` : 
        `Your order: ${transcript}`;
      speak(message, voiceLanguage);
    }).catch(() => {
      setIsRecording(false);
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' ? 'आवाज़ नहीं सुनाई दी' : 'Could not hear your voice',
        variant: 'destructive',
      });
    });
  };

  const confirmOrder = () => {
    if (!orderText.trim()) {
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' ? 'कृपया पहले ऑर्डर बोलें' : 'Please speak your order first',
        variant: 'destructive',
      });
      return;
    }

    // Store order (for now just show success)
    toast({
      title: language === 'hi' ? 'सफल!' : 'Success!',
      description: language === 'hi' ? 'ऑर्डर सफलतापूर्वक दर्ज किया गया' : 'Order placed successfully!',
    });
    
    setShowVoiceOrderModal(false);
    setOrderText('');
  };

  const reRecord = () => {
    setOrderText('');
    startRecording();
  };

  const quickActions = [
    {
      icon: Mic,
      label: getTranslation(language, 'quickActions.voiceOrder'),
      sublabel: getTranslation(language, 'quickActions.voiceOrderEn'),
      color: 'bg-red-100 text-red-600',
      action: handleVoiceOrder,
    },
    {
      icon: MapPin,
      label: getTranslation(language, 'quickActions.nearby'),
      sublabel: getTranslation(language, 'quickActions.nearbyEn'),
      color: 'bg-purple-100 text-purple-600',
      action: () => navigate('/nearby-sellers'),
    },
    {
      icon: Calculator,
      label: getTranslation(language, 'quickActions.calculator'),
      sublabel: getTranslation(language, 'quickActions.calculatorEn'),
      color: 'bg-yellow-100 text-yellow-600',
      action: () => setShowCalculator(true),
    },
    {
      icon: HelpCircle,
      label: getTranslation(language, 'quickActions.help'),
      sublabel: getTranslation(language, 'quickActions.helpEn'),
      color: 'bg-blue-100 text-blue-600',
      action: () => {
        const whatsappNumber = '919958262272'; // WhatsApp support number
        const message = language === 'hi' ? 
          'नमस्ते! मुझे अपना ठेला ऐप में मदद चाहिए।' :
          language === 'bn' ?
          'নমস্কার! আমার আপনা ঠেলা অ্যাপে সাহায্য দরকার।' :
          language === 'mr' ?
          'नमस्कार! मला अपना ठेला अॅपमध्ये मदत हवी.' :
          language === 'ta' ?
          'வணக்கம்! எனக்கு அப்னா தெலா ஆப்பில் உதவி தேவை.' :
          language === 'te' ?
          'నమస్కారం! నాకు అప్నా తెలా యాప్‌లో సహాయం కావాలి.' :
          'Hello! I need help with Apna Thela app.';
        
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        
        toast({
          title: language === 'hi' ? 'WhatsApp खुल रहा है' : 'Opening WhatsApp',
          description: language === 'hi' ? 'सहायता के लिए WhatsApp पर जाएं' : 'Redirecting to WhatsApp for support',
        });
      },
    },
  ];

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      {/* Global Loading Overlay */}
      {isChangingLanguage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center max-w-sm mx-4">
            <div className="w-16 h-16 border-4 border-saffron-200 border-t-saffron-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-800 mb-2">
              {language === 'hi' ? 'भाषा बदली जा रही है...' :
               language === 'bn' ? 'ভাষা পরিবর্তন হচ্ছে...' :
               'Changing language...'}
            </p>
            <p className="text-sm text-gray-600">
              {language === 'hi' ? 'सभी टेक्स्ट अपडेट हो रहा है' :
               language === 'bn' ? 'সমস্ত টেক্সট আপডেট হচ্ছে' :
               'All text is being updated'}
            </p>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="bg-saffron text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
              <img src={ApnaThelaLogo} alt="Apna Thela" className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">{getTranslation(language, 'app.title')}</h1>
              <p className="text-sm opacity-90">{getTranslation(language, 'app.subtitle')}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white hover:bg-opacity-20"
            onClick={() => setShowLanguageModal(true)}
          >
            <Globe className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="p-4">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {language === 'hi' ? 'नमस्ते!' : 
             language === 'bn' ? 'নমস্কার!' : 
             language === 'mr' ? 'नमस्कार!' :
             language === 'ta' ? 'வணக்கம்!' :
             language === 'te' ? 'నమస్కారం!' :
             'Namaste!'}
          </h2>
          <div className="flex items-center justify-center mb-2">
            <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-saffron-400 to-saffron-600"></div>
            <p className="text-lg font-semibold text-saffron-600 mx-4">
              {language === 'hi' ? 'अपना ठेला, अपनी दुकान, अपना ऐप' :
               language === 'bn' ? 'আপনার ঠেলা, আপনার দোকান, আপনার অ্যাপ' :
               language === 'mr' ? 'आपला ठेला, आपले दुकान, आपला अॅप' :
               language === 'ta' ? 'உங்கள் தெலா, উங்கল் கடை, உங்கள் ஆப்' :
               language === 'te' ? 'మీ తెలా, మీ దుకాణం, మీ యాప్' :
               'Apna Thela, Apni Dukaan, Apna App'}
            </p>
            <div className="flex-1 h-0.5 bg-gradient-to-l from-transparent via-saffron-400 to-saffron-600"></div>
          </div>
          
          {/* Random Tagline */}
          <div className="text-center mt-3">
            <p className="text-sm font-medium text-saffron-700 italic">
              {randomTagline}
            </p>
          </div>
        </div>

        {/* Voice Selection Card */}
        <Card className="mb-4">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-3">
              <Volume2 className="w-5 h-5 mr-2 text-saffron" />
              <h3 className="font-semibold">
                {language === 'hi' ? 'आवाज़ से अपनी भाषा चुनें' : 
                 language === 'bn' ? 'ভয়েস দিয়ে ভাষা চুনুন' : 
                 'Choose Language by Voice'}
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {language === 'hi' ? 'माइक दबाएं और अपनी भाषा बोलें' :
               language === 'bn' ? 'মাইক টিপুন এবং আপনার ভাষা বলুন' :
               'Press the mic and speak your language'}
            </p>
            
            <VoiceInputButton 
              size="lg"
              onLanguageDetected={(detectedLang: string) => {
                console.log('Language detected:', detectedLang);
                setLanguage(detectedLang as 'hi' | 'en' | 'bn' | 'mr' | 'ta' | 'te');
                
                // Show confirmation toast with language name
                const langNames = {
                  hi: 'हिंदी चुनी गई - पूरा ऐप हिंदी में बदल गया',
                  en: 'English selected - Entire app switched to English',
                  bn: 'বাংলা নির্বাচিত - সম্পূর্ণ অ্যাপ বাংলায় পরিবর্তিত',
                  mr: 'मराठी निवडली - संपूर्ण अॅप मराठीत बदलले',
                  ta: 'தமிழ் தேர்ந்தெடுக்கப்பட்டது - முழு ஆப்பும் தமிழில் மாற்றப்பட்டது',
                  te: 'తెలుగు ఎంపిక చేయబడింది - మొత్తం యాప్ తెలుగులోకి మార్చబడింది'
                };
                
                toast({
                  title: langNames[detectedLang as keyof typeof langNames] || 'Language changed',
                  duration: 3000,
                });
              }}
            />
          </CardContent>
        </Card>
      </section>

      {/* Main Features */}
      <section className="p-4 space-y-4">
        <h3 className="text-lg font-bold text-gray-800">{getTranslation(language, 'features.title')}</h3>
        
        {/* Buy Ingredients */}
        <Card className="border-2 border-orange-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mr-3">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{getTranslation(language, 'features.buyIngredients.title')}</h4>
                  <p className="text-sm text-gray-600">{getTranslation(language, 'features.buyIngredients.subtitle')}</p>
                </div>
              </div>
            </div>
            <p className="text-gray-700 mb-3">{getTranslation(language, 'features.buyIngredients.description')}</p>
            <Button 
              onClick={() => navigate('/buy-ingredients')}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {getTranslation(language, 'features.buyIngredients.title')}
            </Button>
          </CardContent>
        </Card>

        {/* Compare Prices */}
        <Card className="border-2 border-blue-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                  📊
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">
                    {language === 'hi' ? 'मूल्य तुलना' : 'Compare Suppliers'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {language === 'hi' ? 'सबसे अच्छे दाम खोजें' : 'Find best deals'}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-700 mb-3">
              {language === 'hi' 
                ? 'कई आपूर्तिकर्ताओं से कच्चे माल की कीमतों की तुलना करें'
                : 'Compare raw material prices from multiple suppliers'}
            </p>
            <Button 
              onClick={() => navigate('/compare-prices')}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              📊
              {language === 'hi' ? 'मूल्य तुलना' : 'Compare Prices'}
            </Button>
          </CardContent>
        </Card>

        {/* Manage Inventory */}
        <Card className="border-2 border-green-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-3">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 flex items-center">
                    {getTranslation(language, 'features.inventory.title')}
                    {lowStockCount > 0 && (
                      <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                        {lowStockCount} alerts
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600">{getTranslation(language, 'features.inventory.subtitle')}</p>
                </div>
              </div>
            </div>
            <p className="text-gray-700 mb-3">{getTranslation(language, 'features.inventory.description')}</p>
            <Button 
              onClick={() => navigate('/inventory')}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <Package className="w-4 h-4 mr-2" />
              {getTranslation(language, 'features.inventory.title')}
            </Button>
          </CardContent>
        </Card>

        {/* Wallet */}
        <Card className="border-2 border-blue-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">
                    {language === 'hi' ? 'वॉलेट और भुगतान' : 
                     language === 'bn' ? 'ওয়ালেট এবং পেমেন্ট' : 
                     language === 'mr' ? 'वॉलेट आणि पेमेंट' : 
                     language === 'ta' ? 'பணப்பை மற்றும் பணம்' : 
                     language === 'te' ? 'వాలెట్ మరియు చెల్లింపు' : 
                     'Wallet & Payments'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {language === 'hi' ? 'डिजिटल वॉलेट' : 
                     language === 'bn' ? 'ডিজিটাল ওয়ালেট' : 
                     language === 'mr' ? 'डिजिटल वॉलेट' : 
                     language === 'ta' ? 'டিஜிட்டல் வாலெட்' : 
                     language === 'te' ? 'డిజిటల్ వాలెట్' : 
                     'Digital Wallet'}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-700 mb-3">
              {language === 'hi' ? 'खर्च ट्रैक करें और UPI से भुगतान करें' : 
               language === 'bn' ? 'খরচ ট্র্যাক করুন এবং UPI দিয়ে পেমেন্ট করুন' : 
               language === 'mr' ? 'खर्च ट्रॅक करा आणि UPI ने पेमेंट करा' : 
               language === 'ta' ? 'செலவுகளைக் கண்காণித்து UPI மூলம் பணம் செলুত্tu' : 
               language === 'te' ? 'ఖర్చులను ట్రాక్ చేయండి మరియు UPI తో చెల్లించండి' : 
               'Track expenses and pay with UPI'}
            </p>
            <Button 
              onClick={() => navigate('/wallet')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Wallet className="w-4 h-4 mr-2" />
              {language === 'hi' ? 'वॉलेट खोलें' : 
               language === 'bn' ? 'ওয়ালেট খুলুন' : 
               language === 'mr' ? 'वॉलेट उघडा' : 
               language === 'ta' ? 'வாலெট்டைத் திறக்கவும்' : 
               language === 'te' ? 'వాలెట్ తెరవండి' : 
               'Open Wallet'}
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Quick Actions */}
      <section className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{getTranslation(language, 'quickActions.title')}</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.action}
              variant="outline"
              className="bg-white border border-gray-300 text-gray-800 h-auto py-4 px-3 hover:shadow-lg hover:border-gray-400 transition-all rounded-lg"
            >
              <div className="text-center">
                <action.icon className={`w-6 h-6 mb-2 mx-auto ${
                  index === 0 ? 'text-red-600' :      // Voice Order - Red
                  index === 1 ? 'text-purple-600' :   // Nearby Sellers - Purple  
                  index === 2 ? 'text-orange-600' :   // Calculator - Orange
                  'text-blue-600'                     // Help - Blue
                }`} />
                <div className="font-semibold text-sm text-gray-900">{action.label}</div>
                <div className="text-xs text-gray-600">{action.sublabel}</div>
              </div>
            </Button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="text-center py-2 px-4">
        <p className="text-xs text-gray-400">Built by Raj @2025</p>
      </div>

      {/* Bottom padding for navigation */}
      <div className="h-20"></div>

      {/* Language Selection Modal */}
      <LanguageModal 
        open={showLanguageModal} 
        onClose={() => setShowLanguageModal(false)} 
      />

      {/* Language Loading Overlay */}
      <LanguageLoadingOverlay />

      {/* Voice Order Modal */}
      <Dialog open={showVoiceOrderModal} onOpenChange={setShowVoiceOrderModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {language === 'hi' ? '🎙️ आवाज़ से ऑर्डर दें' : 
               language === 'bn' ? '🎙️ ভয়েস অর্ডার দিন' : 
               language === 'mr' ? '🎙️ आवाजातून ऑर्डर द्या' : 
               language === 'ta' ? '🎙️ குரல் ஆர்டர் கொடுக்கவும்' : 
               language === 'te' ? '🎙️ వాయిస్ ఆర్డర్ ఇవ్వండి' : 
               '🎙️ Voice Order'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Recording Button */}
            <div className="text-center">
              <Button
                onClick={startRecording}
                disabled={isRecording || isListening}
                className={`w-24 h-24 rounded-full ${
                  isRecording ? 'bg-red-600 animate-pulse' : 'bg-red-500 hover:bg-red-600'
                } text-white`}
              >
                <Mic className={`w-8 h-8 ${isRecording ? 'animate-pulse' : ''}`} />
              </Button>
              <p className="mt-3 text-sm text-gray-600">
                {isRecording ? 
                  (language === 'hi' ? 'सुन रहा हूं...' : 'Listening...') :
                  (language === 'hi' ? 'माइक दबाएं और बोलें' : 'Press mic and speak')
                }
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {language === 'hi' ? 
                  'जैसे: "5 किलो टमाटर, 2 किलो आलू"' : 
                  'Example: "5 kilo tomato, 2 kilo potato"'}
              </p>
            </div>

            {/* Order Text Display */}
            {orderText && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">
                  {language === 'hi' ? 'आपका ऑर्डर:' : 'Your Order:'}
                </h4>
                <p className="text-gray-900 bg-white p-3 rounded border">
                  {orderText}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowVoiceOrderModal(false)}
                className="flex-1"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </Button>
              
              {orderText && (
                <>
                  <Button 
                    onClick={reRecord}
                    variant="outline"
                    className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {language === 'hi' ? 'दोबारा बोलें' : 'Re-record'}
                  </Button>
                  
                  <Button 
                    onClick={confirmOrder}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {language === 'hi' ? 'पुष्टि करें' : 'Confirm'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Support Chat */}
      <SupportChat 
        open={showSupportChat} 
        onClose={() => setShowSupportChat(false)} 
      />

      {/* Calculator Modal */}
      <CalculatorModal
        open={showCalculator}
        onOpenChange={setShowCalculator}
      />

      {/* Floating Help Button */}
      <FloatingHelpButton />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}