import { useLanguage } from '@/hooks/use-language';
import { getTranslation } from '@/lib/i18n';

export function LanguageLoadingOverlay() {
  const { isChangingLanguage, language } = useLanguage();

  if (!isChangingLanguage) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center shadow-2xl">
        <div className="w-16 h-16 border-4 border-saffron-200 border-t-saffron-600 rounded-full animate-spin mx-auto mb-6"></div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-3">
          {language === 'hi' ? 'भाषा बदली जा रही है' :
           language === 'bn' ? 'ভাষা পরিবর্তন হচ্ছে' :
           language === 'mr' ? 'भाषा बदलली जात आहे' :
           language === 'ta' ? 'மொழி மாற்றப்படுகிறது' :
           language === 'te' ? 'భాష మార్చబడుతోంది' :
           'Changing Language'}
        </h3>
        
        <p className="text-gray-600 mb-4">
          {language === 'hi' ? 'कृपया प्रतीक्षा करें...' :
           language === 'bn' ? 'অপেক্ষা করুন...' :
           language === 'mr' ? 'कृपया प्रतीक्षा करा...' :
           language === 'ta' ? 'தயவுசெய்து காத்திருங்கள்...' :
           language === 'te' ? 'దయచేసి వేచి ఉండండి...' :
           'Please wait...'}
        </p>
        
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-saffron-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-saffron-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-saffron-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}