import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BottomNavigation } from '@/components/bottom-navigation';
import { VoiceInputButton } from '@/components/voice-input-button';
import { FloatingHelpButton } from '@/components/floating-help-button';
import { TapInventoryCard } from '@/components/tap-inventory-card';
import { useLanguage } from '@/hooks/use-language';
import { getTranslation } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Plus, ArrowLeft, AlertTriangle, Package, TrendingUp, Mic, MicOff, Grid, List } from 'lucide-react';
import { useLocation } from 'wouter';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { InventoryItem, InsertInventoryItem, StockUpdate } from '@shared/schema';

export default function Inventory() {
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showStockUpdateDialog, setShowStockUpdateDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [stockUpdateQuantity, setStockUpdateQuantity] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [newItem, setNewItem] = useState<Partial<InsertInventoryItem>>({
    name: '',
    nameHi: '',
    nameBn: '',
    category: '',
    quantity: 0,
    unit: '',
    minThreshold: 5,
    pricePerUnit: '0',
  });

  // Query definitions
  const { data: inventoryItems, isLoading } = useQuery<InventoryItem[]>({
    queryKey: ['/api/inventory'],
  });

  const { data: lowStockItems } = useQuery<InventoryItem[]>({
    queryKey: ['/api/inventory/low-stock'],
  });

  // Stock alerts effect
  useEffect(() => {
    if (lowStockItems && lowStockItems.length > 0) {
      lowStockItems.forEach(item => {
        toast({
          title: getTranslation(language, 'inventory.stockAlert'),
          description: `${getTranslation(language, 'inventory.lowStockAlert')} ${item.name}`,
          variant: "destructive",
        });
      });
    }
  }, [lowStockItems, language, toast]);

  const addItemMutation = useMutation({
    mutationFn: (item: InsertInventoryItem) => 
      apiRequest('POST', '/api/inventory', item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/low-stock'] });
      setShowAddDialog(false);
      setNewItem({
        name: '',
        nameHi: '',
        nameBn: '',
        category: '',
        quantity: 0,
        unit: '',
        minThreshold: 5,
        pricePerUnit: '0',
      });
      toast({
        title: "Success",
        description: "Inventory item added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add inventory item",
        variant: "destructive",
      });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      apiRequest('PATCH', `/api/inventory/${id}`, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/low-stock'] });
      setShowStockUpdateDialog(false);
      setStockUpdateQuantity('');
      setSelectedItem(null);
      toast({
        title: getTranslation(language, 'common.ok'),
        description: getTranslation(language, 'inventory.updateStock'),
      });
    },
    onError: () => {
      toast({
        title: getTranslation(language, 'common.error'),
        description: "Failed to update quantity",
        variant: "destructive",
      });
    },
  });

  // Voice input handler for stock updates
  const handleVoiceStockUpdate = (transcript: string) => {
    const numberMatch = transcript.match(/\d+/);
    if (numberMatch) {
      setStockUpdateQuantity(numberMatch[0]);
      setIsVoiceMode(false);
    }
  };

  // Function to open stock update dialog
  const openStockUpdate = (item: InventoryItem) => {
    setSelectedItem(item);
    setStockUpdateQuantity(item.quantity?.toString() || '0');
    setShowStockUpdateDialog(true);
  };

  // Usage data query for selected item
  const { data: usageData } = useQuery<StockUpdate[]>({
    queryKey: ['/api/inventory', selectedItem?.id, 'usage'],
    queryFn: () => fetch(`/api/inventory/${selectedItem?.id}/usage?days=7`).then(res => res.json()),
    enabled: !!selectedItem?.id,
  });

  // Transform usage data for chart
  const chartData = usageData?.map(update => ({
    date: new Date(update.createdAt!).toLocaleDateString(),
    stock: update.newQuantity,
    change: update.newQuantity - update.previousQuantity,
  })) || [];

  const getItemName = (item: InventoryItem) => {
    if (language === 'hi' && item.nameHi) return item.nameHi;
    if (language === 'bn' && item.nameBn) return item.nameBn;
    return item.name;
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.category || !newItem.unit) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    addItemMutation.mutate(newItem as InsertInventoryItem);
  };

  const handleQuantityUpdate = (id: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    updateQuantityMutation.mutate({ id, quantity: newQuantity });
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <p>{getTranslation(language, 'common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <header className="bg-saffron text-white p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white hover:bg-opacity-20 mr-3"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">{getTranslation(language, 'inventory.title')}</h1>
              <p className="text-sm opacity-90">{inventoryItems?.length || 0} items</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white hover:bg-opacity-20"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Low Stock Alert */}
      {lowStockItems && lowStockItems.length > 0 && (
        <section className="p-4">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 mr-2" />
                <h3 className="font-semibold text-amber-800">
                  {getTranslation(language, 'inventory.lowStock')}
                </h3>
              </div>
              <p className="text-sm text-amber-700">
                {lowStockItems.length} items are running low
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Main Content */}
      <Tabs defaultValue="tap" className="px-4">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="tap" className="flex items-center space-x-2">
            <Grid className="h-4 w-4" />
            <span>
              {language === 'hi' ? 'टैप व्यू' : 
               language === 'bn' ? 'ট্যাপ ভিউ' : 
               language === 'mr' ? 'टॅप व्ह्यू' :
               language === 'ta' ? 'டேப் பார்வை' :
               language === 'te' ? 'టాప్ వీక్షణ' :
               'Tap View'}
            </span>
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center space-x-2">
            <List className="h-4 w-4" />
            <span>
              {language === 'hi' ? 'डिटेल्स' : 
               language === 'bn' ? 'বিস্তারিত' : 
               language === 'mr' ? 'तपशील' :
               language === 'ta' ? 'விவரங்கள்' :
               language === 'te' ? 'వివరాలు' :
               'Details'}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tap" className="space-y-4">
          {inventoryItems?.map((item) => (
            <TapInventoryCard key={item.id} item={item} />
          ))}
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {inventoryItems?.map((item) => {
            const isLowStock = (item.quantity || 0) <= (item.minThreshold || 5);
            return (
              <Card 
                key={item.id} 
                className={`border ${isLowStock ? 'border-amber-200 bg-amber-50' : 'border-gray-200'}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">
                        {getItemName(item)}
                      </h4>
                      <p className="text-sm text-gray-500 capitalize">{item.category}</p>
                      {isLowStock && (
                        <div className="flex items-center text-xs text-amber-600 mt-1">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Low stock
                        </div>
                      )}
                    </div>
                    <div className="text-2xl">
                      {item.category === 'vegetables' && '🥔'}
                      {item.category === 'spices' && '🌶️'}
                      {item.category === 'oil' && '🛢️'}
                      {!['vegetables', 'spices', 'oil'].includes(item.category) && '📦'}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500">{getTranslation(language, 'inventory.quantity')}</p>
                      <p className="font-semibold">{item.quantity || 0} {item.unit}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{getTranslation(language, 'inventory.price')}</p>
                      <p className="font-semibold">₹{item.pricePerUnit}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{getTranslation(language, 'inventory.threshold')}</p>
                      <p className="font-semibold">{item.minThreshold}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityUpdate(item.id, (item.quantity || 0) - 1)}
                        disabled={updateQuantityMutation.isPending}
                        className="px-4 py-2"
                      >
                        -
                      </Button>
                      <span className="flex-1 text-center py-2 text-lg font-bold bg-gray-50 rounded">
                        {item.quantity || 0}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityUpdate(item.id, (item.quantity || 0) + 1)}
                        disabled={updateQuantityMutation.isPending}
                        className="px-4 py-2"
                      >
                        +
                      </Button>
                    </div>
                    
                    {/* Voice Update & Analytics Button */}
                    <Button
                      onClick={() => openStockUpdate(item)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3"
                      size="lg"
                    >
                      <Mic className="h-5 w-5 mr-2" />
                      {getTranslation(language, 'inventory.voiceUpdate')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {(!inventoryItems || inventoryItems.length === 0) && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No inventory items</h3>
              <p className="text-gray-500 mb-4">Start by adding your first inventory item</p>
              <Button onClick={() => setShowAddDialog(true)} className="bg-saffron hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                {getTranslation(language, 'inventory.addItem')}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>{getTranslation(language, 'inventory.addItem')}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Item Name (English)</Label>
              <Input
                id="name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="e.g., Potatoes"
              />
            </div>
            
            <div>
              <Label htmlFor="nameHi">Item Name (Hindi)</Label>
              <Input
                id="nameHi"
                value={newItem.nameHi || ''}
                onChange={(e) => setNewItem({ ...newItem, nameHi: e.target.value })}
                placeholder="e.g., आलू"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                placeholder="e.g., vegetables"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">{getTranslation(language, 'inventory.quantity')}</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newItem.quantity || 0}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="unit">{getTranslation(language, 'inventory.unit')}</Label>
                <Input
                  id="unit"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  placeholder="kg, pieces"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">{getTranslation(language, 'inventory.price')}</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newItem.pricePerUnit || '0'}
                  onChange={(e) => setNewItem({ ...newItem, pricePerUnit: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="threshold">{getTranslation(language, 'inventory.threshold')}</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={newItem.minThreshold || 5}
                  onChange={(e) => setNewItem({ ...newItem, minThreshold: parseInt(e.target.value) || 5 })}
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                {getTranslation(language, 'common.cancel')}
              </Button>
              <Button 
                onClick={handleAddItem} 
                disabled={addItemMutation.isPending}
                className="flex-1 bg-saffron hover:bg-orange-600"
              >
                {getTranslation(language, 'common.save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Update Dialog with Voice Input and Charts */}
      <Dialog open={showStockUpdateDialog} onOpenChange={setShowStockUpdateDialog}>
        <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getTranslation(language, 'inventory.updateStock')}</DialogTitle>
            <DialogDescription>
              {selectedItem ? getItemName(selectedItem) : ''} - {getTranslation(language, 'inventory.usageChart')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Current Stock Display */}
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">{getTranslation(language, 'inventory.stockLevel')}</p>
              <p className="text-3xl font-bold text-saffron-600">
                {selectedItem?.quantity || 0} {selectedItem?.unit}
              </p>
            </div>

            {/* Usage Chart */}
            {chartData && chartData.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{getTranslation(language, 'inventory.usageChart')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="stock" 
                        stroke="#f59e0b" 
                        strokeWidth={3}
                        dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">{getTranslation(language, 'inventory.noUsageData')}</p>
                </CardContent>
              </Card>
            )}

            {/* Voice Input Section */}
            <div className="space-y-4">
              <Label htmlFor="stock-quantity">{getTranslation(language, 'inventory.quantity')}</Label>
              <div className="flex space-x-2">
                <Input
                  id="stock-quantity"
                  type="number"
                  value={stockUpdateQuantity}
                  onChange={(e) => setStockUpdateQuantity(e.target.value)}
                  placeholder="Enter new quantity"
                  className="flex-1 text-lg py-3"
                />
                <VoiceInputButton
                  onTranscript={handleVoiceStockUpdate}
                  isActive={isVoiceMode}
                  onActiveChange={setIsVoiceMode}
                  className="px-4 py-3"
                >
                  {isVoiceMode ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </VoiceInputButton>
              </div>
              <p className="text-sm text-gray-500">
                {getTranslation(language, 'inventory.voiceInstruction')}: Say the new quantity number
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowStockUpdateDialog(false)}
                className="flex-1 py-3"
                size="lg"
              >
                {getTranslation(language, 'common.cancel')}
              </Button>
              <Button
                onClick={() => {
                  const quantity = parseInt(stockUpdateQuantity);
                  if (selectedItem && !isNaN(quantity) && quantity >= 0) {
                    updateQuantityMutation.mutate({ id: selectedItem.id, quantity });
                  }
                }}
                disabled={updateQuantityMutation.isPending || !stockUpdateQuantity}
                className="flex-1 bg-saffron-500 hover:bg-saffron-600 py-3"
                size="lg"
              >
                {updateQuantityMutation.isPending ? (
                  getTranslation(language, 'common.loading')
                ) : (
                  getTranslation(language, 'inventory.updateStock')
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom padding for navigation */}
      <div className="h-20"></div>

      {/* Floating Help Button */}
      <FloatingHelpButton />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
