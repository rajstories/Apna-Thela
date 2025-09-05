import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, Phone, Star, Store, User, Navigation, Search, Shield, CheckCircle, Filter, Wifi } from 'lucide-react';
import { useLocation } from 'wouter';
import type { VendorProfile } from '@shared/schema';

interface VendorWithDistance extends VendorProfile {
  distance?: number;
  stockHighlights: {
    item: string;
    status: 'full' | 'low' | 'out';
  }[];
}

export default function NearbySellers() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [userPincode, setUserPincode] = useState<string>('');
  const [showLocationPrompt, setShowLocationPrompt] = useState(true); // Show by default
  const [locationPermissionState, setLocationPermissionState] = useState<'requesting' | 'granted' | 'denied' | 'unavailable'>('requesting');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [manualPincode, setManualPincode] = useState('');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [itemFilter, setItemFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Check for saved location preference and current location capability
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    const savedPincode = localStorage.getItem('userPincode');
    
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        setUserLocation(location);
        setLocationPermissionState('granted');
        setShowLocationPrompt(false);
      } catch (error) {
        console.error('Error parsing saved location:', error);
      }
    } else if (savedPincode) {
      setUserPincode(savedPincode);
      setLocationPermissionState('denied');
      setShowLocationPrompt(false);
    }
    
    // Check if geolocation is available
    if (!navigator.geolocation) {
      setLocationPermissionState('unavailable');
    }
  }, []);

  // Function to request location permission
  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      setLocationPermissionState('unavailable');
      return;
    }

    setIsGettingLocation(true);
    setLocationPermissionState('requesting');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);
        setLocationPermissionState('granted');
        setShowLocationPrompt(false);
        setIsGettingLocation(false);
        
        // Save location for future use
        localStorage.setItem('userLocation', JSON.stringify(location));
        
        toast({
          title: language === 'hi' ? 'लोकेशन मिल गई!' : 'Location Found!',
          description: language === 'hi' ? 'आपके आस-पास के विक्रेता खोज रहे हैं...' : 'Finding vendors near you...',
        });
      },
      (error) => {
        console.error('Location access error:', error);
        setLocationPermissionState('denied');
        setIsGettingLocation(false);
        
        toast({
          title: language === 'hi' ? 'लोकेशन की अनुमति नहीं मिली' : 'Location Permission Denied',
          description: language === 'hi' ? 'कृपया मैन्युअल रूप से पिनकोड डालें' : 'Please enter your pincode manually',
          variant: 'destructive'
        });
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Fetch nearby vendors
  const { data: vendors = [], isLoading } = useQuery<VendorWithDistance[]>({
    queryKey: ['/api/nearby-vendors', userLocation?.lat, userLocation?.lng, userPincode],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userLocation) {
        params.set('lat', userLocation.lat.toString());
        params.set('lng', userLocation.lng.toString());
      } else if (userPincode) {
        params.set('pincode', userPincode);
      }
      
      const response = await fetch(`/api/nearby-vendors?${params}`);
      if (!response.ok) throw new Error('Failed to fetch vendors');
      return response.json();
    },
    enabled: !!userLocation || !!userPincode,
  });

  const handlePincodeSubmit = () => {
    if (manualPincode.length === 6) {
      setUserPincode(manualPincode);
      localStorage.setItem('userPincode', manualPincode);
      setShowLocationPrompt(false);
      toast({
        title: language === 'hi' ? 'पिनकोड सेव हो गया' : 'Pincode saved',
        description: language === 'hi' ? `${manualPincode} में विक्रेता खोज रहे हैं` : `Searching vendors in ${manualPincode}`,
      });
    }
  };

  // Filter vendors based on selected criteria
  const filteredVendors = vendors.filter(vendor => {
    const matchesLanguage = languageFilter === 'all' || vendor.language === languageFilter;
    
    const matchesItem = itemFilter === 'all' || 
      vendor.stockHighlights.some(stock => 
        stock.item.toLowerCase().includes(itemFilter.toLowerCase()) && 
        stock.status !== 'out'
      );
    
    return matchesLanguage && matchesItem;
  });

  const getVendorName = (vendor: VendorProfile) => {
    switch (language) {
      case 'hi': return vendor.vendorNameHi || vendor.vendorName;
      case 'bn': return vendor.vendorNameBn || vendor.vendorName;
      case 'mr': return vendor.vendorNameMr || vendor.vendorName;
      case 'ta': return vendor.vendorNameTa || vendor.vendorName;
      case 'te': return vendor.vendorNameTe || vendor.vendorName;
      default: return vendor.vendorName;
    }
  };

  const getStoreName = (vendor: VendorProfile) => {
    switch (language) {
      case 'hi': return vendor.storeNameHi || vendor.storeName;
      case 'bn': return vendor.storeNameBn || vendor.storeName;
      case 'mr': return vendor.storeNameMr || vendor.storeName;
      case 'ta': return vendor.storeNameTa || vendor.storeName;
      case 'te': return vendor.storeNameTe || vendor.storeName;
      default: return vendor.storeName;
    }
  };

  const getStockStatusBadge = (status: 'full' | 'low' | 'out') => {
    const config = {
      full: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        text: language === 'hi' ? 'फुल' : language === 'bn' ? 'পূর্ণ' : 'Full' 
      },
      low: { 
        color: 'bg-orange-100 text-orange-800 border-orange-200', 
        text: language === 'hi' ? 'कम' : language === 'bn' ? 'কম' : 'Low' 
      },
      out: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        text: language === 'hi' ? 'खत्म' : language === 'bn' ? 'শেষ' : 'Out' 
      }
    };
    return config[status];
  };

  const getTrustBadgeText = (trustScore: number) => {
    switch (language) {
      case 'hi': return `${trustScore} विक्रेताओं द्वारा भरोसेमंद`;
      case 'bn': return `${trustScore} বিক্রেতাদের দ্বারা বিশ্বস্ত`;
      case 'mr': return `${trustScore} विक्रेत्यांकडून विश्वसनीय`;
      case 'ta': return `${trustScore} விற்பனையாளர்களால் நம்பகமான`;
      case 'te': return `${trustScore} విక్రేతలచే నమ్మకమైన`;
      default: return `Trusted by ${trustScore} vendors nearby`;
    }
  };

  const makePhoneCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const openWhatsApp = (whatsappNumber: string, vendorName: string) => {
    const message = encodeURIComponent(
      language === 'hi' 
        ? `नमस्ते ${vendorName}, मुझे कुछ सामान चाहिए। कृपया अपनी उपलब्धता बताएं।`
        : `Hello ${vendorName}, I need some items. Please share your availability.`
    );
    window.open(`https://wa.me/91${whatsappNumber}?text=${message}`, '_blank');
  };

  const openWebsite = (websiteUrl: string) => {
    window.open(websiteUrl, '_blank');
  };

  if (showLocationPrompt) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Navigation className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-xl">
              {language === 'hi' ? 'आसपास के विक्रेता खोजें' : 
               language === 'bn' ? 'কাছাকাছি বিক্রেতাদের খুঁজুন' : 
               language === 'mr' ? 'जवळचे विक्रेते शोधा' : 
               language === 'ta' ? 'அருகிலுள்ள விற்பனையாளர்களைத் தேடுங்கள்' : 
               language === 'te' ? 'సమీప విక్రేతలను వెతకండి' : 
               'Find Nearby Vendors'}
            </CardTitle>
            <p className="text-gray-600 text-sm mt-2">
              {language === 'hi' ? 'असली व्यापारी और सप्लायर तुरंत खोजें' : 
               language === 'bn' ? 'আসল ব্যবসায়ী এবং সাপ্লায়ার দ্রুত খুঁজুন' : 
               language === 'mr' ? 'खऱ्या व्यापारी आणि सप्लायर त्वरीत शोधा' : 
               language === 'ta' ? 'உண்மையான வணிகர்கள் மற்றும் சப்ளையர்களை உடனடியாக கண்டறியுங்கள்' : 
               language === 'te' ? 'నిజమైన వ్యాపారులు మరియు సప్లైయర్లను వెంటనే కనుగొనండి' : 
               'Find real businesses and suppliers instantly'}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Location Permission Request */}
            <div className="space-y-4">
              <Button
                onClick={requestLocationPermission}
                disabled={isGettingLocation || locationPermissionState === 'unavailable'}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-medium"
              >
                {isGettingLocation ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>
                      {language === 'hi' ? 'लोकेशन ढूंढ रहे हैं...' : 
                       language === 'bn' ? 'লোকেশন খুঁজছি...' : 
                       language === 'mr' ? 'स्थान शोधत आहे...' : 
                       language === 'ta' ? 'இருப்பிடத்தைத் தேடுகிறது...' : 
                       language === 'te' ? 'స్థానాన్ని వెతుకుతోంది...' : 
                       'Finding Location...'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>
                      {language === 'hi' ? 'मेरी लोकेशन का उपयोग करें' : 
                       language === 'bn' ? 'আমার লোকেশন ব্যবহার করুন' : 
                       language === 'mr' ? 'माझे स्थान वापरा' : 
                       language === 'ta' ? 'என் இருப்பிடத்தைப் பயன்படுத்துங்கள்' : 
                       language === 'te' ? 'నా లొకేషన్ వాడండి' : 
                       'Use My Location'}
                    </span>
                  </div>
                )}
              </Button>
              
              {locationPermissionState === 'unavailable' && (
                <Alert>
                  <AlertDescription>
                    {language === 'hi' ? 'लोकेशन सेवा उपलब्ध नहीं है। कृपया पिनकोड डालें।' : 
                     'Location service is not available. Please enter your pincode.'}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>
                  {language === 'hi' ? 'आपकी जानकारी सुरक्षित है और सिर्फ विक्रेता खोजने के लिए उपयोग होगी' : 
                   language === 'bn' ? 'আপনার তথ্য নিরাপদ এবং শুধুমাত্র বিক্রেতাদের খোঁজার জন্য ব্যবহৃত হবে' : 
                   'Your data is safe and only used to find vendors'}
                </span>
              </div>
            </div>

            {/* Manual Pincode Option */}
            <div className="space-y-3">
              <Separator />
              <p className="text-center text-sm text-gray-500">
                {language === 'hi' ? 'या फिर अपना पिनकोड डालें' : 
                 language === 'bn' ? 'অথবা আপনার পিনকোড দিন' : 
                 'Or enter your pincode'}
              </p>
              <Input
                type="text"
                maxLength={6}
                placeholder={language === 'hi' ? 'पिनकोड (जैसे 110024)' : 'Pincode (e.g. 110024)'}
                value={manualPincode}
                onChange={(e) => setManualPincode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-lg"
              />
              <Button 
                onClick={handlePincodeSubmit} 
                className="w-full" 
                disabled={manualPincode.length !== 6}
              >
                {language === 'hi' ? 'विक्रेता खोजें' : 
                 language === 'bn' ? 'বিক্রেতা খুঁজুন' : 
                 language === 'mr' ? 'विक्रेते शोधा' : 
                 language === 'ta' ? 'விற்பனையாளர்களைக் கண்டறியவும்' : 
                 language === 'te' ? 'విక్రేతలను కనుగొనండి' : 
                 'Find Vendors'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {language === 'hi' ? 'वापस' : 
               language === 'bn' ? 'ফিরে যান' : 
               language === 'mr' ? 'परत' : 
               language === 'ta' ? 'திரும்பு' : 
               language === 'te' ? 'వెనుకకు' : 
               'Back'}
            </span>
          </Button>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>
              {userLocation ? (
                language === 'hi' ? 'आसपास 2km' : 'Within 2km'
              ) : (
                userPincode || '110024'
              )}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            {language === 'hi' ? 'आसपास के विक्रेता' : 
             language === 'bn' ? 'কাছাকাছি বিক্রেতারা' : 
             language === 'mr' ? 'जवळचे विक्रेते' : 
             language === 'ta' ? 'அருகிலுள்ள விற்பனையாளர்கள்' : 
             language === 'te' ? 'సమీప విక్రేతలు' : 
             'Nearby Vendors'}
          </h1>
          <p className="text-gray-600 text-sm">
            {language === 'hi' ? `${filteredVendors.length} विक्रेता मिले` : 
             language === 'bn' ? `${filteredVendors.length} বিক্রেতা পাওয়া গেছে` : 
             language === 'mr' ? `${filteredVendors.length} विक्रेते सापडले` : 
             language === 'ta' ? `${filteredVendors.length} விற்பனையாளர்கள் கிடைத்தன` : 
             language === 'te' ? `${filteredVendors.length} విক్రేతలు దొరికారు` : 
             `${filteredVendors.length} vendors found`}
          </p>
        </div>

        {/* Pincode Search */}
        <div className="space-y-3">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                maxLength={6}
                placeholder={language === 'hi' ? 'पिनकोड खोजें (जैसे 110024)' : 'Search by pincode (e.g. 110024)'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.replace(/\D/g, ''))}
                className="pl-10 text-sm"
              />
            </div>
            <Button 
              onClick={() => {
                if (searchQuery.length === 6) {
                  setUserPincode(searchQuery);
                  localStorage.setItem('userPincode', searchQuery);
                }
              }}
              disabled={searchQuery.length !== 6}
              className="px-4 py-2 text-sm"
              size="sm"
            >
              {language === 'hi' ? 'खोजें' : 'Search'}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder={language === 'hi' ? 'भाषा' : 'Language'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'hi' ? 'सभी भाषाएं' : 'All Languages'}</SelectItem>
                <SelectItem value="hi">{language === 'hi' ? 'हिंदी' : 'Hindi'}</SelectItem>
                <SelectItem value="en">{language === 'hi' ? 'अंग्रेजी' : 'English'}</SelectItem>
                <SelectItem value="bn">{language === 'hi' ? 'बंगाली' : 'Bengali'}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={itemFilter} onValueChange={setItemFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder={language === 'hi' ? 'सामान' : 'Items'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'hi' ? 'सभी सामान' : 'All Items'}</SelectItem>
                <SelectItem value="aloo">{language === 'hi' ? 'आलू' : 'Potato'}</SelectItem>
                <SelectItem value="pyaz">{language === 'hi' ? 'प्याज' : 'Onion'}</SelectItem>
                <SelectItem value="tamatar">{language === 'hi' ? 'टमाटर' : 'Tomato'}</SelectItem>
                <SelectItem value="oil">{language === 'hi' ? 'तेल' : 'Oil'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Vendors List */}
      <div className="px-4 pb-20 space-y-3">
        {filteredVendors.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm">
              {language === 'hi' ? 'इस इलाके में कोई विक्रेता नहीं मिला' : 'No vendors found in this area'}
            </p>
          </div>
        ) : (
          filteredVendors.map(vendor => (
            <Card key={vendor.id} className="border-gray-200 hover:border-orange-300 transition-colors bg-white">
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base text-gray-900 truncate">
                      {getVendorName(vendor)}
                    </h3>
                    <p className="text-orange-600 font-medium text-sm truncate">
                      {getStoreName(vendor)}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-600 truncate">{vendor.area}</span>
                      {vendor.distance && (
                        <>
                          <span className="text-gray-400 text-xs">•</span>
                          <span className="text-xs text-gray-600">{vendor.distance.toFixed(1)}km</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {vendor.language && (
                    <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                      {vendor.language === 'hi' ? 'हिंदी' : 
                       vendor.language === 'bn' ? 'বাংলা' : 
                       vendor.language === 'en' ? 'English' : vendor.language}
                    </Badge>
                  )}
                </div>

                {/* Stock Highlights */}
                <div className="mb-2">
                  <div className="flex flex-wrap gap-1">
                    {vendor.stockHighlights.slice(0, 3).map((stock, index) => {
                      const badge = getStockStatusBadge(stock.status);
                      return (
                        <Badge key={index} className={`text-xs px-2 py-0.5 ${badge.color}`}>
                          {stock.item}: {badge.text}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* Trust Badge */}
                {vendor.trustScore && vendor.trustScore > 0 && (
                  <div className="flex items-center space-x-1 mb-2">
                    <Shield className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-700 font-medium">
                      {getTrustBadgeText(vendor.trustScore)}
                    </span>
                    {vendor.isPhoneVerified && (
                      <CheckCircle className="w-3 h-3 text-blue-600" />
                    )}
                  </div>
                )}

                <Separator className="my-2" />
                
                {/* Actions */}
                <div className="grid grid-cols-2 gap-1.5">
                  <Button 
                    onClick={() => makePhoneCall(vendor.phone)}
                    className="bg-blue-600 hover:bg-blue-700 h-8 text-xs"
                    size="sm"
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    {language === 'hi' ? 'कॉल' : 'Call'}
                  </Button>
                  
                  {vendor.whatsappNumber && (
                    <Button 
                      onClick={() => openWhatsApp(vendor.whatsappNumber!, getVendorName(vendor) || '')}
                      className="bg-green-600 hover:bg-green-700 h-8 text-xs"
                      size="sm"
                    >
                      <span className="mr-1 text-xs">💬</span>
                      {language === 'hi' ? 'व्हाट्सऐप' : 'WhatsApp'}
                    </Button>
                  )}
                  
                  {vendor.websiteUrl && (
                    <Button 
                      onClick={() => openWebsite(vendor.websiteUrl!)}
                      variant="outline"
                      size="sm"
                      className="col-span-2 h-8 text-xs"
                    >
                      <Wifi className="w-3 h-3 mr-1" />
                      {language === 'hi' ? 'वेबसाइट पर जाएं' : 'Visit Website'}
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={vendor.websiteUrl ? 'col-span-2 h-8 text-xs' : 'col-span-1 h-8 text-xs'}
                    onClick={() => navigate(`/buy-ingredients?vendor=${vendor.id}`)}
                  >
                    <Store className="w-3 h-3 mr-1" />
                    {language === 'hi' ? 'ऑर्डर करें' : 'Quick Order'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}