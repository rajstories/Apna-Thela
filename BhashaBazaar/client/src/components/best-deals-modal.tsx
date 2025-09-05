import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { TrendingDown, ExternalLink, Star, MapPin, Truck, CheckCircle, Zap, Crown } from 'lucide-react';

interface PriceComparison {
  id: string;
  name: string;
  location: string;
  phone: string;
  rating: string;
  trustedByCount: number;
  isVerified: boolean;
  speciality: string;
  pricePerKg: string;
  unit: string;
  priceDate: string;
  currency: string;
  onlineStoreUrl?: string;
}

interface BestDealsModalProps {
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BestDealsModal({ productName, isOpen, onClose }: BestDealsModalProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [priceData, setPriceData] = useState<PriceComparison[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && productName) {
      fetchPriceComparison();
    }
  }, [isOpen, productName]);

  const fetchPriceComparison = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Extract the item name (e.g., "Fresh Onions" -> "Onions", "Potato Regular" -> "Potato")
      const itemName = extractItemName(productName);
      console.log('Fetching price comparison for:', itemName);
      
      const response = await fetch(`/api/price-comparison/${itemName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch price comparison');
      }
      
      const data = await response.json();
      console.log('Price comparison data:', data);
      
      // Sort by price (cheapest first)
      const sortedData = data.sort((a: PriceComparison, b: PriceComparison) => 
        parseFloat(a.pricePerKg) - parseFloat(b.pricePerKg)
      );
      
      setPriceData(sortedData);
      
      if (sortedData.length > 0) {
        toast({
          title: language === 'hi' ? '🎯 सबसे अच्छे रेट मिले!' : '🎯 Best Deals Found!',
          description: language === 'hi' 
            ? `${sortedData.length} सप्लायर्स मिले, सबसे सस्ता ₹${sortedData[0].pricePerKg}/${sortedData[0].unit}` 
            : `Found ${sortedData.length} suppliers, cheapest at ₹${sortedData[0].pricePerKg}/${sortedData[0].unit}`,
        });
      }
    } catch (error) {
      console.error('Error fetching price comparison:', error);
      setError(language === 'hi' ? 'रेट्स लाने में दिक्कत हुई' : 'Failed to fetch price comparison');
    } finally {
      setIsLoading(false);
    }
  };

  const extractItemName = (productName: string): string => {
    // Convert product names to searchable commodity names
    const nameMap: Record<string, string> = {
      'fresh onions': 'Onion',
      'ताज़ा प्याज़': 'Onion',
      'potato regular': 'Potato', 
      'आलू रेगुलर': 'Potato',
      'tomato': 'Tomato',
      'टमाटर': 'Tomato',
      'garlic': 'Garlic',
      'लहसुन': 'Garlic'
    };

    const normalizedName = productName.toLowerCase().trim();
    
    // Check exact matches first
    for (const [key, value] of Object.entries(nameMap)) {
      if (normalizedName.includes(key.toLowerCase())) {
        return value;
      }
    }

    // Fallback: extract first meaningful word
    const words = productName.split(' ');
    const meaningfulWords = words.filter(word => 
      !['fresh', 'regular', 'grade', 'quality', 'organic'].includes(word.toLowerCase())
    );
    
    return meaningfulWords[0] || productName;
  };

  const handleBuyFromSupplier = (supplier: PriceComparison) => {
    if (supplier.onlineStoreUrl) {
      window.open(supplier.onlineStoreUrl, '_blank');
      toast({
        title: language === 'hi' ? '🛒 खरीदारी के लिए रीडायरेक्ट किया गया' : '🛒 Redirected to Buy',
        description: language === 'hi' ? `${supplier.name} से खरीदारी करें` : `Buy from ${supplier.name}`,
      });
    } else {
      // Generate WhatsApp message for suppliers without online store
      const message = language === 'hi' 
        ? `नमस्ते! मुझे ${productName} चाहिए। आपका रेट ₹${supplier.pricePerKg}/${supplier.unit} है। कृपया डिटेल भेजें।`
        : `Hello! I need ${productName}. Your rate is ₹${supplier.pricePerKg}/${supplier.unit}. Please send details.`;
      
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${supplier.phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
      
      toast({
        title: language === 'hi' ? '📱 व्हाट्सऐप पर संपर्क करें' : '📱 Contact via WhatsApp',
        description: language === 'hi' ? 'मैसेज भेजा गया है' : 'Message sent',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <TrendingDown className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-bold text-lg">
                {language === 'hi' ? '🎯 बेस्ट डील्स' : '🎯 Best Deals'}
              </div>
              <div className="text-sm text-gray-600 font-normal">{productName}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">
                {language === 'hi' ? '🔍 रेट्स खोजे जा रहे हैं...' : '🔍 Finding best rates...'}
              </p>
            </div>
          )}

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 text-center">
                <p className="text-red-600">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchPriceComparison}
                  className="mt-2"
                >
                  {language === 'hi' ? 'फिर कोशिश करें' : 'Try Again'}
                </Button>
              </CardContent>
            </Card>
          )}

          {priceData.length > 0 && !isLoading && (
            <div className="space-y-3">
              {priceData.map((supplier, index) => (
                <Card 
                  key={supplier.id} 
                  className={`border ${index === 0 ? 'border-green-200 bg-green-50' : 'border-gray-200'} relative`}
                >
                  {index === 0 && (
                    <div className="absolute top-2 right-2">
                      <Crown className="w-4 h-4 text-yellow-500" />
                    </div>
                  )}
                  
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-sm">{supplier.name}</span>
                          {supplier.isVerified && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          {index === 0 && (
                            <Badge className="bg-green-600 text-white text-xs">
                              {language === 'hi' ? 'सबसे सस्ता' : 'Cheapest'}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-3 text-xs text-gray-600 mb-2">
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {supplier.location}
                          </span>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                            <span>{supplier.rating}</span>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-500">{supplier.speciality}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-lg font-bold ${index === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                          ₹{supplier.pricePerKg}
                        </div>
                        <div className="text-xs text-gray-500">per {supplier.unit}</div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleBuyFromSupplier(supplier)}
                      className={`w-full ${index === 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                    >
                      {supplier.onlineStoreUrl ? (
                        <>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          {language === 'hi' ? 'ऑनलाइन खरीदें' : 'Buy Online'}
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          {language === 'hi' ? 'व्हाट्सऐप पर संपर्क करें' : 'Contact on WhatsApp'}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {priceData.length === 0 && !isLoading && !error && (
            <Card className="border-gray-200">
              <CardContent className="p-4 text-center">
                <TrendingDown className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">
                  {language === 'hi' ? 'इस प्रोडक्ट के लिए रेट्स नहीं मिले' : 'No price comparison available for this product'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Close Button */}
          <Button variant="outline" onClick={onClose} className="w-full">
            {language === 'hi' ? 'बंद करें' : 'Close'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}