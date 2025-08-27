import { useState, useCallback, useEffect } from 'react';
import { speechService } from '@/lib/speech';
import { useToast } from '@/hooks/use-toast';

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const support = speechService.isSupported();
    setIsSupported(support.recognition && support.synthesis);
  }, []);

  const startListening = useCallback(async (language: string = 'hi'): Promise<string | null> => {
    if (!isSupported) {
      toast({
        title: "Speech not supported",
        description: "Your browser doesn't support speech recognition",
        variant: "destructive",
      });
      return null;
    }

    setIsListening(true);
    
    try {
      const transcript = await speechService.startListening(language);
      return transcript;
    } catch (error) {
      toast({
        title: "Speech recognition error",
        description: error instanceof Error ? error.message : "Failed to recognize speech",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsListening(false);
    }
  }, [isSupported, toast]);

  const speak = useCallback(async (text: string, language: string = 'hi'): Promise<void> => {
    if (!isSupported) {
      return;
    }

    try {
      await speechService.speak(text, language);
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  }, [isSupported]);

  const detectLanguage = useCallback((transcript: string): string => {
    return speechService.detectLanguageFromSpeech(transcript);
  }, []);

  return {
    isListening,
    isSupported,
    startListening,
    speak,
    detectLanguage,
  };
}
