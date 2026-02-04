import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SupportChat } from '@/components/support-chat';
import { useLanguage } from '@/hooks/use-language';
import { getTranslation } from '@/lib/i18n';
import { Play, Square, MessageCircle, Globe, Volume2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  const { language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);
  const [currentCaption, setCurrentCaption] = useState('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [showSupportChat, setShowSupportChat] = useState(false);

  // Load available voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Filter voices for current language
      const languageVoices = voices.filter(voice => 
        voice.lang.startsWith(language) || 
        (language === 'hi' && voice.lang.includes('hi')) ||
        (language === 'bn' && voice.lang.includes('bn')) ||
        (language === 'mr' && voice.lang.includes('mr')) ||
        (language === 'ta' && voice.lang.includes('ta')) ||
        (language === 'te' && voice.lang.includes('te')) ||
        (language === 'en' && voice.lang.includes('en'))
      );
      
      // Auto-select best voice if none selected
      if (!selectedVoice && languageVoices.length > 0) {
        setSelectedVoice(languageVoices[0]);
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [language, selectedVoice]);

  const languages = [
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  ];

  const getVoiceGuideText = (lang: string): string[] => {
    const guides = {
      hi: [
        'नमस्ते! अपना ठेला ऐप में आपका स्वागत है।',
        'यह ऐप आपके व्यापार को आसान बनाने के लिए बना है।',
        'सामान खरीदने के लिए कार्ट बटन दबाएं।',
        'अपना स्टॉक देखने के लिए पैकेज बटन दबाएं।',
        'आवाज़ से काम करने के लिए माइक बटन दबाएं।',
        'कोई समस्या हो तो हेल्प बटन दबाएं।'
      ],
      en: [
        'Welcome to Apna Thela app!',
        'This app is designed to make your business easier.',
        'Press the cart button to buy ingredients.',
        'Press the package button to view your stock.',
        'Press the mic button to use voice commands.',
        'Press the help button if you need assistance.'
      ],
      bn: [
        'অপনা ঠেলা অ্যাপে স্বাগতম!',
        'এই অ্যাপটি আপনার ব্যবসা সহজ করতে তৈরি।',
        'সামগ্রী কিনতে কার্ট বোতাম চাপুন।',
        'আপনার স্টক দেখতে প্যাকেজ বোতাম চাপুন।',
        'ভয়েস কমান্ড ব্যবহার করতে মাইক বোতাম চাপুন।',
        'সাহায্য প্রয়োজন হলে হেল্প বোতাম চাপুন।'
      ],
      mr: [
        'अपना ठेला अॅपमध्ये आपले स्वागत आहे!',
        'हे अॅप तुमचा व्यवसाय सोपा करण्यासाठी बनवले आहे।',
        'साहित्य खरेदी करण्यासाठी कार्ट बटण दाबा।',
        'तुमचा साठा पाहण्यासाठी पॅकेज बटण दाबा।',
        'आवाज कमांड वापरण्यासाठी मायक बटण दाबा।',
        'मदत हवी असल्यास हेल्प बटण दाबा।'
      ],
      ta: [
        'அப்னா தெலா அப்ளிக்கேஷனுக்கு வரவேற்கிறோம்!',
        'இந்த அப்ளிக்கேஷன் உங்கள் வணிகத்தை எளிதாக்க வடிவமைக்கப்பட்டுள்ளது।',
        'பொருட்கள் வாங்க கார்ட் பட்டனை அழுத்தவும்।',
        'உங்கள் இருப்பு பார்க்க பேக்கேஜ் பட்டனை அழுத்தவும்।',
        'குரல் கட்டளைகள் பயன்படுத்த மைக் பட்டனை அழுத்தவும்।',
        'உதவி தேவைப்பட்டால் ஹெல்ப் பட்டனை அழுத்தவும்।'
      ],
      te: [
        'అప్నా తెలా యాప్‌కు స్వాగతం!',
        'ఈ యాప్ మీ వ్యాపారాన్ని సులభతరం చేయడానికి రూపొందించబడింది।',
        'వస్తువులు కొనడానికి కార్ట్ బటన్ నొక్కండి।',
        'మీ స్టాక్ చూడడానికి ప్యాకేజ్ బటన్ నొక్కండి।',
        'వాయిస్ కమాండ్‌లు ఉపయోగించడానికి మైక్ బటన్ నొక్కండి।',
        'సహాయం కావాలంటే హెల్ప్ బటన్ నొక్కండి।'
      ]
    };
    return guides[lang] || guides.en;
  };

  const testVoice = (voice: SpeechSynthesisVoice) => {
    const testText = {
      hi: 'नमस्ते! मैं आपकी मदद करूंगा।',
      en: 'Hello! I will help you.',
      bn: 'নমস্কার! আমি আপনাকে সাহায্য করব।',
      mr: 'नमस्कार! मी तुम्हाला मदत करेन।',
      ta: 'வணக்கம்! நான் உங்களுக்கு உதவுவேன்।',
      te: 'నమస్కారం! నేను మీకు సహాయం చేస్తాను।'
    }[language] || 'Hello! I will help you.';

    const utterance = new SpeechSynthesisUtterance(testText);
    utterance.voice = voice;
    utterance.rate = 0.8;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    window.speechSynthesis.speak(utterance);
  };

  const getLanguageVoices = () => {
    return availableVoices.filter(voice => {
      const lang = voice.lang.toLowerCase();
      const voiceName = voice.name.toLowerCase();
      
      switch(language) {
        case 'hi':
          return lang.includes('hi') || voiceName.includes('hindi') || voiceName.includes('हिन्दी');
        case 'bn': 
          return lang.includes('bn') || voiceName.includes('bengali') || voiceName.includes('বাংলা');
        case 'mr':
          return lang.includes('mr') || voiceName.includes('marathi') || voiceName.includes('मराठी');
        case 'ta':
          return lang.includes('ta') || voiceName.includes('tamil') || voiceName.includes('தமிழ்');
        case 'te':
          return lang.includes('te') || voiceName.includes('telugu') || voiceName.includes('తెలుగు');
        case 'en':
          return lang.includes('en') && (lang.includes('us') || lang.includes('in') || lang.includes('gb'));
        default:
          return lang.includes('en');
      }
    });
  };

  const handlePlayGuide = () => {
    if (!window.speechSynthesis) {
      toast({
        title: 'Voice not supported',
        description: 'Your browser does not support text-to-speech',
      });
      return;
    }

    if (!selectedVoice) {
      toast({
        title: 'No voice selected',
        description: 'Please select a voice first',
      });
      return;
    }

    setIsPlaying(true);
    const guideTexts = getVoiceGuideText(language);
    let currentIndex = 0;

    const speakNext = () => {
      if (currentIndex >= guideTexts.length) {
        setIsPlaying(false);
        setCurrentCaption('');
        toast({
          title: getTranslation(language, 'help.audio.completed'),
          description: getTranslation(language, 'help.audio.completedDesc'),
        });
        return;
      }

      const text = guideTexts[currentIndex];
      setCurrentCaption(text);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;
      utterance.rate = 0.7;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        currentIndex++;
        setTimeout(() => {
          if (isPlaying) speakNext();
        }, 1500);
      };

      utterance.onerror = (event) => {
        console.log('Speech error:', event.error);
        currentIndex++;
        if (isPlaying) speakNext();
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  const handleStopAudio = () => {
    setIsPlaying(false);
    setCurrentCaption('');
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const handleSendSupport = () => {
    if (!supportMessage.trim()) {
      // If no message, just open chat
      setShowSupportChat(true);
      return;
    }

    // Open support chat and pass the pre-filled message
    setShowSupportChat(true);
    // Note: We'll pass the message to the chat component
  };

  const quickActions = [
    {
      text: getTranslation(language, 'help.quickActions.inventory'),
      icon: '📦'
    },
    {
      text: getTranslation(language, 'help.quickActions.shop'),
      icon: '🛒'
    },
    {
      text: getTranslation(language, 'help.quickActions.voice'),
      icon: '🎤'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {getTranslation(language, 'help.title')}
          </DialogTitle>
          <DialogDescription className="text-center">
            {getTranslation(language, 'help.subtitle')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {getTranslation(language, 'help.title')}
          </h2>
          <p className="text-gray-600 text-sm">
            {getTranslation(language, 'help.subtitle')}
          </p>
        </div>

        {/* Language Selection */}
        <div className="mb-4">
          <Button
            variant="outline"
            className="w-full mb-3"
            onClick={() => setShowLanguageOptions(!showLanguageOptions)}
          >
            <Globe className="w-4 h-4 mr-2" />
            {getTranslation(language, 'help.language.title')}
          </Button>
          
          {showLanguageOptions && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant={language === lang.code ? "default" : "outline"}
                  className="text-xs p-2"
                  onClick={() => {
                    setLanguage(lang.code as any);
                    setShowLanguageOptions(false);
                  }}
                >
                  <span className="mr-1">{lang.flag}</span>
                  {lang.name}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Voice Selection */}
        <div className="mb-4">
          <Button
            variant="outline"
            className="w-full mb-3"
            onClick={() => setShowVoiceSelector(!showVoiceSelector)}
          >
            <Volume2 className="w-4 h-4 mr-2" />
            {selectedVoice ? 
              `Voice: ${selectedVoice.name.split(' ')[0]}` : 
              'Choose Voice'
            }
          </Button>
          
          {showVoiceSelector && (
            <div className="max-h-40 overflow-y-auto space-y-2 p-2 border rounded">
              {getLanguageVoices().map((voice, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{voice.name}</div>
                    <div className="text-xs text-gray-500">{voice.lang}</div>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testVoice(voice)}
                      className="text-xs px-2"
                    >
                      Test
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedVoice === voice ? "default" : "outline"}
                      onClick={() => {
                        setSelectedVoice(voice);
                        setShowVoiceSelector(false);
                      }}
                      className="text-xs px-2"
                    >
                      {selectedVoice === voice ? '✓' : 'Use'}
                    </Button>
                  </div>
                </div>
              ))}
              {getLanguageVoices().length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No voices available for {language}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Audio Guide */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Volume2 className="w-5 h-5 mr-2 text-green-600" />
              <div>
                <span className="font-semibold text-green-800 block">
                  {getTranslation(language, 'help.audio.title')}
                </span>
                <span className="text-xs text-green-600">
                  {language === 'hi' ? 'देसी आवाज़ में' :
                   language === 'bn' ? 'স্থানীয় কণ্ঠে' :
                   language === 'mr' ? 'मराठी आवाजात' :
                   language === 'ta' ? 'தமிழ் குரலில்' :
                   language === 'te' ? 'తెలుగు గొంతులో' :
                   'Native voice accent'}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant={isPlaying ? "secondary" : "default"}
                onClick={handlePlayGuide}
                disabled={isPlaying}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="w-4 h-4 mr-1" />
                {getTranslation(language, 'help.audio.play')}
              </Button>
              {isPlaying && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleStopAudio}
                >
                  <Square className="w-4 h-4 mr-1" />
                  {getTranslation(language, 'help.audio.stop')}
                </Button>
              )}
            </div>
          </div>
          
          {isPlaying && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-green-700">
                  {getTranslation(language, 'help.audio.playing')}
                </span>
              </div>
              
              {/* Live Captions */}
              {currentCaption && (
                <div className="bg-gray-800 text-white p-3 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 animate-pulse"></div>
                    <div>
                      <div className="text-xs text-green-300 mb-1">Live Caption:</div>
                      <div className="text-sm leading-relaxed">{currentCaption}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions Guide */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <span className="mr-2">⚡</span>
            {getTranslation(language, 'help.quickActions.title')}
          </h3>
          <div className="space-y-2">
            {quickActions.map((action, index) => (
              <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                <span className="text-lg mr-3">{action.icon}</span>
                <span className="text-sm text-gray-700">{action.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Support Chat */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <MessageCircle className="w-4 h-4 mr-2" />
            {getTranslation(language, 'help.support.title')}
          </h3>
          <Textarea
            placeholder={getTranslation(language, 'help.support.placeholder')}
            value={supportMessage}
            onChange={(e) => setSupportMessage(e.target.value)}
            className="mb-3"
            rows={3}
          />
          <Button
            onClick={handleSendSupport}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            {supportMessage.trim() ? 
              (language === 'hi' ? 'WhatsApp पर भेजें' : 'Send on WhatsApp') :
              (language === 'hi' ? 'सपोर्ट चैट खोलें' : 'Open Support Chat')
            }
          </Button>
        </div>
      </DialogContent>

      {/* Support Chat Modal */}
      <SupportChat 
        open={showSupportChat} 
        onClose={() => {
          setShowSupportChat(false);
          setSupportMessage(''); // Clear message when chat closes
        }}
        initialMessage={supportMessage}
      />
    </Dialog>
  );
}