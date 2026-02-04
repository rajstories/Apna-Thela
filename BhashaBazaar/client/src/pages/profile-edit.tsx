import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/use-language';
import { useSpeech } from '@/hooks/use-speech';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mic, Save } from 'lucide-react';
import { useLocation } from 'wouter';
import type { VendorProfile } from '@shared/schema';

export default function ProfileEdit() {
  const { language } = useLanguage();
  const { speak, startListening, isListening } = useSpeech();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  
  // Get current user ID
  const [currentUserId] = useState(() => {
    return localStorage.getItem('userId') || '';
  });
  
  const [formData, setFormData] = useState({
    vendorName: '',
    storeName: '',
    area: ''
  });
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  // Fetch current profile
  const { data: profile, isLoading } = useQuery<VendorProfile>({
    queryKey: ['/api/vendor-profile', currentUserId],
    enabled: !!currentUserId,
  });

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        vendorName: profile.vendorName || '',
        storeName: profile.storeName || '',
        area: profile.area || ''
      });
    }
  }, [profile]);

  // Save profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const response = await fetch('/api/vendor-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendor-profile'] });
      toast({
        title: language === 'hi' ? 'सफल' : 'Success',
        description: language === 'hi' ? 'प्रोफाइल अपडेट हो गई' : 'Profile updated successfully',
      });
      navigate('/profile');
    },
  });

  const handleVoiceInput = (field: string) => {
    setIsVoiceMode(true);
    const voiceLanguage = language === 'hi' ? 'hi-IN' : 'en-US';
    
    startListening(voiceLanguage).then((transcript: string) => {
      setFormData(prev => ({ ...prev, [field]: transcript }));
      setIsVoiceMode(false);
      
      // Voice confirmation
      const message = language === 'hi' ? 
        `आपने कहा: ${transcript}` : 
        `You said: ${transcript}`;
      speak(message, voiceLanguage);
    }).catch(() => {
      setIsVoiceMode(false);
    });
  };

  const handleSave = () => {
    if (!formData.vendorName.trim() || !formData.storeName.trim() || !formData.area.trim()) {
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' ? 'कृपया सभी फ़ील्ड भरें' : 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }

    const updateData = {
      userId: currentUserId,
      phone: profile?.phone || '',
      vendorName: formData.vendorName,
      vendorNameHi: formData.vendorName,
      storeName: formData.storeName,
      storeNameHi: formData.storeName,
      area: formData.area,
      isPhoneVerified: true,
      profileCompleted: true,
      language: language,
    };
    
    saveProfileMutation.mutate(updateData);
  };

  if (isLoading) {
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

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="text-white hover:bg-orange-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">
              {language === 'hi' ? 'जानकारी बदलें' : 'Edit Details'}
            </h1>
            <p className="text-sm opacity-90">
              {language === 'hi' ? 'अपनी जानकारी अपडेट करें' : 'Update your information'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle>
              {language === 'hi' ? 'प्रोफाइल संपादित करें' : 'Edit Profile'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="vendorName">
                {language === 'hi' ? 'आपका नाम' : 'Your Name'}
              </Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  id="vendorName"
                  value={formData.vendorName}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
                  className="flex-1"
                  placeholder={language === 'hi' ? 'अपना नाम डालें' : 'Enter your name'}
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
            </div>

            <div>
              <Label htmlFor="storeName">
                {language === 'hi' ? 'दुकान का नाम' : 'Store Name'}
              </Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  id="storeName"
                  value={formData.storeName}
                  onChange={(e) => setFormData(prev => ({ ...prev, storeName: e.target.value }))}
                  className="flex-1"
                  placeholder={language === 'hi' ? 'दुकान का नाम डालें' : 'Enter store name'}
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

            <div>
              <Label htmlFor="area">
                {language === 'hi' ? 'इलाका' : 'Area'}
              </Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  id="area"
                  value={formData.area}
                  onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                  className="flex-1"
                  placeholder={language === 'hi' ? 'अपना इलाका डालें' : 'Enter your area'}
                />
                <Button
                  onClick={() => handleVoiceInput('area')}
                  variant="outline"
                  size="icon"
                  disabled={isListening || isVoiceMode}
                  className="border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
                </Button>
              </div>
              
              {/* Area suggestions */}
              <div className="grid grid-cols-2 gap-2 mt-3">
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
                    size="sm"
                    className="text-xs border-orange-200 hover:bg-orange-50"
                  >
                    {language === 'hi' ? area.hi : area.en}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/profile')}
                className="flex-1"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!formData.vendorName.trim() || !formData.storeName.trim() || !formData.area.trim() || saveProfileMutation.isPending}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {saveProfileMutation.isPending ? 
                  (language === 'hi' ? 'सेव हो रहा है...' : 'Saving...') :
                  (language === 'hi' ? 'सेव करें' : 'Save')
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}