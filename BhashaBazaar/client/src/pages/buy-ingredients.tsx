import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BottomNavigation } from '@/components/bottom-navigation';
import { FloatingHelpButton } from '@/components/floating-help-button';
import { GroupBuying } from '@/components/group-buying';
import { useLanguage } from '@/hooks/use-language';
import { getTranslation } from '@/lib/i18n';
import { MapPin, Star, ShoppingCart, Package, Truck, CheckCircle, Clock, Plus, Minus, Filter, ArrowLeft, ExternalLink, TrendingDown } from 'lucide-react';
import { useLocation } from 'wouter';
import { useState } from 'react';
import { BestDealsModal } from '@/components/best-deals-modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Supplier, SupplierProduct, CartItem, Order } from '@shared/schema';

interface ProductWithSupplier extends SupplierProduct {
  supplier: Supplier;
}

interface CartItemWithProduct extends CartItem {
  product: ProductWithSupplier;
}

export default function BuyIngredients() {
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [bestDealsProduct, setBestDealsProduct] = useState<string | null>(null);
  const [isBestDealsOpen, setIsBestDealsOpen] = useState(false);

  // Fetch marketplace products
  const { data: products = [], isLoading: isLoadingProducts, error } = useQuery<ProductWithSupplier[]>({
    queryKey: ['/api/marketplace/products'],
  });

  // Debug logging
  console.log('Products data:', products);
  console.log('Products loading:', isLoadingProducts);
  console.log('Products error:', error);

  // Fetch cart items
  const { data: cartItems = [], isLoading: isLoadingCart } = useQuery<CartItemWithProduct[]>({
    queryKey: ['/api/cart'],
  });

  // Fetch recent orders for reorder functionality
  const { data: recentOrders = [] } = useQuery<(Order & { supplier: Supplier })[]>({
    queryKey: ['/api/orders/recent'],
  });

  // Mutations
  const addToCartMutation = useMutation({
    mutationFn: async (item: { productId: string; quantity: number }) => {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!response.ok) throw new Error('Failed to add to cart');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: getTranslation(language, 'cart.added'),
        description: getTranslation(language, 'cart.addedDesc'),
      });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/cart/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to remove from cart');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: async (order: { supplierId: string; totalAmount: string; items: string; status: string }) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      if (!response.ok) throw new Error('Failed to place order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setIsCartOpen(false);
      toast({
        title: getTranslation(language, 'order.placed'),
        description: getTranslation(language, 'order.placedDesc'),
      });
    },
  });

  const categories = [
    { key: 'all', label: getTranslation(language, 'common.all'), emoji: '📦' },
    { key: 'vegetables', label: getTranslation(language, 'buy.vegetables'), emoji: '🥔' },
    { key: 'spices', label: getTranslation(language, 'buy.spices'), emoji: '🌶️' },
    { key: 'oil', label: getTranslation(language, 'buy.oil'), emoji: '🛢️' },
    { key: 'dairy', label: getTranslation(language, 'buy.dairy'), emoji: '🥛' },
    { key: 'meat', label: getTranslation(language, 'buy.meat'), emoji: '🥩' },
  ];

  const cities = ['all', 'Delhi', 'Mumbai', 'Pune', 'Kolkata', 'Bangalore'];

  const getProductName = (product: ProductWithSupplier) => {
    if (language === 'hi' && product.productNameHi) return product.productNameHi;
    if (language === 'bn' && product.productNameBn) return product.productNameBn;
    return product.productName;
  };

  const getSupplierName = (supplier: Supplier) => {
    if (language === 'hi' && supplier.nameHi) return supplier.nameHi;
    if (language === 'bn' && supplier.nameBn) return supplier.nameBn;
    return supplier.name;
  };

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    const cityMatch = selectedCity === 'all' || product.supplier.city === selectedCity;
    return categoryMatch && cityMatch;
  });

  // Debug filtered products
  console.log('Filtered products:', filteredProducts);
  console.log('Selected category:', selectedCategory);
  console.log('Selected city:', selectedCity);

  const handleAddToCart = (productId: string) => {
    const quantity = quantities[productId] || 1;
    addToCartMutation.mutate({ productId, quantity });
  };

  const handleQuantityChange = (productId: string, value: number) => {
    setQuantities(prev => ({ ...prev, [productId]: Math.max(1, value) }));
  };

  const handleReorder = (order: Order & { supplier: Supplier }) => {
    try {
      const orderItems = JSON.parse(order.items);
      orderItems.forEach((item: { productId: string; quantity: number }) => {
        addToCartMutation.mutate(item);
      });
      toast({
        title: getTranslation(language, 'order.reordered'),
        description: getTranslation(language, 'order.reorderedDesc'),
      });
    } catch (error) {
      console.error('Failed to reorder:', error);
    }
  };

  const calculateCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.product.pricePerUnit) * item.quantity);
    }, 0);
  };

  const handlePlaceOrder = (supplierId: string) => {
    const supplierItems = cartItems.filter(item => item.product.supplierId === supplierId);
    const totalAmount = supplierItems.reduce((total, item) => {
      return total + (parseFloat(item.product.pricePerUnit) * item.quantity);
    }, 0);

    const orderItems = supplierItems.map(item => ({
      productId: item.productId,
      productName: getProductName(item.product),
      quantity: item.quantity,
      pricePerUnit: item.product.pricePerUnit,
    }));

    placeOrderMutation.mutate({
      supplierId,
      totalAmount: totalAmount.toFixed(2),
      items: JSON.stringify(orderItems),
      status: 'pending',
    });
  };

  const groupedCartItems = cartItems.reduce((acc, item) => {
    const supplierId = item.product.supplierId;
    if (!acc[supplierId]) {
      acc[supplierId] = {
        supplier: item.product.supplier,
        items: [],
        total: 0,
      };
    }
    acc[supplierId].items.push(item);
    acc[supplierId].total += parseFloat(item.product.pricePerUnit) * item.quantity;
    return acc;
  }, {} as Record<string, { supplier: Supplier; items: CartItemWithProduct[]; total: number }>);

  if (isLoadingProducts) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <p>{getTranslation(language, 'common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-saffron-600 text-black p-4 fixed top-0 left-0 right-0 z-50 max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-black hover:bg-saffron-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{getTranslation(language, 'buy.title')}</h1>
              <p className="text-sm opacity-90">{getTranslation(language, 'buy.subtitle')}</p>
            </div>
          </div>
          <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="relative text-black hover:bg-saffron-700">
                <ShoppingCart className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-xs">
                    {cartItems.length}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{getTranslation(language, 'cart.title')}</DialogTitle>
                <DialogDescription>
                  {getTranslation(language, 'cart.description')}
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-96 overflow-y-auto space-y-4">
                {Object.values(groupedCartItems).map(group => (
                  <Card key={group.supplier.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <Package className="h-4 w-4" />
                        <span>{getSupplierName(group.supplier)}</span>
                        {group.supplier.verified && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {group.items.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span>{getProductName(item.product)}</span>
                          <div className="flex items-center space-x-2">
                            <span>{item.quantity} {item.product.unit}</span>
                            <span>₹{(parseFloat(item.product.pricePerUnit) * item.quantity).toFixed(2)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCartMutation.mutate(item.id)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex justify-between items-center">
                        <span className="font-medium">Total: ₹{group.total.toFixed(2)}</span>
                        <Button
                          size="sm"
                          onClick={() => handlePlaceOrder(group.supplier.id)}
                          disabled={placeOrderMutation.isPending}
                          className="bg-saffron-600 hover:bg-saffron-700"
                        >
                          {getTranslation(language, 'order.place')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {cartItems.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    {getTranslation(language, 'cart.empty')}
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Spacing for fixed header */}
      <div className="h-16"></div>

      {/* Filters */}
      <div className="p-4 bg-gray-50 space-y-3">
        <div className="flex space-x-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={getTranslation(language, 'filter.category')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.key} value={category.key}>
                  {category.emoji} {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={getTranslation(language, 'filter.city')} />
            </SelectTrigger>
            <SelectContent>
              {cities.map(city => (
                <SelectItem key={city} value={city}>
                  {city === 'all' ? getTranslation(language, 'common.all') : city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="products" className="px-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">
            <Package className="h-4 w-4 mr-2" />
            {getTranslation(language, 'marketplace.products')}
          </TabsTrigger>
          <TabsTrigger value="group">
            💬
            {language === 'hi' ? 'समूह खरीदारी' : 
             language === 'bn' ? 'সামান সাথ' : 
             language === 'mr' ? 'सामान साथ' : 
             language === 'ta' ? 'சமான் சாத்' : 
             language === 'te' ? 'సామాన్ సాత్' : 
             'Group Buy'}
          </TabsTrigger>
          <TabsTrigger value="reorder">
            <Clock className="h-4 w-4 mr-2" />
            {getTranslation(language, 'marketplace.reorder')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4 mt-4">
          {filteredProducts.map(product => (
            <Card key={product.id} className="border-l-4 border-l-saffron-500">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base">{getProductName(product)}</h3>
                    <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Package className="h-3 w-3 mr-1" />
                        {product.unit}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {categories.find(c => c.key === product.category)?.emoji} {product.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-saffron-600">
                      ₹{product.pricePerUnit}
                    </div>
                    <div className="text-xs text-gray-500">per {product.unit}</div>
                  </div>
                </div>

                {/* Supplier Info */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{getSupplierName(product.supplier)}</span>
                      {product.supplier.verified && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{product.supplier.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {product.supplier.city}
                      </span>
                      <span className="flex items-center">
                        <Truck className="h-3 w-3 mr-1" />
                        {product.supplier.deliveryTime}
                      </span>
                    </div>
                    <span>Min: ₹{product.supplier.minOrderAmount}</span>
                  </div>
                </div>

                {/* Shopping Controls - Two Button Layout */}
                <div className="space-y-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center justify-center space-x-4 bg-gray-50 rounded-lg py-3 px-4">
                    <span className="text-sm font-medium text-gray-700">
                      {language === 'hi' ? 'मात्रा:' : 'Qty:'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(product.id, Math.max(1, (quantities[product.id] || 1) - 1))}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={quantities[product.id] || 1}
                        onChange={(e) => handleQuantityChange(product.id, Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 text-center h-8"
                        min="1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-saffron-600">
                        ₹{(parseFloat(product.pricePerUnit) * (quantities[product.id] || 1)).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Two Button Grid Layout with Better Space Utilization */}
                  <div className="grid grid-cols-2 gap-4 px-2">
                    {/* Best Deals Button - Left */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setBestDealsProduct(getProductName(product));
                        setIsBestDealsOpen(true);
                      }}
                      className="h-14 w-full bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 hover:from-amber-100 hover:to-orange-100 hover:border-amber-400 transition-all duration-200 shadow-sm"
                    >
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <TrendingDown className="h-5 w-5 text-amber-600" />
                        <span className="text-sm font-semibold text-amber-700">
                          {language === 'hi' ? 'बेस्ट डील्स' : 'Best Deals'}
                        </span>
                      </div>
                    </Button>
                    
                    {/* Buy Now Button - Right */}
                    {product.onlineStoreUrl ? (
                      <Button
                        onClick={() => {
                          window.open(product.onlineStoreUrl!, '_blank');
                          toast({
                            title: language === 'hi' ? '🛒 खरीदारी शुरू करें' : '🛒 Shopping Started',
                            description: language === 'hi' 
                              ? `${quantities[product.id] || 1} ${product.unit} की खरीदारी` 
                              : `Shopping for ${quantities[product.id] || 1} ${product.unit}`,
                          });
                        }}
                        className="h-14 w-full bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-sm"
                      >
                        <div className="flex flex-col items-center justify-center space-y-1 text-white">
                          <ExternalLink className="h-5 w-5" />
                          <span className="text-sm font-semibold">
                            {language === 'hi' ? 'अभी खरीदें' : 
                             language === 'bn' ? 'এখনই কিনুন' : 
                             language === 'mr' ? 'आता खरेदী करा' : 
                             language === 'ta' ? 'இপ্পোधু ভাঙ্কবুম્' : 
                             language === 'te' ? 'ఇప్పుడు కొనండి' : 
                             'Buy Now'}
                          </span>
                        </div>
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleAddToCart(product.id)}
                        disabled={addToCartMutation.isPending}
                        className="h-14 w-full bg-gradient-to-br from-saffron-600 to-orange-600 hover:from-saffron-700 hover:to-orange-700 transition-all duration-200 shadow-sm"
                      >
                        <div className="flex flex-col items-center justify-center space-y-1 text-white">
                          <ShoppingCart className="h-5 w-5" />
                          <span className="text-sm font-semibold">
                            {language === 'hi' ? 'कार्ट में डालें' : 'Add to Cart'}
                          </span>
                        </div>
                      </Button>
                    )}
                  </div>
                </div>
                </CardContent>
            </Card>
          ))}

          {filteredProducts.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">{getTranslation(language, 'marketplace.noProducts')}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="group" className="space-y-4 mt-4">
          <GroupBuying defaultArea="Karol Bagh" />
        </TabsContent>

        <TabsContent value="reorder" className="space-y-4 mt-4">
          {recentOrders.map(order => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{getSupplierName(order.supplier)}</h3>
                    <p className="text-sm text-gray-600">
                      {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'Unknown date'}
                    </p>
                    <div className="text-lg font-bold text-saffron-600 mt-1">
                      ₹{order.totalAmount}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleReorder(order)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {language === 'hi' ? 'फिर से ऑर्डर करें' : 'Reorder'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {recentOrders.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600">{language === 'hi' ? 'कोई पिछले ऑर्डर नहीं मिले' : 'No recent orders found'}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <BestDealsModal
        isOpen={isBestDealsOpen}
        onClose={() => {
          setIsBestDealsOpen(false);
          setBestDealsProduct('');
        }}
        productName={bestDealsProduct || ''}
      />
    </div>
  );
}