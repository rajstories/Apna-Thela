import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { CreditTrackerComponent } from '@/components/credit-tracker';
import { Wallet as WalletIcon, TrendingUp, Calendar, CreditCard, QrCode, Smartphone, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/hooks/use-language';
import { getTranslation } from '@/lib/i18n';
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

interface Purchase {
  id: string;
  supplierName: string;
  itemName: string;
  quantity: number;
  unit: string;
  pricePerUnit: string;
  totalAmount: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  purchaseDate: string;
}

interface DailySpend {
  date: string;
  amount: number;
  day: string;
}

export default function Wallet() {
  const { language } = useLanguage();
  const [showUPIDialog, setShowUPIDialog] = useState(false);
  const [pendingAmount, setPendingAmount] = useState<number>(0);

  // Fetch purchases data
  const { data: purchases = [], isLoading } = useQuery<Purchase[]>({
    queryKey: ['/api/purchases'],
  });

  // Calculate weekly spending
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  
  const weeklyPurchases = purchases.filter(purchase => 
    isWithinInterval(new Date(purchase.purchaseDate), { start: weekStart, end: weekEnd })
  );

  const totalWeeklySpend = weeklyPurchases.reduce((sum, purchase) => 
    sum + parseFloat(purchase.totalAmount), 0
  );

  const pendingPayments = purchases.filter(p => p.paymentStatus === 'pending');
  const totalPending = pendingPayments.reduce((sum, purchase) => 
    sum + parseFloat(purchase.totalAmount), 0
  );

  // Generate daily spending data for chart
  const dailySpendData: DailySpend[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dayPurchases = purchases.filter(purchase => 
      format(new Date(purchase.purchaseDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    const dayTotal = dayPurchases.reduce((sum, purchase) => 
      sum + parseFloat(purchase.totalAmount), 0
    );
    
    dailySpendData.push({
      date: format(date, 'MM/dd'),
      amount: dayTotal,
      day: format(date, 'EEE')
    });
  }

  const generateUPILink = () => {
    const upiId = "vendor@upi"; // This would be the vendor's UPI ID
    const amount = totalPending.toFixed(2);
    const note = language === 'hi' ? 'दुकान की खरीदारी' : 
                 language === 'bn' ? 'দোকানের কেনাকাটা' : 
                 language === 'mr' ? 'दुकानाची खरेदी' : 
                 language === 'ta' ? 'கடை வாங்குதல்' : 
                 language === 'te' ? 'దుకాణం కొనుగోలు' : 
                 'Shop Purchase';
    
    return `upi://pay?pa=${upiId}&am=${amount}&tn=${encodeURIComponent(note)}`;
  };

  const handlePayNow = (amount: number) => {
    setPendingAmount(amount);
    setShowUPIDialog(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <WalletIcon className="w-8 h-8 text-orange-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'hi' ? 'वॉलेट' : 
             language === 'bn' ? 'ওয়ালেট' : 
             language === 'mr' ? 'वॉलेट' : 
             language === 'ta' ? 'பணப்பை' : 
             language === 'te' ? 'వాలెట్' : 
             'Wallet'}
          </h1>
        </div>
        <Badge variant="outline" className="text-sm">
          <Calendar className="w-4 h-4 mr-1" />
          {language === 'hi' ? 'इस सप्ताह' : 
           language === 'bn' ? 'এই সপ্তাহে' : 
           language === 'mr' ? 'या आठवड्यात' : 
           language === 'ta' ? 'இந்த வாரம்' : 
           language === 'te' ? 'ఈ వారం' : 
           'This Week'}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">
                  {language === 'hi' ? 'इस सप्ताह खर्च' : 
                   language === 'bn' ? 'এই সপ্তাহের খরচ' : 
                   language === 'mr' ? 'या आठवड्याचा खर्च' : 
                   language === 'ta' ? 'இந்த வார செலவு' : 
                   language === 'te' ? 'ఈ వారం ఖర్చు' : 
                   'Weekly Spend'}
                </p>
                <p className="text-2xl font-bold">₹{totalWeeklySpend.toFixed(2)}</p>
                <p className="text-orange-200 text-xs">
                  {weeklyPurchases.length} {language === 'hi' ? 'खरीदारी' : 
                                            language === 'bn' ? 'কেনাকাটা' : 
                                            language === 'mr' ? 'खरेदी' : 
                                            language === 'ta' ? 'வாங்குதல்' : 
                                            language === 'te' ? 'కొనుగోలు' : 
                                            'purchases'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">
                  {language === 'hi' ? 'बकाया राशि' : 
                   language === 'bn' ? 'বকেয়া টাকা' : 
                   language === 'mr' ? 'थकबाकी रक्कम' : 
                   language === 'ta' ? 'நிலுவைத் தொகை' : 
                   language === 'te' ? 'బకాయి మొత్తం' : 
                   'Pending Amount'}
                </p>
                <p className="text-2xl font-bold">₹{totalPending.toFixed(2)}</p>
                <p className="text-red-200 text-xs">
                  {pendingPayments.length} {language === 'hi' ? 'लंबित' : 
                                           language === 'bn' ? 'বিচারাধীন' : 
                                           language === 'mr' ? 'प्रलंबित' : 
                                           language === 'ta' ? 'நிலுவையில்' : 
                                           language === 'te' ? 'పెండింగ్' : 
                                           'pending'}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">
                  {language === 'hi' ? 'कुल भुगतान' : 
                   language === 'bn' ? 'মোট পেমেন্ট' : 
                   language === 'mr' ? 'एकूण पेमेंट' : 
                   language === 'ta' ? 'மொத்த பணம்' : 
                   language === 'te' ? 'మొత్తం చెల్లింపు' : 
                   'Total Paid'}
                </p>
                <p className="text-2xl font-bold">
                  ₹{purchases.filter(p => p.paymentStatus === 'paid')
                    .reduce((sum, p) => sum + parseFloat(p.totalAmount), 0).toFixed(2)}
                </p>
                <p className="text-green-200 text-xs">
                  {purchases.filter(p => p.paymentStatus === 'paid').length} {language === 'hi' ? 'सफल' : 
                                                                             language === 'bn' ? 'সফল' : 
                                                                             language === 'mr' ? 'यशस्वी' : 
                                                                             language === 'ta' ? 'வெற்றி' : 
                                                                             language === 'te' ? 'విజయవంతం' : 
                                                                             'successful'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Tracker (Udhaar Tracker) */}
      <CreditTrackerComponent />

      {/* Daily Spending Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <span>
              {language === 'hi' ? 'दैनिक खर्च ग्राफ' : 
               language === 'bn' ? 'দৈনিক খরচের গ্রাফ' : 
               language === 'mr' ? 'दैनंदिन खर्चाचा आलेख' : 
               language === 'ta' ? 'தினசரி செலவு வரைபடம்' : 
               language === 'te' ? 'రోజువారీ ఖర్చు గ్రాఫ్' : 
               'Daily Spending Graph'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailySpendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`₹${value}`, language === 'hi' ? 'खर्च' : 
                                                    language === 'bn' ? 'খরচ' : 
                                                    language === 'mr' ? 'खर्च' : 
                                                    language === 'ta' ? 'செலவு' : 
                                                    language === 'te' ? 'ఖర్చు' : 
                                                    'Spend']}
                labelFormatter={(label) => `${language === 'hi' ? 'दिनांक' : 
                                           language === 'bn' ? 'তারিখ' : 
                                           language === 'mr' ? 'दिनांक' : 
                                           language === 'ta' ? 'தேதி' : 
                                           language === 'te' ? 'తేదీ' : 
                                           'Date'}: ${label}`}
              />
              <Bar dataKey="amount" fill="#ea580c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pay Now Button */}
      {totalPending > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-red-800">
                  {language === 'hi' ? 'भुगतान करें' : 
                   language === 'bn' ? 'পেমেন্ট করুন' : 
                   language === 'mr' ? 'पेमेंट करा' : 
                   language === 'ta' ? 'பணம் செலுத்து' : 
                   language === 'te' ? 'చెల్లింపు చేయండి' : 
                   'Make Payment'}
                </h3>
                <p className="text-red-600">
                  {language === 'hi' ? `₹${totalPending.toFixed(2)} की राशि बकाया है` : 
                   language === 'bn' ? `₹${totalPending.toFixed(2)} টাকা বকেয়া আছে` : 
                   language === 'mr' ? `₹${totalPending.toFixed(2)} रक्कम थकबाकी आहे` : 
                   language === 'ta' ? `₹${totalPending.toFixed(2)} தொকை நிলुவையில் உள்ளது` : 
                   language === 'te' ? `₹${totalPending.toFixed(2)} మొత్తం బకాయి ఉంది` : 
                   `₹${totalPending.toFixed(2)} amount is pending`}
                </p>
              </div>
              <Button 
                onClick={() => handlePayNow(totalPending)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                {language === 'hi' ? 'अभी भुगतान करें' : 
                 language === 'bn' ? 'এখনই পেমেন্ট করুন' : 
                 language === 'mr' ? 'आता पेमेंट करा' : 
                 language === 'ta' ? 'இப்போது பணம் செலுத்து' : 
                 language === 'te' ? 'ఇప్పుడే చెల్లించండి' : 
                 'Pay Now'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Purchases */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'hi' ? 'हाल की खरीदारी' : 
             language === 'bn' ? 'সাম্প্রতিক কেনাকাটা' : 
             language === 'mr' ? 'अलीकडील खरेदी' : 
             language === 'ta' ? 'சமீபத்திய வாங்குதல்' : 
             language === 'te' ? 'ఇటీవలి కొనుగోలు' : 
             'Recent Purchases'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {purchases.slice(0, 5).map((purchase) => (
              <div key={purchase.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{purchase.itemName}</h4>
                    <Badge 
                      variant={purchase.paymentStatus === 'paid' ? 'default' : 
                              purchase.paymentStatus === 'pending' ? 'secondary' : 'destructive'}
                    >
                      {purchase.paymentStatus === 'paid' ? 
                        (language === 'hi' ? 'भुगतान हो गया' : 
                         language === 'bn' ? 'পেমেন্ট হয়েছে' : 
                         language === 'mr' ? 'पेमेंट झाले' : 
                         language === 'ta' ? 'பணம் செலுத்தப்பட்டது' : 
                         language === 'te' ? 'చెల్లింపు జరిగింది' : 
                         'Paid') :
                       purchase.paymentStatus === 'pending' ? 
                        (language === 'hi' ? 'लंबित' : 
                         language === 'bn' ? 'বিচারাধীন' : 
                         language === 'mr' ? 'प्रलंबित' : 
                         language === 'ta' ? 'நிலுவையில்' : 
                         language === 'te' ? 'పెండింగ్' : 
                         'Pending') :
                        (language === 'hi' ? 'असफल' : 
                         language === 'bn' ? 'ব্যর্থ' : 
                         language === 'mr' ? 'अयशस्वी' : 
                         language === 'ta' ? 'தோல்வி' : 
                         language === 'te' ? 'విఫలమైంది' : 
                         'Failed')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {purchase.supplierName} • {purchase.quantity} {purchase.unit}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(purchase.purchaseDate), 'dd MMM yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{purchase.totalAmount}</p>
                  {purchase.paymentStatus === 'pending' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handlePayNow(parseFloat(purchase.totalAmount))}
                      className="mt-1"
                    >
                      {language === 'hi' ? 'भुगतान करें' : 
                       language === 'bn' ? 'পেমেন্ট করুন' : 
                       language === 'mr' ? 'पेमेंट करा' : 
                       language === 'ta' ? 'பணம் செலुத்து' : 
                       language === 'te' ? 'చెల్లించండి' : 
                       'Pay'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* UPI Payment Dialog */}
      <Dialog open={showUPIDialog} onOpenChange={setShowUPIDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-orange-600" />
              <span>
                {language === 'hi' ? 'UPI से भुगतान करें' : 
                 language === 'bn' ? 'UPI দিয়ে পেমেন্ট করুন' : 
                 language === 'mr' ? 'UPI ने पेमेंट करा' : 
                 language === 'ta' ? 'UPI மூலம் பணம் செலுத்து' : 
                 language === 'te' ? 'UPI తో చెల్లించండి' : 
                 'Pay with UPI'}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Amount Display */}
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {language === 'hi' ? 'भुगतान राशि' : 
                 language === 'bn' ? 'পেমেন্টের পরিমাণ' : 
                 language === 'mr' ? 'पेमेंट रक्कम' : 
                 language === 'ta' ? 'பணம் செலுத்தும் தொகை' : 
                 language === 'te' ? 'చెల్లింపు మొత్తం' : 
                 'Payment Amount'}
              </p>
              <p className="text-2xl font-bold text-orange-600">₹{pendingAmount.toFixed(2)}</p>
            </div>

            {/* QR Code Placeholder */}
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {language === 'hi' ? 'QR कोड स्कैन करें' : 
                     language === 'bn' ? 'QR কোড স্ক্যান করুন' : 
                     language === 'mr' ? 'QR कोड स्कॅन करा' : 
                     language === 'ta' ? 'QR குறியீட்டைத் தேடு' : 
                     language === 'te' ? 'QR కోడ్‌ను స్కాన్ చేయండి' : 
                     'Scan QR Code'}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* UPI Apps */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-center">
                {language === 'hi' ? 'या इन ऐप्स से भुगतान करें:' : 
                 language === 'bn' ? 'অথবা এই অ্যাপগুলি দিয়ে পেমেন্ট করুন:' : 
                 language === 'mr' ? 'किंवा या अॅप्सने पेमेंट करा:' : 
                 language === 'ta' ? 'அல்லது இந்த பயன்பாடுகளில் பணம் செலுத்து:' : 
                 language === 'te' ? 'లేదా ఈ యాప్‌లతో చెల్లించండి:' : 
                 'Or pay with these apps:'}
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-12"
                  onClick={() => window.open(generateUPILink(), '_blank')}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">GP</span>
                    </div>
                    <span>Google Pay</span>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-12"
                  onClick={() => window.open(generateUPILink(), '_blank')}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">PE</span>
                    </div>
                    <span>PhonePe</span>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-12"
                  onClick={() => window.open(generateUPILink(), '_blank')}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">PT</span>
                    </div>
                    <span>Paytm</span>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-12"
                  onClick={() => window.open(generateUPILink(), '_blank')}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AB</span>
                    </div>
                    <span>Any Bank</span>
                  </div>
                </Button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                {language === 'hi' ? 'भुगतान करने के बाद यह पेज बंद करें' : 
                 language === 'bn' ? 'পেমেন্ট করার পরে এই পৃষ্ঠাটি বন্ধ করুন' : 
                 language === 'mr' ? 'पेमेंट केल्यावर हे पेज बंद करा' : 
                 language === 'ta' ? 'பணம் செலுத்திய பிறகு இந்தப் பக்கத்தை மூடு' : 
                 language === 'te' ? 'చెల్లింపు చేసిన తర్వాత ఈ పేజీని మూసివేయండి' : 
                 'Close this page after payment'}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom padding for navigation */}
      <div className="h-20"></div>
    </div>
  );
}