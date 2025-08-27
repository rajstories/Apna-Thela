import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { usePWA } from '@/hooks/use-pwa';
import { useLanguage } from '@/hooks/use-language';
import { getTranslation } from '@/lib/i18n';

export function PWAInstallBanner() {
  const { isInstallable, isOffline, installApp, updateAvailable, reloadApp } = usePWA();
  const { language } = useLanguage();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if dismissed or not installable
  if (isDismissed || (!isInstallable && !isOffline && !updateAvailable)) {
    return null;
  }

  // Offline indicator
  if (isOffline) {
    return (
      <Card className="fixed top-4 left-4 right-4 z-50 border-yellow-200 bg-yellow-50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <WifiOff className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="font-medium text-yellow-800">
                  {language === 'hi' ? 'ऑफलाइन मोड' : 
                   language === 'bn' ? 'অফলাইন মোড' : 
                   language === 'mr' ? 'ऑफलाइन मोड' : 
                   language === 'ta' ? 'ஆஃப்லைன் பயன்முறை' : 
                   language === 'te' ? 'ఆఫ్‌లైన్ మోడ్' : 
                   'Offline Mode'}
                </div>
                <div className="text-sm text-yellow-600">
                  {language === 'hi' ? 'कुछ फीचर्स काम नहीं कर सकते' : 
                   language === 'bn' ? 'কিছু ফিচার কাজ নাও করতে পারে' : 
                   language === 'mr' ? 'काही वैशिष्ट्ये कार्य करू शकत नाहीत' : 
                   language === 'ta' ? 'சில அம்சங்கள் செயல்படாமல் போகலாம்' : 
                   language === 'te' ? 'కొన్ని ఫీచర్లు పని చేయకపోవచ్చు' : 
                   'Some features may not work'}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Update available banner
  if (updateAvailable) {
    return (
      <Card className="fixed top-4 left-4 right-4 z-50 border-blue-200 bg-blue-50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-800">
                  {language === 'hi' ? 'अपडेट उपलब्ध' : 
                   language === 'bn' ? 'আপডেট উপলব্ধ' : 
                   language === 'mr' ? 'अद्यतन उपलब्ध' : 
                   language === 'ta' ? 'புதுப்பிப்பு கிடைக்கிறது' : 
                   language === 'te' ? 'అప్‌డేట్ అందుబాటులో ఉంది' : 
                   'Update Available'}
                </div>
                <div className="text-sm text-blue-600">
                  {language === 'hi' ? 'नए फीचर्स पाने के लिए रीलोड करें' : 
                   language === 'bn' ? 'নতুন ফিচার পেতে রিলোড করুন' : 
                   language === 'mr' ? 'नवीन वैशिष्ट्ये मिळविण्यासाठी रीलोड करा' : 
                   language === 'ta' ? 'புதிய அம்சங்களைப் பெற மீண்டும் ஏற்றவும்' : 
                   language === 'te' ? 'కొత్త ఫీచర్లను పొందడానికి రీలోడ్ చేయండి' : 
                   'Reload to get new features'}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={reloadApp}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {language === 'hi' ? 'अपडेट' : 
                 language === 'bn' ? 'আপডেট' : 
                 language === 'mr' ? 'अद्यतन' : 
                 language === 'ta' ? 'புதுப்பி' : 
                 language === 'te' ? 'అప్‌డేట్' : 
                 'Update'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDismissed(true)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Install banner
  if (isInstallable) {
    return (
      <Card className="fixed top-4 left-4 right-4 z-50 border-orange-200 bg-orange-50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Download className="w-5 h-5 text-orange-600" />
              <div>
                <div className="font-medium text-orange-800">
                  {language === 'hi' ? 'ऐप इंस्टॉल करें' : 
                   language === 'bn' ? 'অ্যাপ ইনস্টল করুন' : 
                   language === 'mr' ? 'अॅप इन्स्टॉल करा' : 
                   language === 'ta' ? 'ஆப்ஸை நிறுவவும்' : 
                   language === 'te' ? 'యాప్‌ను ఇన్‌స్టాల్ చేయండి' : 
                   'Install App'}
                </div>
                <div className="text-sm text-orange-600">
                  {language === 'hi' ? 'ऑफलाइन भी इस्तेमाल कर सकेंगे' : 
                   language === 'bn' ? 'অফলাইনেও ব্যবহার করতে পারবেন' : 
                   language === 'mr' ? 'ऑफलाइन देखील वापरू शकाल' : 
                   language === 'ta' ? 'ஆஃப்லைனிலும் பயன்படுத்தலாம்' : 
                   language === 'te' ? 'ఆఫ్‌లైన్‌లో కూడా ఉపయోగించవచ్చు' : 
                   'Use offline too'}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={installApp}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {language === 'hi' ? 'इंस्टॉल' : 
                 language === 'bn' ? 'ইনস্টল' : 
                 language === 'mr' ? 'इन्स्टॉल' : 
                 language === 'ta' ? 'நிறுவு' : 
                 language === 'te' ? 'ఇన్‌స్టాల్' : 
                 'Install'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDismissed(true)}
                className="text-orange-600 hover:text-orange-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}