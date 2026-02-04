import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/hooks/use-language';
import { useSpeech } from '@/hooks/use-speech';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CreditCard } from 'lucide-react';
import type { CreditTracker } from '@shared/schema';

export function CreditTrackerComponent() {
  const { language } = useLanguage();
  const { speak, isSupported } = useSpeech();
  const { toast } = useToast();
  const [hasShownAlert, setHasShownAlert] = useState(false);

  const { data: creditData, isLoading } = useQuery<CreditTracker>({
    queryKey: ['/api/credit-tracker'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fallback to localStorage if offline
  const [localCreditData, setLocalCreditData] = useState<CreditTracker | null>(null);

  useEffect(() => {
    if (creditData) {
      // Save to localStorage for offline access
      localStorage.setItem('creditTracker', JSON.stringify(creditData));
      setLocalCreditData(creditData);
    } else {
      // Load from localStorage if data is not available
      const storedData = localStorage.getItem('creditTracker');
      if (storedData) {
        setLocalCreditData(JSON.parse(storedData));
      }
    }
  }, [creditData]);

  const activeData = creditData || localCreditData;

  useEffect(() => {
    if (activeData && !hasShownAlert) {
      const creditLimit = parseFloat(activeData.creditLimit);
      const creditUsed = parseFloat(activeData.creditUsed);
      const usagePercentage = (creditUsed / creditLimit) * 100;

      // Show alert when over 80% of credit is used
      if (usagePercentage >= 80) {
        setHasShownAlert(true);
        
        const alertMessage = language === 'hi' 
          ? `आप ₹${creditUsed.toFixed(0)} तक पहुंच गए हो, संभाल के!`
          : language === 'bn'
          ? `আপনি ₹${creditUsed.toFixed(0)} পর্যন্ত পৌঁছে গেছেন, সাবধান!`
          : language === 'mr'
          ? `तुम्ही ₹${creditUsed.toFixed(0)} पर्यंत पोहोचला आहात, सावध राहा!`
          : language === 'ta'
          ? `நீங்கள் ₹${creditUsed.toFixed(0)} வரை சென்றுவிட்டீர்கள், கவனமாக இருங்கள்!`
          : language === 'te'
          ? `మీరు ₹${creditUsed.toFixed(0)} వరకు చేరుకున్నారు, జాగ్రత్తగా ఉండండి!`
          : `You've reached ₹${creditUsed.toFixed(0)}, be careful!`;

        toast({
          title: '🔔 ' + (language === 'hi' ? 'चेतावनी' : 'Alert'),
          description: alertMessage,
          variant: 'destructive',
          duration: 5000,
        });

        // Voice alert
        if (isSupported) {
          speak(alertMessage);
        }

        // Reset alert flag after 1 hour
        setTimeout(() => setHasShownAlert(false), 3600000);
      }
    }
  }, [activeData, hasShownAlert, language, toast, speak, isSupported]);

  if (isLoading && !localCreditData) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-blue-200 rounded mb-2"></div>
            <div className="h-8 bg-blue-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activeData) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <p className="text-gray-500 text-center">
            {language === 'hi' ? 'उधार डेटा उपलब्ध नहीं' : 'Credit data not available'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const creditLimit = parseFloat(activeData.creditLimit);
  const creditUsed = parseFloat(activeData.creditUsed);
  const creditRemaining = creditLimit - creditUsed;
  const usagePercentage = (creditUsed / creditLimit) * 100;

  const getProgressColor = () => {
    if (usagePercentage >= 80) return 'bg-red-500';
    if (usagePercentage >= 60) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getTitle = () => {
    switch (language) {
      case 'hi': return 'उधार ट्रैकर';
      case 'bn': return 'ঋণ ট্র্যাকার';
      case 'mr': return 'उधार ट्रॅकर';
      case 'ta': return 'கடன் டிராக்கர்';
      case 'te': return 'రుణ ట్రాకర్';
      default: return 'Credit Tracker';
    }
  };

  const getUsageText = () => {
    switch (language) {
      case 'hi': return `₹${creditUsed.toFixed(0)} में से ₹${creditLimit.toFixed(0)} इस्तेमाल किया गया`;
      case 'bn': return `₹${creditLimit.toFixed(0)} এর মধ্যে ₹${creditUsed.toFixed(0)} ব্যবহার করা হয়েছে`;
      case 'mr': return `₹${creditLimit.toFixed(0)} पैकी ₹${creditUsed.toFixed(0)} वापरले`;
      case 'ta': return `₹${creditLimit.toFixed(0)} இல் ₹${creditUsed.toFixed(0)} பயன்படுத்தப்பட்டது`;
      case 'te': return `₹${creditLimit.toFixed(0)} లో ₹${creditUsed.toFixed(0)} ఉపయోగించారు`;
      default: return `₹${creditUsed.toFixed(0)} out of ₹${creditLimit.toFixed(0)} used`;
    }
  };

  const getRemainingText = () => {
    switch (language) {
      case 'hi': return `₹${creditRemaining.toFixed(0)} उधार बाकी है`;
      case 'bn': return `₹${creditRemaining.toFixed(0)} ঋণ বাকি আছে`;
      case 'mr': return `₹${creditRemaining.toFixed(0)} उधार शिल्लक आहे`;
      case 'ta': return `₹${creditRemaining.toFixed(0)} கடன் மீதம் உள்ளது`;
      case 'te': return `₹${creditRemaining.toFixed(0)} రుణం మిగిలి ఉంది`;
      default: return `₹${creditRemaining.toFixed(0)} credit remaining`;
    }
  };

  return (
    <>
      {/* High usage alert banner */}
      {usagePercentage >= 80 && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            🔔 {language === 'hi' 
              ? `आप ₹${creditUsed.toFixed(0)} तक पहुंच गए हो, संभाल के!` 
              : `You've used ₹${creditUsed.toFixed(0)}, be careful!`
            }
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
            {getTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{getUsageText()}</span>
              <span className="font-semibold text-gray-900">{usagePercentage.toFixed(1)}%</span>
            </div>
            <div className="relative">
              <Progress 
                value={usagePercentage} 
                className="h-3 bg-gray-200"
              />
              <div 
                className={`absolute top-0 left-0 h-3 rounded-full transition-all ${getProgressColor()}`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Remaining Credit */}
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">
                {language === 'hi' ? 'बचा हुआ उधार' : 
                 language === 'bn' ? 'অবশিষ্ট ঋণ' : 
                 language === 'mr' ? 'उरलेले उधार' :
                 language === 'ta' ? 'மீதமுள்ள கடன்' :
                 language === 'te' ? 'మిగిలిన రుణం' :
                 'Remaining Credit'}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{creditRemaining.toFixed(0)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {getRemainingText()}
              </p>
            </div>
          </div>

          {/* Offline indicator */}
          {!creditData && localCreditData && (
            <div className="text-xs text-orange-600 text-center">
              📱 {language === 'hi' ? 'ऑफलाइन डेटा' : 'Offline data'}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}