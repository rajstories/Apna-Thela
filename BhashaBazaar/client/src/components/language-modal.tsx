import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSpeech } from '@/hooks/use-speech';
import { useLanguage } from '@/hooks/use-language';
import { getTranslation, type Language } from '@/lib/i18n';
import { Mic, Globe } from 'lucide-react';

interface LanguageModalProps {
  open: boolean;
  onClose: () => void;
}

export function LanguageModal({ open, onClose }: LanguageModalProps) {
  const { language, setLanguage, isChangingLanguage } = useLanguage();
  const { isListening, startListening, speak, detectLanguage } = useSpeech();
  const [showListening, setShowListening] = useState(false);

  const languages = [
    { code: 'hi' as Language, name: 'हिंदी (Hindi)', flag: '🇮🇳' },
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
    { code: 'bn' as Language, name: 'বাংলা (Bengali)', flag: '🇧🇩' },
    { code: 'mr' as Language, name: 'मराठी (Marathi)', flag: '🇮🇳' },
    { code: 'ta' as Language, name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
    { code: 'te' as Language, name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
  ];

  const handleLanguageSelect = async (selectedLanguage: Language) => {
    await setLanguage(selectedLanguage);
    
    // Speak confirmation
    const confirmationMessages = {
      hi: 'हिंदी चुनी गई है',
      en: 'English selected',
      bn: 'বাংলা নির্বাচিত',
      mr: 'मराठी निवडली आहे',
      ta: 'தமிழ் தேர்ந்தெடுக்கப்பட்டது',
      te: 'తెలుగు ఎంచుకోబడింది',
    };
    
    await speak(confirmationMessages[selectedLanguage], selectedLanguage);
    onClose();
  };

  const handleVoiceSelection = async () => {
    setShowListening(true);
    
    try {
      const transcript = await startListening();
      if (transcript) {
        const detectedLanguage = detectLanguage(transcript) as Language;
        await handleLanguageSelect(detectedLanguage);
      }
    } catch (error) {
      console.error('Voice selection error:', error);
    } finally {
      setShowListening(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-saffron rounded-full flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {getTranslation(language, 'modal.title')}
          </h2>
          <p className="text-gray-600">
            {getTranslation(language, 'modal.subtitle')}
          </p>
        </div>

        {(isListening || showListening) && (
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <p className="text-sm text-gray-600">
              {getTranslation(language, 'modal.listeningText')}
            </p>
          </div>
        )}

        {/* Voice Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-700 text-center mb-2">
            {getTranslation(language, 'modal.voiceInstructions')}
          </p>
          <p className="text-xs text-gray-500 text-center">
            {getTranslation(language, 'modal.automaticDetection')}
          </p>
        </div>

        <Button 
          onClick={handleVoiceSelection} 
          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white mb-6 h-14 text-lg font-semibold shadow-lg"
          disabled={isListening || showListening}
        >
          <Mic className="w-6 h-6 mr-3" />
          {getTranslation(language, 'modal.voiceButton')}
        </Button>

        <div className="text-center mb-4">
          <span className="text-sm text-gray-500">या / or / অথবা</span>
        </div>

        {isChangingLanguage ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-saffron-200 border-t-saffron-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-800 mb-2">
              {language === 'hi' ? 'भाषा बदली जा रही है...' :
               language === 'bn' ? 'ভাষা পরিবর্তন হচ্ছে...' :
               language === 'mr' ? 'भाषा बदलली जात आहे...' :
               language === 'ta' ? 'மொழி மாற்றப்படுகிறது...' :
               language === 'te' ? 'భాష మార్చబడుతోంది...' :
               'Changing language...'}
            </p>
            <p className="text-sm text-gray-600">
              {language === 'hi' ? 'कृपया प्रतीक्षा करें' :
               language === 'bn' ? 'অপেক্ষা করুন' :
               language === 'mr' ? 'कृपया प्रतीक्षा करा' :
               language === 'ta' ? 'தயவுசெய்து காத்திருங்கள்' :
               language === 'te' ? 'దయచేసి వేచి ఉండండి' :
               'Please wait'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant="outline"
                className="w-full p-4 h-auto justify-start hover:bg-gray-50 border-2"
                onClick={() => handleLanguageSelect(lang.code)}
                disabled={isChangingLanguage}
              >
                <span className="text-2xl mr-3">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
              </Button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
