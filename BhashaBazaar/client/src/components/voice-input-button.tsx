import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSpeech } from '@/hooks/use-speech';
import { useLanguage } from '@/hooks/use-language';
import { getTranslation } from '@/lib/i18n';
import { Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceInputButtonProps {
  onLanguageDetected?: (language: string) => void;
  onTranscript?: (transcript: string) => void;
  isActive?: boolean;
  onActiveChange?: (active: boolean) => void;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  children?: React.ReactNode;
}

export function VoiceInputButton({ 
  onLanguageDetected,
  onTranscript,
  isActive,
  onActiveChange,
  className = '',
  size = 'default',
  children
}: VoiceInputButtonProps) {
  const { language, setLanguage } = useLanguage();
  const { isListening, startListening, speak, detectLanguage, isSupported } = useSpeech();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVoiceInput = async () => {
    console.log('Voice button clicked!', { isSupported, isListening, isProcessing });
    
    if (!isSupported) {
      console.log('Voice not supported, showing toast');
      toast({
        title: getTranslation(language, 'common.error'),
        description: "Your device doesn't support voice input. Please try in Chrome or Safari.",
        variant: "destructive",
      });
      return;
    }

    if (onActiveChange) {
      onActiveChange(true);
    }

    setIsProcessing(true);
    
    try {
      // If onTranscript is provided, this is for number/text input
      if (onTranscript) {
        const result = await startListening(language);
        if (result && result.trim().length > 0) {
          onTranscript(result);
          toast({
            title: getTranslation(language, 'common.ok'),
            description: `Heard: ${result}`,
          });
        } else {
          toast({
            title: getTranslation(language, 'common.error'),
            description: "Could not detect speech. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        // Start with user's current language, then try others
        const primaryLang = language === 'hi' ? 'hi-IN' : language === 'en' ? 'en-US' : 'hi-IN';
        const allLanguages = ['hi-IN', 'en-US', 'bn-BD', 'mr-IN', 'ta-IN', 'te-IN'];
        
        let detectedText = '';
        let detectedLang = language;

        try {
          // Try with English first for better English detection
          const result = await startListening('en');
          if (result && result.trim().length > 0) {
            detectedText = result;
            const detected = detectLanguage(detectedText);
            console.log(`Detected text: "${detectedText}", Language: ${detected}`);
            
            if (['hi', 'en', 'bn', 'mr', 'ta', 'te'].includes(detected)) {
              detectedLang = detected as 'hi' | 'en' | 'bn' | 'mr' | 'ta' | 'te';
            }
          }
        } catch (error) {
          console.log(`Voice detection failed with English, trying Hindi:`, error);
          // Fallback to Hindi if English fails
          try {
            const result = await startListening('hi');
            if (result && result.trim().length > 0) {
              detectedText = result;
              const detected = detectLanguage(detectedText);
              console.log(`Detected text (Hindi fallback): "${detectedText}", Language: ${detected}`);
              
              if (['hi', 'en', 'bn', 'mr', 'ta', 'te'].includes(detected)) {
                detectedLang = detected as 'hi' | 'en' | 'bn' | 'mr' | 'ta' | 'te';
              }
            }
          } catch (fallbackError) {
            console.log(`Voice detection failed completely:`, fallbackError);
          }
        }

        if (detectedText && detectedText.trim().length > 0) {
          // Automatically switch entire app language
          setLanguage(detectedLang as 'hi' | 'en' | 'bn' | 'mr' | 'ta' | 'te');
          
          // Force immediate re-render by triggering storage event
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'preferredLanguage',
            newValue: detectedLang,
            oldValue: language,
          }));
          
          const confirmationMessages = {
            hi: `हिंदी चुनी गई - "${detectedText}"`,
            en: `English selected - "${detectedText}"`,
            bn: `বাংলা নির্বাচিত - "${detectedText}"`,
            mr: `मराठी निवडली आहे - "${detectedText}"`,
            ta: `தமிழ் தேர্ন্তெদুক্কপ্পাত্तুদু - "${detectedText}"`,
            te: `తెలుగు ఎంచుకోబడింది - "${detectedText}"`,
          };
          
          // Small delay before speaking to ensure language switch is complete
          setTimeout(async () => {
            await speak(confirmationMessages[detectedLang as keyof typeof confirmationMessages], detectedLang);
          }, 300);
          
          if (onLanguageDetected) {
            onLanguageDetected(detectedLang);
          }

          toast({
            title: getTranslation(detectedLang as 'hi' | 'en' | 'bn' | 'mr' | 'ta' | 'te', 'common.ok'),
            description: detectedLang === 'hi' ? 'पूरा ऐप हिंदी में बदल गया' :
                        detectedLang === 'bn' ? 'সম্পূর্ণ অ্যাপ বাংলায় পরিবর্তিত' :
                        detectedLang === 'mr' ? 'संपूर्ण अॅप मराठीत बदलले' :
                        detectedLang === 'ta' ? 'முழு பயன்பாடும் தமிழில் மாற்றப்பட்டது' :
                        detectedLang === 'te' ? 'మొత్తం యాప్ తెలుగులోకి మార్చబడింది' :
                        'Entire app switched to English',
          });
        } else {
          toast({
            title: getTranslation(language, 'common.error'),
            description: "Could not detect speech. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: getTranslation(language, 'common.error'),
        description: "Voice detection failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      if (onActiveChange) {
        onActiveChange(false);
      }
    }
  };

  const buttonSizes = {
    sm: 'h-10 w-10',
    default: 'h-14 w-14',
    lg: 'h-20 w-20'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  // If children provided, use custom rendering
  if (children) {
    return (
      <Button
        onClick={handleVoiceInput}
        disabled={isListening || isProcessing}
        className={className}
        variant="outline"
      >
        {children}
      </Button>
    );
  }

  // Default rendering for round voice button
  return (
    <Button
      onClick={handleVoiceInput}
      disabled={isListening || isProcessing}
      className={`${buttonSizes[size]} rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-4 border-white shadow-lg transition-all duration-300 cursor-pointer ${
        (isListening || isProcessing || (isActive && onActiveChange)) ? 'animate-pulse scale-110' : 'scale-100'
      } ${className}`}
      variant="default"
    >
      {isListening || isProcessing || (isActive && onActiveChange) ? (
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
          <MicOff className={iconSizes[size]} />
        </div>
      ) : (
        <Mic className={iconSizes[size]} />
      )}
    </Button>
  );
}