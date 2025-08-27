import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BottomNavigation } from '@/components/bottom-navigation';
import { FloatingHelpButton } from '@/components/floating-help-button';
import { useLanguage } from '@/hooks/use-language';
import { useSpeech } from '@/hooks/use-speech';
import { useToast } from '@/hooks/use-toast';
import { User, Phone, Store, Edit, Eye, CreditCard, Mic, CheckCircle, ArrowLeft, Coffee } from 'lucide-react';
import { useLocation } from 'wouter';
import type { VendorProfile } from '@shared/schema';

interface ProfileSetupStep {
  step: 'phone' | 'otp' | 'name' | 'store' | 'area' | 'complete';
}

export default function Profile() {
  const { language } = useLanguage();
  const { speak, startListening, isListening } = useSpeech();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  
  // Get or generate a unique user session ID
  const [currentUserId] = useState(() => {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userId', userId);
    }
    return userId;
  });
  
  const [setupStep, setSetupStep] = useState<ProfileSetupStep>({ step: 'phone' });
  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    vendorName: '',
    storeName: '',
    area: ''
  });
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Fetch vendor profile by user ID instead of phone
  const { data: profile, isLoading, error } = useQuery<VendorProfile>({
    queryKey: ['/api/vendor-profile', currentUserId],
    enabled: !!currentUserId,
    retry: false, // Don't retry on 404 for new users
  });

  // Send OTP mutation
  const sendOtpMutation = useMutation({
    mutationFn: (phone: string) =>
      fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      }).then(res => res.json()),
    onSuccess: (data) => {
      setShowOtpDialog(true);
      toast({
        title: language === 'hi' ? 'OTP भेजा गया' : 'OTP Sent',
        description: language === 'hi' ? 'आपके फोन पर OTP भेजा गया है' : 'OTP sent to your phone',
      });
      // For demo, show the OTP in console
      if (data.otp) {
        console.log('Demo OTP:', data.otp);
      }
    },
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) =>
      fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      }).then(res => res.json()),
    onSuccess: () => {
      setShowOtpDialog(false);
      setSetupStep({ step: 'name' });
      toast({
        title: language === 'hi' ? 'OTP सत्यापित' : 'OTP Verified',
        description: language === 'hi' ? 'फोन नंबर सत्यापित हो गया' : 'Phone number verified successfully',
      });
    },
  });

  // Create/Update profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: (profileData: any) =>
      fetch('/api/vendor-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendor-profile'] });
      setSetupStep({ step: 'complete' });
      toast({
        title: language === 'hi' ? 'प्रोफाइल बनाई गई' : 'Profile Created',
        description: language === 'hi' ? 'आपकी प्रोफाइल सफलतापूर्वक बनाई गई' : 'Your profile has been created successfully',
      });
      
      // Welcome message with vendor name
      const welcomeMessage = language === 'hi' ? 
        `अरे ${formData.vendorName} जी! आपका स्टॉक कैसा है आज?` :
        `Welcome ${formData.vendorName}! How is your stock today?`;
      speak(welcomeMessage);
    },
  });

  // Handle voice input for name
  const handleVoiceInput = async (field: 'vendorName' | 'storeName') => {
    setIsVoiceMode(true);
    const voicePrompt = field === 'vendorName' 
      ? (language === 'hi' ? 'अपना नाम बताइए' : 'Say your name')
      : (language === 'hi' ? 'अपनी दुकान का नाम बताइए' : 'Say your store name');
    
    speak(voicePrompt);
    
    try {
      const result = await startListening(language);
      if (result) {
        setFormData(prev => ({ ...prev, [field]: result }));
        toast({
          title: language === 'hi' ? 'आवाज़ पकड़ी गई' : 'Voice Captured',
          description: language === 'hi' ? 'नाम सफलतापूर्वक पकड़ा गया' : 'Name captured successfully',
        });
      }
    } catch (error) {
      toast({
        title: language === 'hi' ? 'आवाज़ में समस्या' : 'Voice Error',
        description: language === 'hi' ? 'कृपया दोबारा कोशिश करें' : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsVoiceMode(false);
    }
  };

  const handlePhoneSubmit = () => {
    if (formData.phone.length >= 10) {
      sendOtpMutation.mutate(formData.phone);
    }
  };

  const handleOtpSubmit = () => {
    if (formData.otp.length === 6) {
      verifyOtpMutation.mutate({ phone: formData.phone, otp: formData.otp });
    }
  };

  const handleNameSubmit = () => {
    if (formData.vendorName.trim()) {
      setSetupStep({ step: 'store' });
    }
  };

  const handleStoreSubmit = () => {
    if (formData.storeName.trim()) {
      setSetupStep({ step: 'area' });
    }
  };

  const handleAreaSubmit = () => {
    if (formData.area.trim()) {
      // Save complete profile with user ID
      const profileData = {
        userId: currentUserId,
        phone: formData.phone,
        vendorName: formData.vendorName,
        vendorNameHi: formData.vendorName, // In real app, translate or ask in Hindi
        storeName: formData.storeName,
        storeNameHi: formData.storeName, // In real app, translate or ask in Hindi
        area: formData.area,
        isPhoneVerified: true,
        profileCompleted: true,
        language: language,
      };
      saveProfileMutation.mutate(profileData);
    }
  };

  // Store name suggestions
  const storeNameSuggestions = [
    { hi: 'राम भैया की चाट', en: 'Ram Bhaiya Ki Chaat', icon: '🍛' },
    { hi: 'मटका कुल्फी वाला', en: 'Matka Kulfi Wala', icon: '🍨' },
    { hi: 'माँ की रसोई', en: 'Maa Ki Rasoi', icon: '🍽️' },
    { hi: 'गर्म चाय स्टॉल', en: 'Garam Chai Stall', icon: '☕' },
  ];

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Check if user is new (no profile found) or profile exists
  const isNewUser = !profile && !isLoading && error?.message?.includes('404');

  // If profile exists, show profile view
  if (profile && profile.profileCompleted) {
    const displayName = profile.vendorNameHi || profile.vendorName || 'विक्रेता';
    const displayStoreName = profile.storeNameHi || profile.storeName || 'दुकान';
    
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-white hover:bg-orange-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">
                  {language === 'hi' ? 'प्रोफाइल' : 'Profile'}
                </h1>
                <p className="text-sm opacity-90">
                  {language === 'hi' ? 'आपकी जानकारी' : 'Your Information'}
                </p>
              </div>
            </div>
            <Coffee className="h-6 w-6" />
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Warm Welcome Card */}
          <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {language === 'hi' ? 'नमस्ते' : 'Namaste'} {displayName}!
                </h2>
                <p className="text-orange-600 font-medium">{displayStoreName}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {language === 'hi' ? 'अरे, आपका स्टॉक कैसा है आज?' : 'How is your stock today?'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-orange-600" />
                <span>
                  {language === 'hi' ? 'विक्रेता का विवरण' : 'Vendor Details'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">
                    {language === 'hi' ? 'नाम:' : 'Name:'}
                  </span>
                  <span className="font-medium">{displayName}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">
                    {language === 'hi' ? 'दुकान का नाम:' : 'Store Name:'}
                  </span>
                  <span className="font-medium">{displayStoreName}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">
                    {language === 'hi' ? 'मोबाइल नंबर:' : 'Mobile Number:'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{profile.phone}</span>
                    {profile.isPhoneVerified && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">
                    {language === 'hi' ? 'क्षेत्र:' : 'Area:'}
                  </span>
                  <span className="font-medium">{profile.area}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/profile/edit')}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              {language === 'hi' ? 'जानकारी बदलें' : 'Edit Details'}
            </Button>
            
            <Button 
              onClick={() => navigate('/inventory')}
              variant="outline" 
              className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              {language === 'hi' ? 'मेरा स्टॉक देखें' : 'View Inventory'}
            </Button>
            
            <Button 
              onClick={() => navigate('/wallet')}
              variant="outline" 
              className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {language === 'hi' ? 'लेन-देन की जानकारी' : 'Transaction History'}
            </Button>
          </div>
        </div>

        <div className="pb-20" />
        <FloatingHelpButton />
        <BottomNavigation />
      </div>
    );
  }

  // For new users, show onboarding flow
  if (isNewUser || (!profile && !isLoading)) {
    return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4">
        <div className="text-center">
          <Coffee className="h-8 w-8 mx-auto mb-2" />
          <h1 className="text-lg font-semibold">
            {language === 'hi' ? 'चाय वाले की तरह आपको जानना चाहते हैं' : 'Getting to know you like a chai waala'}
          </h1>
          <p className="text-sm opacity-90">
            {language === 'hi' ? 'अपनी प्रोफाइल बनाएं' : 'Create your profile'}
          </p>
        </div>
      </div>

      <div className="p-4">
        {/* Step 1: Phone Number */}
        {setupStep.step === 'phone' && (
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-orange-600" />
                <span>
                  {language === 'hi' ? 'फोन नंबर डालें' : 'Enter Phone Number'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone">
                  {language === 'hi' ? 'मोबाइल नंबर (10 अंक)' : 'Mobile Number (10 digits)'}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'hi' ? 'मोबाइल नंबर सही से डालिए ताकि आपका खाता बने' : 'Enter correct mobile number to create your account'}
                </p>
              </div>
              
              <Button 
                onClick={handlePhoneSubmit}
                disabled={formData.phone.length < 10 || sendOtpMutation.isPending}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {sendOtpMutation.isPending ? 
                  (language === 'hi' ? 'भेजा जा रहा है...' : 'Sending...') :
                  (language === 'hi' ? 'OTP भेजें' : 'Send OTP')
                }
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Name Input */}
        {setupStep.step === 'name' && (
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-orange-600" />
                <span>
                  {language === 'hi' ? 'नाम क्या है?' : 'What is your name?'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="vendorName">
                  {language === 'hi' ? 'अपना नाम बताइए या टाइप कीजिए' : 'Say or type your name'}
                </Label>
                <div className="flex space-x-2 mt-2">
                  <Input
                    id="vendorName"
                    placeholder={language === 'hi' ? 'राम कुमार' : 'Ram Kumar'}
                    value={formData.vendorName}
                    onChange={(e) => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleVoiceInput('vendorName')}
                    variant="outline"
                    size="icon"
                    disabled={isListening || isVoiceMode}
                    className="border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'hi' ? 'अगर नाम टाइप नहीं कर सकते तो बोलें 🎙️' : 'If you can\'t type, just speak 🎙️'}
                </p>
              </div>
              
              <Button 
                onClick={handleNameSubmit}
                disabled={!formData.vendorName.trim()}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {language === 'hi' ? 'आगे बढ़ें' : 'Continue'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Store Name */}
        {setupStep.step === 'store' && (
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Store className="h-5 w-5 text-orange-600" />
                <span>
                  {language === 'hi' ? 'आपकी दुकान का नाम क्या है?' : 'What is your store name?'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Store Name Suggestions */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {storeNameSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      storeName: language === 'hi' ? suggestion.hi : suggestion.en 
                    }))}
                    variant="outline"
                    className="h-auto p-3 text-left border-orange-200 hover:bg-orange-50"
                  >
                    <div>
                      <div className="text-lg mb-1">{suggestion.icon}</div>
                      <div className="text-xs font-medium">
                        {language === 'hi' ? suggestion.hi : suggestion.en}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>

              <div>
                <Label htmlFor="storeName">
                  {language === 'hi' ? 'या अपना नाम टाइप/बोलें' : 'Or type/speak your own'}
                </Label>
                <div className="flex space-x-2 mt-2">
                  <Input
                    id="storeName"
                    placeholder={language === 'hi' ? 'दुकान का नाम' : 'Store name'}
                    value={formData.storeName}
                    onChange={(e) => setFormData(prev => ({ ...prev, storeName: e.target.value }))}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleVoiceInput('storeName')}
                    variant="outline"
                    size="icon"
                    disabled={isListening || isVoiceMode}
                    className="border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
                  </Button>
                </div>
              </div>
              
              <Button 
                onClick={handleStoreSubmit}
                disabled={!formData.storeName.trim()}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {language === 'hi' ? 'आगे बढ़ें' : 'Continue'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Area */}
        {setupStep.step === 'area' && (
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Store className="h-5 w-5 text-orange-600" />
                <span>
                  {language === 'hi' ? 'आप कहाँ हैं?' : 'Where are you located?'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Area suggestions */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { hi: 'करोल बाग़', en: 'Karol Bagh' },
                  { hi: 'लाजपत नगर', en: 'Lajpat Nagar' },
                  { hi: 'कनॉट प्लेस', en: 'Connaught Place' },
                  { hi: 'चांदनी चौक', en: 'Chandni Chowk' },
                ].map((area, index) => (
                  <Button
                    key={index}
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      area: language === 'hi' ? area.hi : area.en 
                    }))}
                    variant="outline"
                    className="h-auto p-3 text-left border-orange-200 hover:bg-orange-50"
                  >
                    <div className="text-sm font-medium">
                      {language === 'hi' ? area.hi : area.en}
                    </div>
                  </Button>
                ))}
              </div>

              <div>
                <Label htmlFor="area">
                  {language === 'hi' ? 'या अपना क्षेत्र टाइप करें' : 'Or type your area'}
                </Label>
                <Input
                  id="area"
                  placeholder={language === 'hi' ? 'आपका इलाका' : 'Your area'}
                  value={formData.area}
                  onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                  className="mt-2"
                />
              </div>
              
              <Button 
                onClick={handleAreaSubmit}
                disabled={!formData.area.trim() || saveProfileMutation.isPending}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {saveProfileMutation.isPending ? 
                  (language === 'hi' ? 'सेव हो रहा है...' : 'Saving...') :
                  (language === 'hi' ? 'प्रोफाइल बनाएं' : 'Create Profile')
                }
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Complete Step */}
        {setupStep.step === 'complete' && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                {language === 'hi' ? 'बधाई हो!' : 'Congratulations!'}
              </h3>
              <p className="text-green-700 mb-4">
                {language === 'hi' ? 'आपकी प्रोफाइल तैयार है' : 'Your profile is ready'}
              </p>
              <Button 
                onClick={() => navigate('/')}
                className="bg-green-600 hover:bg-green-700"
              >
                {language === 'hi' ? 'शुरू करें' : 'Get Started'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* OTP Verification Dialog */}
      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {language === 'hi' ? 'OTP डालें' : 'Enter OTP'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="otp">
                {language === 'hi' ? '6 अंकों का OTP' : '6-digit OTP'}
              </Label>
              <Input
                id="otp"
                type="number"
                placeholder="123456"
                value={formData.otp}
                onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value }))}
                className="mt-2"
                maxLength={6}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowOtpDialog(false)}
                className="flex-1"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </Button>
              <Button 
                onClick={handleOtpSubmit}
                disabled={formData.otp.length !== 6 || verifyOtpMutation.isPending}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {verifyOtpMutation.isPending ? 
                  (language === 'hi' ? 'जांच रहे हैं...' : 'Verifying...') :
                  (language === 'hi' ? 'सत्यापित करें' : 'Verify')
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>



      <FloatingHelpButton />
    </div>
    );
  }



  // Default loading state for existing users
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {language === 'hi' ? 'प्रोफाइल लोड हो रहा है...' : 'Loading profile...'}
        </p>
      </div>
    </div>
  );
}