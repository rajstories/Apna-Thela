import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calculator, Plus, Minus, X, Percent } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

interface CalculatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CalculatorModal({ open, onOpenChange }: CalculatorModalProps) {
  const { language } = useLanguage();
  const [pricePerItem, setPricePerItem] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [discount, setDiscount] = useState<string>('');
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');

  // Calculate totals
  const price = parseFloat(pricePerItem) || 0;
  const qty = parseFloat(quantity) || 0;
  const discountValue = parseFloat(discount) || 0;
  
  const subtotal = price * qty;
  let discountAmount = 0;
  
  if (discountValue > 0) {
    if (discountType === 'percent') {
      discountAmount = (subtotal * discountValue) / 100;
    } else {
      discountAmount = discountValue;
    }
  }
  
  const total = Math.max(0, subtotal - discountAmount);

  const handleClear = () => {
    setPricePerItem('');
    setQuantity('');
    setDiscount('');
  };

  const quickAmounts = [10, 25, 50, 100, 500, 1000];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-orange-600" />
            <span>
              {language === 'hi' ? 'कैलकुलेटर' : 
               language === 'bn' ? 'ক্যালকুলেটর' : 
               language === 'mr' ? 'कॅल्क्युलेटर' : 
               language === 'ta' ? 'கணக்கீடு' : 
               language === 'te' ? 'కాలిక్యులేటర్' : 
               'Calculator'}
            </span>
          </DialogTitle>
          <DialogDescription>
            {language === 'hi' ? 'मंडी की कीमत और मात्रा की गणना करें' : 
             language === 'bn' ? 'মণ্ডির দাম এবং পরিমাণ গণনা করুন' : 
             language === 'mr' ? 'मंडीचे दर आणि प्रमाण मोजा' : 
             language === 'ta' ? 'சந்தை விலை மற்றும் அளவு கணக்கிடுங்கள்' : 
             language === 'te' ? 'మండీ ధర మరియు పరిమాణం లెక్కించండి' : 
             'Calculate market price and quantity totals'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Price Per Item */}
          <div className="space-y-2">
            <Label htmlFor="price">
              {language === 'hi' ? 'प्रति आइटम दाम (₹)' : 
               language === 'bn' ? 'প্রতি আইটেম দাম (₹)' : 
               language === 'mr' ? 'प्रति आयटम किंमत (₹)' : 
               language === 'ta' ? 'ஒரு பொருளின் விலை (₹)' : 
               language === 'te' ? 'ప్రతి వస్తువు ధర (₹)' : 
               'Price per Item (₹)'}
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={pricePerItem}
              onChange={(e) => setPricePerItem(e.target.value)}
              placeholder="25.50"
              className="text-lg py-3"
            />
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">
              {language === 'hi' ? 'मात्रा' : 
               language === 'bn' ? 'পরিমাণ' : 
               language === 'mr' ? 'प्रमाण' : 
               language === 'ta' ? 'அளவு' : 
               language === 'te' ? 'పరిమాణం' : 
               'Quantity'}
            </Label>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(0, (parseFloat(quantity) || 0) - 1).toString())}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="10"
                className="text-lg py-3 text-center"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(((parseFloat(quantity) || 0) + 1).toString())}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="space-y-2">
            <Label>
              {language === 'hi' ? 'त्वरित मात्रा' : 
               language === 'bn' ? 'দ্রুত পরিমাণ' : 
               language === 'mr' ? 'त्वरित प्रमाण' : 
               language === 'ta' ? 'விரைவு அளவு' : 
               language === 'te' ? 'శీఘ్ర పరిమాణం' : 
               'Quick Quantity'}
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map(amount => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(amount.toString())}
                  className="text-sm"
                >
                  {amount}
                </Button>
              ))}
            </div>
          </div>

          {/* Discount */}
          <div className="space-y-2">
            <Label htmlFor="discount">
              {language === 'hi' ? 'छूट' : 
               language === 'bn' ? 'ছাড়' : 
               language === 'mr' ? 'सूट' : 
               language === 'ta' ? 'தள்ளுபடி' : 
               language === 'te' ? 'తగ్గింపు' : 
               'Discount'}
            </Label>
            <div className="flex space-x-2">
              <div className="flex-1 flex space-x-1">
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="5"
                  className="text-lg py-3"
                />
                <Button
                  variant={discountType === 'percent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDiscountType('percent')}
                  className="px-2"
                >
                  <Percent className="h-3 w-3" />
                </Button>
                <Button
                  variant={discountType === 'amount' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDiscountType('amount')}
                  className="px-2"
                >
                  ₹
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Calculation Display */}
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {language === 'hi' ? 'उप-योग:' : 
                   language === 'bn' ? 'সাবটোটাল:' : 
                   language === 'mr' ? 'उपयोग:' : 
                   language === 'ta' ? 'துணைத்தொகை:' : 
                   language === 'te' ? 'ఉప మొత్తం:' : 
                   'Subtotal:'}
                </span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>
                    {language === 'hi' ? 'छूट:' : 
                     language === 'bn' ? 'ছাড়:' : 
                     language === 'mr' ? 'सूट:' : 
                     language === 'ta' ? 'தள்ளுபடி:' : 
                     language === 'te' ? 'తగ్గింపు:' : 
                     'Discount:'}
                  </span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span className="text-orange-600">
                  {language === 'hi' ? 'कुल योग:' : 
                   language === 'bn' ? 'সর্বমোট:' : 
                   language === 'mr' ? 'एकूण:' : 
                   language === 'ta' ? 'மொத்தம்:' : 
                   language === 'te' ? 'మొత్తం:' : 
                   'Total:'}
                </span>
                <span className="text-orange-600">₹{total.toFixed(2)}</span>
              </div>
              
              {qty > 0 && (
                <div className="text-xs text-gray-500 text-center">
                  {language === 'hi' ? `${price.toFixed(2)} × ${qty} = ${subtotal.toFixed(2)}` : 
                   language === 'bn' ? `${price.toFixed(2)} × ${qty} = ${subtotal.toFixed(2)}` : 
                   `${price.toFixed(2)} × ${qty} = ${subtotal.toFixed(2)}`}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleClear}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              {language === 'hi' ? 'साफ़ करें' : 
               language === 'bn' ? 'পরিষ্কার' : 
               language === 'mr' ? 'साफ करा' : 
               language === 'ta' ? 'அழிக்க' : 
               language === 'te' ? 'క్లియర్' : 
               'Clear'}
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {language === 'hi' ? 'बंद करें' : 
               language === 'bn' ? 'বন্ধ করুন' : 
               language === 'mr' ? 'बंद करा' : 
               language === 'ta' ? 'மூடு' : 
               language === 'te' ? 'మూసివేయండి' : 
               'Close'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}