import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Clock, TrendingDown, MapPin, RefreshCw, Plus } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { addHours } from 'date-fns';

interface GroupOrder {
  id: string;
  createdBy: string;
  supplierName: string;
  itemName: string;
  unit: string;
  targetQuantity: number;
  currentQuantity: number;
  pricePerUnit: string;
  discountedPrice: string;
  area: string;
  timeWindow: string;
  expiresAt: string;
  participants: string[];
}

interface GroupBuyingProps {
  supplierName?: string;
  itemName?: string;
  defaultArea?: string;
}

export function GroupBuying({ supplierName, itemName, defaultArea = "Karol Bagh" }: GroupBuyingProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedArea, setSelectedArea] = useState(defaultArea);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedGroupOrder, setSelectedGroupOrder] = useState<GroupOrder | null>(null);
  const [joinQuantity, setJoinQuantity] = useState(1);

  // Fetch active group orders
  const { data: groupOrders = [], isLoading } = useQuery<GroupOrder[]>({
    queryKey: ['/api/group-orders', selectedArea],
  });

  // Join group order mutation
  const joinMutation = useMutation({
    mutationFn: (data: { groupOrderId: string; vendorName: string; quantity: number }) =>
      fetch(`/api/group-orders/${data.groupOrderId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorName: data.vendorName,
          quantity: data.quantity,
        }),
      }).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: language === 'hi' ? 'सफलतापूर्वक शामिल हुए' : 
               language === 'bn' ? 'সফলভাবে যোগ দিয়েছেন' : 
               language === 'mr' ? 'यशस्वीरित्या सामील झाले' : 
               language === 'ta' ? 'வெற्றிकরமாக சேர्ந்தீர্கள்' : 
               language === 'te' ? 'విజయవంతంగా చేరారు' : 
               'Successfully Joined',
        description: language === 'hi' ? 'आप समूह ऑर्डर में शामिल हो गए हैं' : 
                     language === 'bn' ? 'আপনি গ্রুপ অর্ডারে যোগ দিয়েছেন' : 
                     language === 'mr' ? 'तुम्ही ग्रुप ऑर्डरमध्ये सामील झाला आहात' : 
                     language === 'ta' ? 'நீங்கள் குழு ஆர்டரில் சேர்ந்துள்ளீர்கள்' : 
                     language === 'te' ? 'మీరు గ్రూప్ ఆర్డర్‌లో చేరారు' : 
                     'You have joined the group order',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/group-orders'] });
      setShowJoinDialog(false);
      setSelectedGroupOrder(null);
    },
    onError: (error: any) => {
      toast({
        title: language === 'hi' ? 'त्रुटि' : 
               language === 'bn' ? 'ত্রুটি' : 
               language === 'mr' ? 'त्रुटी' : 
               language === 'ta' ? 'பிழை' : 
               language === 'te' ? 'లోపం' : 
               'Error',
        description: error.message || 'Failed to join group order',
        variant: 'destructive',
      });
    },
  });

  // Create new group order mutation
  const createMutation = useMutation({
    mutationFn: (data: any) =>
      fetch('/api/group-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: language === 'hi' ? 'समूह ऑर्डर बनाया गया' : 
               language === 'bn' ? 'গ্রুপ অর্ডার তৈরি হয়েছে' : 
               language === 'mr' ? 'ग्रुप ऑर्डर तयार केले' : 
               language === 'ta' ? 'குழு ஆர்டர் உருவாக்கப்பட்டது' : 
               language === 'te' ? 'గ్రూప్ ఆర్డర్ సృష్టించబడింది' : 
               'Group Order Created',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/group-orders'] });
      setShowCreateDialog(false);
    },
  });

  const handleJoinOrder = (groupOrder: GroupOrder) => {
    setSelectedGroupOrder(groupOrder);
    setShowJoinDialog(true);
  };

  const handleConfirmJoin = () => {
    if (selectedGroupOrder) {
      joinMutation.mutate({
        groupOrderId: selectedGroupOrder.id,
        vendorName: 'राम कुमार', // This would come from user session
        quantity: joinQuantity,
      });
    }
  };

  const handleCreateGroupOrder = () => {
    const expiresAt = addHours(new Date(), 2); // Expires in 2 hours
    
    createMutation.mutate({
      createdBy: 'राम कुमार', // This would come from user session
      supplierName: supplierName || 'राम वेजिटेबल मार्केट',
      itemName: itemName || 'प्याज',
      unit: 'kg',
      targetQuantity: 50,
      pricePerUnit: '25.00',
      discountedPrice: '22.00',
      area: selectedArea,
      timeWindow: '9-11am',
      expiresAt: expiresAt.toISOString(),
    });
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getSavingsAmount = (normalPrice: string, discountedPrice: string, quantity: number) => {
    const savings = (parseFloat(normalPrice) - parseFloat(discountedPrice)) * quantity;
    return savings.toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-orange-600" />
          <h3 className="font-semibold text-lg">
            {language === 'hi' ? 'समूह खरीदारी (सामान साथ)' : 
             language === 'bn' ? 'গ্রুপ কেনাকাটা (সামান সাথ)' : 
             language === 'mr' ? 'ग्रुप खरेदी (सामान साथ)' : 
             language === 'ta' ? 'குழু வாங்குதல் (சামान் சாথ)' : 
             language === 'te' ? 'గ్రూప్ కొనుగোలు (సామాన్ సాత్)' : 
             'Group Buying'}
          </h3>
        </div>
        <Button 
          onClick={handleCreateGroupOrder}
          size="sm"
          variant="outline"
          className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          {language === 'hi' ? 'नया ग्रुप' : 
           language === 'bn' ? 'নতুন গ্রুপ' : 
           language === 'mr' ? 'नवीन ग्रुप' : 
           language === 'ta' ? 'புதिয় குழு' : 
           language === 'te' ? 'కొత్త గ్రూప్' : 
           'Create New'}
        </Button>
      </div>

      {/* Area Selection */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <MapPin className="w-4 h-4" />
        <span>
          {language === 'hi' ? 'क्षेत्र:' : 
           language === 'bn' ? 'এলাকা:' : 
           language === 'mr' ? 'क्षेत्र:' : 
           language === 'ta' ? 'பகுতি:' : 
           language === 'te' ? 'ప్రాంতం:' : 
           'Area:'} {selectedArea}
        </span>
      </div>

      {/* Group Orders List */}
      {groupOrders.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="font-medium text-gray-600 mb-2">
              {language === 'hi' ? 'कोई सक्रिय ग्रुप ऑर्डर नहीं' : 
               language === 'bn' ? 'কোনো সক্রিয় গ্রুপ অর্ডার নেই' : 
               language === 'mr' ? 'कोणताही सक्रिय ग्रुप ऑर्डर नाही' : 
               language === 'ta' ? 'செयலில் உள്ள குழு ஆர்டর் இல्लै' : 
               language === 'te' ? 'చురుకైన గ్రూప్ ఆర్డర్‌లు లేవు' : 
               'No Active Group Orders'}
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              {language === 'hi' ? 'बड़ी मात्रा में सामान खरीदकर पैसे बचाएं' : 
               language === 'bn' ? 'বড় পরিমাণ কিনে টাকা সাশ্রয় করুন' : 
               language === 'mr' ? 'मोठ्या प्रमाणात खरेदी करून पैसे वाचवा' : 
               language === 'ta' ? 'பெரिய அளవில் வாङ்கி பணம் மிতপ്படুত্তুঙ্গল্' : 
               language === 'te' ? 'పెద్ద మొత్తంలో కొని డబ్బు ఆదా చేయండి' : 
               'Save money by buying in bulk with other vendors'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {groupOrders.map((order) => (
            <Card key={order.id} className="border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-sm">📦</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{order.itemName} - {order.supplierName}</h4>
                      <p className="text-sm text-gray-600">
                        {language === 'hi' ? 'बनाया गया:' : 
                         language === 'bn' ? 'তৈরিকর্তা:' : 
                         language === 'mr' ? 'निर्मात:' : 
                         language === 'ta' ? 'உরुवाक्कியवर्:' : 
                         language === 'te' ? 'సృష्টించినవাడు:' : 
                         'Created by:'} {order.createdBy} • {order.timeWindow}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleJoinOrder(order)}
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {language === 'hi' ? 'जुड़ें' : 
                     language === 'bn' ? 'যোগ দিন' : 
                     language === 'mr' ? 'सामील व्हा' : 
                     language === 'ta' ? 'சேर்' : 
                     language === 'te' ? 'చేరండి' : 
                     'Join Order'}
                  </Button>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">
                      {language === 'hi' ? 'प्रगति:' : 
                       language === 'bn' ? 'অগ্রগতি:' : 
                       language === 'mr' ? 'प्रगती:' : 
                       language === 'ta' ? 'মুন্নেত্রম্:' : 
                       language === 'te' ? 'పురోగতি:' : 
                       'Progress:'} {order.currentQuantity}/{order.targetQuantity} {order.unit}
                    </span>
                    <span className="text-orange-600 font-semibold">
                      {getProgressPercentage(order.currentQuantity, order.targetQuantity).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all"
                      style={{ width: `${getProgressPercentage(order.currentQuantity, order.targetQuantity)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex items-center space-x-4 mb-3">
                  <div className="text-sm">
                    <span className="text-gray-500 line-through">₹{order.pricePerUnit}</span>
                    <span className="text-green-600 font-semibold ml-2">₹{order.discountedPrice}</span>
                    <span className="text-gray-600">/{order.unit}</span>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    ₹{getSavingsAmount(order.pricePerUnit, order.discountedPrice, 1)} {language === 'hi' ? 'बचत' : 
                     language === 'bn' ? 'সাশ্রয়' : 
                     language === 'mr' ? 'बचत' : 
                     language === 'ta' ? 'मितব্যয়' : 
                     language === 'te' ? 'ఆదా' : 
                     'saved'}
                  </Badge>
                </div>

                {/* Expires */}
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {language === 'hi' ? 'समाप्त होता है:' : 
                   language === 'bn' ? 'শেষ হয়:' : 
                   language === 'mr' ? 'संपतो:' : 
                   language === 'ta' ? 'முடিयুম्:' : 
                   language === 'te' ? 'ముగుస్तుন্दি:' : 
                   'Expires:'} {new Date(order.expiresAt).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Join Order Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'hi' ? 'ग्रुप ऑर्डर में शामिल हों' : 
               language === 'bn' ? 'গ্রুপ অর্ডারে যোগ দিন' : 
               language === 'mr' ? 'ग्रुप ऑर्डरमध्ये सामील व्हा' : 
               language === 'ta' ? 'குழু ஆর্ডরில் சেરুঙ্গল্' : 
               language === 'te' ? 'గ్రూప్ ఆర్డర్‌లో చేరండి' : 
               'Join Group Order'}
            </DialogTitle>
          </DialogHeader>
          {selectedGroupOrder && (
            <div className="space-y-4">
              <div>
                <p><strong>{selectedGroupOrder.itemName}</strong> - {selectedGroupOrder.supplierName}</p>
                <p className="text-sm text-gray-600">₹{selectedGroupOrder.discountedPrice}/{selectedGroupOrder.unit}</p>
              </div>
              <div>
                <Label htmlFor="quantity">
                  {language === 'hi' ? 'मात्रा' : 
                   language === 'bn' ? 'পরিমাণ' : 
                   language === 'mr' ? 'प्रमाण' : 
                   language === 'ta' ? 'அள്वু' : 
                   language === 'te' ? 'పরిমाణం' : 
                   'Quantity'} ({selectedGroupOrder.unit})
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={joinQuantity}
                  onChange={(e) => setJoinQuantity(parseInt(e.target.value))}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
                  {language === 'hi' ? 'रद्द करें' : 
                   language === 'bn' ? 'বাতিল' : 
                   language === 'mr' ? 'रद्द करा' : 
                   language === 'ta' ? 'रद्द' : 
                   language === 'te' ? 'రద్దు' : 
                   'Cancel'}
                </Button>
                <Button onClick={handleConfirmJoin} disabled={joinMutation.isPending}>
                  {joinMutation.isPending ? 
                    (language === 'hi' ? 'शामिल हो रहे हैं...' : 
                     language === 'bn' ? 'যোগ দেওয়া হচ্ছে...' : 
                     language === 'mr' ? 'सामील होत आहे...' : 
                     language === 'ta' ? 'சেরুন্দு কोন্दু इরুक্কुদু...' : 
                     language === 'te' ? 'చేరుతున్నారు...' : 
                     'Joining...') :
                    (language === 'hi' ? 'शामिल हों' : 
                     language === 'bn' ? 'যোগ দিন' : 
                     language === 'mr' ? 'सामील व्हा' : 
                     language === 'ta' ? 'চেরু' : 
                     language === 'te' ? 'చేరండి' : 
                     'Join')
                  }
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}