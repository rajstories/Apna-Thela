import { useState, useEffect } from 'react';
import { type Language } from '@/lib/i18n';

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>('hi');
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  useEffect(() => {
    const storedLanguage = localStorage.getItem('preferredLanguage') as Language;
    if (storedLanguage && ['hi', 'en', 'bn', 'mr', 'ta', 'te'].includes(storedLanguage)) {
      setLanguageState(storedLanguage);
    }
  }, []);

  // Listen for external language changes (from voice selector)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'preferredLanguage' && e.newValue) {
        const newLang = e.newValue as Language;
        if (['hi', 'en', 'bn', 'mr', 'ta', 'te'].includes(newLang)) {
          setLanguageState(newLang);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setLanguage = async (newLanguage: Language) => {
    setIsChangingLanguage(true);
    
    // Immediate update for voice detection
    setLanguageState(newLanguage);
    localStorage.setItem('preferredLanguage', newLanguage);
    
    // Force re-render of all components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'preferredLanguage',
      newValue: newLanguage,
      oldValue: language,
    }));
    
    // Show loading state for better user feedback (shorter for voice)
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsChangingLanguage(false);
  };

  return { language, setLanguage, isChangingLanguage };
}
