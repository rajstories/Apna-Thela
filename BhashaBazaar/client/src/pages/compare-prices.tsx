import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
// Translation function - simplified version for this component
const getTranslation = (language: string, key: string) => {
  const translations: Record<string, Record<string, string>> = {
    'common.success': { hi: 'सफलता', en: 'Success' },
    'common.error': { hi: 'त्रुटि', en: 'Error' },
    'common.ok': { hi: 'ठीक है', en: 'OK' }
  };
  return translations[key]?.[language] || key;
};
import { apiRequest } from '@/lib/queryClient';
import { ArrowUpDown, Phone, MessageCircle, MapPin, Star, Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { VoiceInputButton } from '@/components/voice-input-button';

interface SupplierPrice {
  id: string;
  name: string;
  location: string;
  pincode: string;
  phone: string;
  whatsappNumber?: string;
  websiteUrl?: string;
  rating: string;
  trustedByCount: number;
  isVerified: boolean;
  speciality?: string;
  pricePerKg: string;
  unit: string;
  availability: boolean;
  itemName: string;
  itemNameHi?: string;
  category: string;
  lastUpdated: string;
}

interface AvailableItem {
  itemName: string;
  itemNameHi?: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  supplierCount: number;
}

export default function ComparePrices() {
  const { language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'trusted'>('price');
  const [filterBy, setFilterBy] = useState<'all' | 'trusted' | 'verified' | 'nearby' | 'rating'>('all');
  const [userPincode, setUserPincode] = useState<string>('');

  // Get available items for comparison
  const { data: availableItems, isLoading: itemsLoading } = useQuery<AvailableItem[]>({
    queryKey: ['/api/price-comparison'],
    queryFn: () => apiRequest('GET', '/api/price-comparison').then(res => res.json()),
  });

  // Get price comparison for selected item
  const { data: suppliers, isLoading: suppliersLoading, refetch } = useQuery<SupplierPrice[]>({
    queryKey: ['/api/price-comparison', selectedItem, sortBy, filterBy, userPincode],
    queryFn: () => {
      if (!selectedItem) return [];
      const params = new URLSearchParams({
        sortBy,
        ...(filterBy !== 'all' && { filterBy }),
        ...(filterBy === 'nearby' && userPincode && { pincode: userPincode })
      });
      return apiRequest('GET', `/api/price-comparison/${selectedItem}?${params}`).then(res => res.json());
    },
    enabled: !!selectedItem
  });

  // Contact supplier mutation
  const contactMutation = useMutation({
    mutationFn: async ({ supplierId, contactMethod, message }: { supplierId: string; contactMethod: 'phone' | 'whatsapp' | 'website'; message?: string }) => {
      const response = await apiRequest('POST', '/api/price-comparison/contact', {
        supplierId,
        contactMethod,
        message
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      if (variables.contactMethod === 'whatsapp' && data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank');
        toast({
          title: getTranslation(language, 'common.success'),
          description: language === 'hi' ? 'WhatsApp में खुल रहा है' : 'Opening WhatsApp',
        });
      } else if (variables.contactMethod === 'phone' && data.phoneNumber) {
        window.location.href = `tel:${data.phoneNumber}`;
        toast({
          title: getTranslation(language, 'common.success'),
          description: language === 'hi' ? 'फोन डायल हो रहा है' : 'Dialing phone number',
        });
      } else if (variables.contactMethod === 'website' && data.websiteUrl) {
        window.open(data.websiteUrl, '_blank');
        toast({
          title: getTranslation(language, 'common.success'),
          description: language === 'hi' ? 'वेबसाइट खुल रही है' : 'Opening website',
        });
      }
    },
    onError: () => {
      toast({
        title: getTranslation(language, 'common.error'),
        description: language === 'hi' ? 'संपर्क में समस्या' : 'Failed to contact supplier',
        variant: 'destructive',
      });
    }
  });

  const handleVoiceCommand = (transcript: string) => {
    console.log('Voice command received:', transcript);
    
    // Import speech service for enhanced detection
    import('@/lib/speech').then(({ SpeechService }) => {
      const speechService = new SpeechService();
      
      // Detect language and extract item from Hindi queries
      const detectedLanguage = speechService.detectLanguageFromSpeech(transcript);
      const extractedItem = speechService.extractItemFromHindiQuery(transcript);
      
      console.log('Detected language:', detectedLanguage, 'Extracted item:', extractedItem);
      
      // Handle price inquiries in detected language
      if ((detectedLanguage === 'hi' || detectedLanguage === 'en') && extractedItem) {
        console.log(`${detectedLanguage.toUpperCase()} price inquiry detected for item:`, extractedItem);
        
        // Switch to detected language (no reload needed)
        if (language !== detectedLanguage) {
          setLanguage(detectedLanguage);
        }
        
        // Set the item for comparison
        setSelectedItem(extractedItem);
        
        // Fetch live price summary for voice response
        setTimeout(async () => {
          try {
            const response = await apiRequest('GET', `/api/price-summary/${extractedItem}`);
            const data = await response.json();
            
            // Show success message with live price info in detected language
            const title = detectedLanguage === 'hi' ? 'लाइव मार्केट रेट' : 'Live Market Rate';
            const description = detectedLanguage === 'hi' 
              ? (data.summary || `${extractedItem} की कीमतों की तुलना शुरू कर रहे हैं।`)
              : `Live price comparison for ${extractedItem} started.`;
              
            toast({
              title,
              description,
            });
            
            // Speak live price summary in detected language
            const voiceMessage = detectedLanguage === 'hi' 
              ? (data.summary || speechService.getVoiceConfirmationMessage('hi', extractedItem))
              : `Price comparison for ${extractedItem} started. App language switched to English.`;
            speechService.speak(voiceMessage, detectedLanguage);
          } catch (error) {
            // Fallback to standard message in detected language
            const fallbackTitle = detectedLanguage === 'hi' ? 'सफलता' : 'Success';
            const fallbackDesc = detectedLanguage === 'hi' 
              ? `${extractedItem} की कीमतों की तुलना शुरू कर रहे हैं। पूरा ऐप हिंदी में बदल गया।`
              : `Price comparison for ${extractedItem} started. App language switched to English.`;
              
            toast({
              title: fallbackTitle,
              description: fallbackDesc,
            });
            speechService.speak(speechService.getVoiceConfirmationMessage(detectedLanguage, extractedItem), detectedLanguage);
          }
        }, 500);
        
        return;
      }
      
      // If Hindi detected but no item extracted, still try to help
      if (detectedLanguage === 'hi') {
        console.log('Hindi detected but no specific item found');
        
        // Switch to Hindi using the language hook (no reload needed)
        if (language !== 'hi') {
          setLanguage('hi');
        }
        
        setTimeout(() => {
          toast({
            title: 'हिंदी में स्वागत',
            description: 'कृपया कोई सब्जी का नाम बताएं जैसे "प्याज", "आलू", "टमाटर"',
          });
          
          // Speak guidance in Hindi
          speechService.speak('कृपया कोई सब्जी का नाम बताएं जैसे प्याज, आलू, या टमाटर', 'hi');
        }, 500);
        
        return;
      }
    });
    
    const lowerTranscript = transcript.toLowerCase();
    
    // Voice command for item selection
    if (lowerTranscript.includes('compare') && availableItems) {
      for (const item of availableItems) {
        if (lowerTranscript.includes(item.itemName.toLowerCase()) || 
            (item.itemNameHi && lowerTranscript.includes(item.itemNameHi))) {
          setSelectedItem(item.itemName);
          toast({
            title: getTranslation(language, 'common.success'),
            description: `${language === 'hi' ? 'तुलना शुरू:' : 'Comparing:'} ${item.itemName}`,
          });
          return;
        }
      }
    }
    
    // Voice command for filters
    if (lowerTranscript.includes('cheapest') || lowerTranscript.includes('सबसे सस्ता')) {
      setSortBy('price');
      toast({
        title: getTranslation(language, 'common.success'),
        description: language === 'hi' ? 'सबसे सस्ते दाम के अनुसार छांटा गया' : 'Sorted by cheapest price',
      });
    } else if (lowerTranscript.includes('best rating') || lowerTranscript.includes('सबसे अच्छी रेटिंग')) {
      setSortBy('rating');
      toast({
        title: getTranslation(language, 'common.success'),
        description: language === 'hi' ? 'रेटिंग के अनुसार छांटा गया' : 'Sorted by rating',
      });
    } else if (lowerTranscript.includes('trusted') || lowerTranscript.includes('भरोसेमंद')) {
      setFilterBy('trusted');
      toast({
        title: getTranslation(language, 'common.success'),
        description: language === 'hi' ? 'केवल भरोसेमंद विक्रेता' : 'Showing trusted suppliers only',
      });
    }
  };

  const getSupplierName = (supplier: SupplierPrice) => {
    return supplier.name;
  };

  const getItemName = (item: AvailableItem) => {
    if (language === 'hi' && item.itemNameHi) {
      return item.itemNameHi;
    }
    return item.itemName;
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `₹${numPrice.toFixed(0)}`;
  };

  // Helper function to determine contact button layout based on available methods
  const getContactButtonLayout = (supplier: SupplierPrice) => {
    let availableMethods = 1; // Phone is always available
    
    // Check WhatsApp availability
    if (supplier.whatsappNumber || supplier.id.startsWith('live-')) {
      availableMethods++;
    }
    
    // Check website availability
    if (supplier.websiteUrl || supplier.id.startsWith('live-')) {
      availableMethods++;
    }
    
    return availableMethods === 3 ? 'grid-cols-3' : availableMethods === 2 ? 'grid-cols-2' : 'grid-cols-1';
  };

  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && <Star className="w-4 h-4 fill-yellow-200 text-yellow-400" />}
        <span className="ml-1 text-sm font-medium">{numRating}</span>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          📊 {language === 'hi' ? 'मूल्य तुलना' : 'Compare Suppliers'}
        </h1>
        <p className="text-gray-600">
          {language === 'hi' 
            ? 'कई आपूर्तिकर्ताओं से कच्चे माल की कीमतों की तुलना करें' 
            : 'Compare raw material prices from multiple suppliers'}
        </p>
      </div>

      {/* Voice Command */}
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-3">
            <h3 className="font-semibold mr-2">
              {language === 'hi' ? 'आवाज़ से खोजें:' : 'Voice Search:'}
            </h3>
            <VoiceInputButton 
              onTranscript={handleVoiceCommand}
              size="sm"
            />
          </div>
          <p className="text-sm text-gray-600">
            {language === 'hi' 
              ? 'कहें: "आलू की तुलना करें" या "सबसे सस्ता प्याज"' 
              : 'Say: "Compare aloo prices" or "Cheapest onion seller"'}
          </p>
        </CardContent>
      </Card>

      {/* Item Selection and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select value={selectedItem} onValueChange={setSelectedItem}>
          <SelectTrigger>
            <SelectValue placeholder={language === 'hi' ? 'वस्तु चुनें' : 'Select Item'} />
          </SelectTrigger>
          <SelectContent>
            {availableItems?.map(item => (
              <SelectItem key={item.itemName} value={item.itemName}>
                <div className="flex justify-between items-center w-full">
                  <span>{getItemName(item)}</span>
                  <div className="text-xs text-gray-500 ml-2">
                    {formatPrice(item.minPrice)}-{formatPrice(item.maxPrice)}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: 'price' | 'rating' | 'trusted') => setSortBy(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price">
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                {language === 'hi' ? 'कम दाम' : 'Price (Low to High)'}
              </div>
            </SelectItem>
            <SelectItem value="rating">
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-2" />
                {language === 'hi' ? 'रेटिंग' : 'Rating (High to Low)'}
              </div>
            </SelectItem>
            <SelectItem value="trusted">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                {language === 'hi' ? 'भरोसेमंद' : 'Most Trusted'}
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterBy} onValueChange={(value: 'all' | 'trusted' | 'verified' | 'nearby' | 'rating') => setFilterBy(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'hi' ? 'सभी' : 'All Suppliers'}</SelectItem>
            <SelectItem value="trusted">{language === 'hi' ? 'भरोसेमंद' : 'Trusted Only'}</SelectItem>
            <SelectItem value="verified">{language === 'hi' ? 'सत्यापित' : 'Verified Only'}</SelectItem>
            <SelectItem value="nearby">{language === 'hi' ? 'पास वाले' : 'Nearby Only'}</SelectItem>
            <SelectItem value="rating">{language === 'hi' ? '4+ रेटिंग' : '4+ Rating'}</SelectItem>
          </SelectContent>
        </Select>

        {filterBy === 'nearby' && (
          <input
            type="text"
            placeholder={language === 'hi' ? 'पिनकोड' : 'Pincode'}
            value={userPincode}
            onChange={(e) => setUserPincode(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saffron-500"
          />
        )}
      </div>

      {/* Results */}
      {selectedItem && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {language === 'hi' ? 'मूल्य तुलना:' : 'Comparing Prices for:'} {selectedItem}
            </h2>
            {suppliers && suppliers.length > 0 && (
              <Badge variant="outline">
                {suppliers.length} {language === 'hi' ? 'आपूर्तिकर्ता' : 'suppliers'}
              </Badge>
            )}
          </div>

          {suppliersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : suppliers?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">
                  {language === 'hi' 
                    ? 'इस वस्तु के लिए कोई आपूर्तिकर्ता नहीं मिला' 
                    : 'No suppliers found for this item'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers?.map((supplier, index) => (
                <Card key={supplier.id} className={`relative ${index === 0 && sortBy === 'price' ? 'border-2 border-green-500' : ''}`}>
                  {index === 0 && sortBy === 'price' && (
                    <div className="absolute -top-2 left-4 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                      {language === 'hi' ? 'सबसे सस्ता' : 'CHEAPEST'}
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{getSupplierName(supplier)}</CardTitle>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {supplier.location}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          📮 {supplier.pincode}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-saffron-600">
                          {formatPrice(supplier.pricePerKg)}
                        </div>
                        <div className="text-xs text-gray-500">per {supplier.unit}</div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Rating */}
                      <div className="flex items-center justify-between">
                        {renderStars(supplier.rating)}
                        <div className="flex items-center space-x-2">
                          {supplier.isVerified && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <Shield className="w-3 h-3 mr-1" />
                              {language === 'hi' ? 'सत्यापित' : 'Verified'}
                            </Badge>
                          )}
                          {supplier.trustedByCount > 0 && (
                            <Badge variant="outline" className="text-blue-700">
                              ✅ {supplier.trustedByCount}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Speciality */}
                      {supplier.speciality && (
                        <p className="text-sm text-gray-600 italic">
                          {supplier.speciality}
                        </p>
                      )}

                      {/* Contact Buttons - Dynamic layout based on available methods */}
                      <div className={`grid gap-1 pt-2 ${getContactButtonLayout(supplier)}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => contactMutation.mutate({ supplierId: supplier.id, contactMethod: 'phone' })}
                          disabled={contactMutation.isPending}
                          className="flex items-center justify-center text-xs px-2"
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          {language === 'hi' ? 'फोन' : 'Call'}
                        </Button>
                        {(supplier.whatsappNumber || supplier.id.startsWith('live-')) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => contactMutation.mutate({ 
                              supplierId: supplier.id, 
                              contactMethod: 'whatsapp',
                              message: language === 'hi' 
                                ? `नमस्ते! मुझे ${selectedItem} की कीमत जानना है।`
                                : `Hello! I need pricing for ${selectedItem}.`
                            })}
                            disabled={contactMutation.isPending}
                            className="flex items-center justify-center bg-green-50 hover:bg-green-100 text-green-700 border-green-200 text-xs px-1"
                          >
                            <MessageCircle className="w-3 h-3 mr-1" />
                            WhatsApp
                          </Button>
                        )}
                        {supplier.websiteUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => contactMutation.mutate({ supplierId: supplier.id, contactMethod: 'website' })}
                            disabled={contactMutation.isPending}
                            className="flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 text-xs"
                          >
                            🌐
                            {language === 'hi' ? 'साइट' : 'Site'}
                          </Button>
                        )}
                      </div>

                      {/* Last Updated */}
                      <div className="text-xs text-gray-400 text-center pt-2">
                        {language === 'hi' ? 'अपडेट:' : 'Updated:'} {new Date(supplier.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Stats */}
      {selectedItem && suppliers && suppliers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {language === 'hi' ? 'मूल्य विश्लेषण' : 'Price Analysis'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatPrice(Math.min(...suppliers.map(s => parseFloat(s.pricePerKg))))}
                </div>
                <div className="text-sm text-gray-600">
                  {language === 'hi' ? 'न्यूनतम मूल्य' : 'Lowest Price'}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {formatPrice(Math.max(...suppliers.map(s => parseFloat(s.pricePerKg))))}
                </div>
                <div className="text-sm text-gray-600">
                  {language === 'hi' ? 'अधिकतम मूल्य' : 'Highest Price'}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatPrice(suppliers.reduce((sum, s) => sum + parseFloat(s.pricePerKg), 0) / suppliers.length)}
                </div>
                <div className="text-sm text-gray-600">
                  {language === 'hi' ? 'औसत मूल्य' : 'Average Price'}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {suppliers.filter(s => s.isVerified).length}
                </div>
                <div className="text-sm text-gray-600">
                  {language === 'hi' ? 'सत्यापित' : 'Verified'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}