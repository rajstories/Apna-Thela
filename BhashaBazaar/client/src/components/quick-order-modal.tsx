import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Plus, Minus, Phone, IndianRupee } from 'lucide-react';

interface QuickOrderItem {
  item: string;
  price: number;
  available: boolean;
}

interface VendorWithQuickOrder {
  id: string;
  vendorName: string;
  storeName: string;
  phone: string;
  area: string;
  quickOrderItems?: QuickOrderItem[];
}

interface QuickOrderModalProps {
  vendor: VendorWithQuickOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

interface OrderItem extends QuickOrderItem {
  quantity: number;
}

export function QuickOrderModal({ vendor, isOpen, onClose }: QuickOrderModalProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  if (!vendor) return null;

  const addToOrder = (item: QuickOrderItem) => {
    setOrderItems(prev => {
      const existing = prev.find(orderItem => orderItem.item === item.item);
      if (existing) {
        return prev.map(orderItem =>
          orderItem.item === item.item
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromOrder = (itemName: string) => {
    setOrderItems(prev => {
      const existing = prev.find(orderItem => orderItem.item === itemName);
      if (existing && existing.quantity > 1) {
        return prev.map(orderItem =>
          orderItem.item === itemName
            ? { ...orderItem, quantity: orderItem.quantity - 1 }
            : orderItem
        );
      }
      return prev.filter(orderItem => orderItem.item !== itemName);
    });
  };

  const getTotalAmount = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemQuantity = (itemName: string) => {
    const item = orderItems.find(orderItem => orderItem.item === itemName);
    return item ? item.quantity : 0;
  };

  const handlePlaceOrder = () => {
    if (orderItems.length === 0) {
      toast({
        title: language === 'hi' ? 'कुछ आइटम चुनें' : 'Select some items',
        description: language === 'hi' ? 'ऑर्डर के लिए कम से कम एक आइटम चुनें' : 'Please select at least one item to order',
        variant: "destructive"
      });
      return;
    }

    // Create order summary for WhatsApp
    const orderSummary = orderItems.map(item => 
      `${item.item} x${item.quantity} = ₹${item.price * item.quantity}`
    ).join('\n');
    
    const totalAmount = getTotalAmount();
    const message = `नमस्ते! मुझे ऑर्डर करना है:\n\n${orderSummary}\n\nकुल राशि: ₹${totalAmount}\n\nकृपया कन्फर्म करें।`;
    
    // Open WhatsApp with order details
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${vendor.phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');

    toast({
      title: language === 'hi' ? 'ऑर्डर भेजा गया!' : 'Order Sent!',
      description: language === 'hi' ? 'व्हाट्सऐप पर ऑर्डर डिटेल भेजी गई है' : 'Order details sent via WhatsApp',
    });

    // Reset and close
    setOrderItems([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-orange-600" />
            <div>
              <div className="font-bold text-lg">{vendor.storeName}</div>
              <div className="text-sm text-gray-600 font-normal">{vendor.area}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Menu Items */}
          <div>
            <h3 className="font-semibold text-md mb-3">
              {language === 'hi' ? 'मेन्यू आइटम्स' : 'Menu Items'}
            </h3>
            <div className="space-y-2">
              {vendor.quickOrderItems?.map((item, index) => (
                <Card key={index} className={`border ${item.available ? 'border-green-200' : 'border-red-200'}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{item.item}</span>
                          {!item.available && (
                            <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                              {language === 'hi' ? 'उपलब्ध नहीं' : 'Not Available'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                          <IndianRupee className="w-3 h-3" />
                          <span>{item.price}</span>
                        </div>
                      </div>
                      
                      {item.available && (
                        <div className="flex items-center space-x-2">
                          {getItemQuantity(item.item) > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFromOrder(item.item)}
                              className="w-8 h-8 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                          )}
                          
                          {getItemQuantity(item.item) > 0 && (
                            <span className="w-8 text-center font-medium">
                              {getItemQuantity(item.item)}
                            </span>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addToOrder(item)}
                            className="w-8 h-8 p-0 bg-orange-50 hover:bg-orange-100"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )) || []}
            </div>
          </div>

          {/* Order Summary */}
          {orderItems.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-md mb-3">
                  {language === 'hi' ? 'ऑर्डर समरी' : 'Order Summary'}
                </h3>
                <div className="space-y-2">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span>{item.item} x{item.quantity}</span>
                      <span className="flex items-center">
                        <IndianRupee className="w-3 h-3" />
                        {item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between items-center font-bold">
                    <span>{language === 'hi' ? 'कुल राशि' : 'Total Amount'}</span>
                    <span className="flex items-center text-lg text-orange-600">
                      <IndianRupee className="w-4 h-4" />
                      {getTotalAmount()}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </Button>
            <Button
              onClick={handlePlaceOrder}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Phone className="w-4 h-4 mr-2" />
              {language === 'hi' ? 'ऑर्डर करें' : 'Place Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}