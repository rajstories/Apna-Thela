import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { useSpeech } from '@/hooks/use-speech';
import { apiRequest } from '@/lib/queryClient';
import { Mic } from 'lucide-react';
import type { InventoryItem } from '@shared/schema';

interface TapInventoryCardProps {
  item: InventoryItem;
}

export function TapInventoryCard({ item }: TapInventoryCardProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isListening, setIsListening] = useState(false);

  const updateStatusMutation = useMutation({
    mutationFn: (stockStatus: string) =>
      apiRequest('PATCH', `/api/inventory/${item.id}/status`, { stockStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/low-stock'] });
      toast({
        title: language === 'hi' ? 'अपडेट हो गया' : 
               language === 'bn' ? 'আপডেট হয়েছে' : 
               language === 'mr' ? 'अपडेट झाले' :
               language === 'ta' ? 'புதுப்பிக்கப்பட்டது' :
               language === 'te' ? 'నవీకరించబడింది' :
               'Status Updated',
        description: getItemName() + ' ' + (language === 'hi' ? 'का स्टेटस अपडेट हुआ' : 'status updated'),
      });
    },
    onError: () => {
      toast({
        title: language === 'hi' ? 'एरर' : 'Error',
        description: language === 'hi' ? 'स्टेटस अपडेट नहीं हो सका' : 'Failed to update status',
        variant: 'destructive',
      });
    },
  });

  const getItemName = () => {
    if (language === 'hi' && item.nameHi) return item.nameHi;
    if (language === 'bn' && item.nameBn) return item.nameBn;
    return item.name;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'full': return 'bg-green-500 border-green-600';
      case 'low': return 'bg-orange-500 border-orange-600';
      case 'empty': return 'bg-red-500 border-red-600';
      default: return 'bg-gray-500 border-gray-600';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'full': return '🟢';
      case 'low': return '🟠';
      case 'empty': return '🔴';
      default: return '⚪';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'full': return language === 'hi' ? 'भरपूर' : 
                           language === 'bn' ? 'পূর্ণ' : 
                           language === 'mr' ? 'भरपूर' :
                           language === 'ta' ? 'முழு' :
                           language === 'te' ? 'నిండిన' :
                           'Full';
      case 'low': return language === 'hi' ? 'कम' : 
                          language === 'bn' ? 'কম' : 
                          language === 'mr' ? 'कमी' :
                          language === 'ta' ? 'குறைவு' :
                          language === 'te' ? 'తక్కువ' :
                          'Low';
      case 'empty': return language === 'hi' ? 'खाली' : 
                            language === 'bn' ? 'খালি' : 
                            language === 'mr' ? 'रिकामे' :
                            language === 'ta' ? 'காலி' :
                            language === 'te' ? 'ఖాళీ' :
                            'Empty';
      default: return 'Unknown';
    }
  };

  const { startListening, isSupported } = useSpeech();

  const handleVoiceInput = async () => {
    if (!isSupported) {
      toast({
        title: language === 'hi' ? 'एरर' : 'Error',
        description: language === 'hi' ? 'वॉयस इनपुट सपोर्ट नहीं है' : 'Voice input not supported',
        variant: 'destructive',
      });
      return;
    }

    setIsListening(true);
    
    try {
      const transcript = await startListening(language);
      if (transcript) {
        const normalizedText = transcript.toLowerCase().trim();
        
        // Voice recognition for different languages
        if (normalizedText.includes('full') || normalizedText.includes('भरपूर') || 
            normalizedText.includes('ভরপুর') || normalizedText.includes('भरपूर') ||
            normalizedText.includes('முழு') || normalizedText.includes('నిండిన')) {
          updateStatusMutation.mutate('full');
        } else if (normalizedText.includes('low') || normalizedText.includes('कम') || 
                   normalizedText.includes('কম') || normalizedText.includes('कमী') ||
                   normalizedText.includes('குறைவு') || normalizedText.includes('తక్కువ')) {
          updateStatusMutation.mutate('low');
        } else if (normalizedText.includes('empty') || normalizedText.includes('खाली') || 
                   normalizedText.includes('খালি') || normalizedText.includes('रिकामे') ||
                   normalizedText.includes('காலி') || normalizedText.includes('ఖాళీ')) {
          updateStatusMutation.mutate('empty');
        } else {
          toast({
            title: language === 'hi' ? 'समझ नहीं आया' : 'Not understood',
            description: language === 'hi' ? '"भरपूर", "कम", या "खाली" कहें' : 'Say "full", "low", or "empty"',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      toast({
        title: language === 'hi' ? 'एरर' : 'Error',
        description: language === 'hi' ? 'वॉयस इनपुट में समस्या' : 'Voice input failed',
        variant: 'destructive',
      });
    } finally {
      setIsListening(false);
    }
  };

  return (
    <Card className="border-2 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Item Info */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-semibold text-lg">{getItemName()}</h3>
            <p className="text-sm text-gray-500">{item.category} • {item.quantity} {item.unit}</p>
          </div>
          <Button
            onClick={handleVoiceInput}
            size="sm"
            variant="outline"
            className={`ml-2 ${isListening ? 'bg-red-100 text-red-600' : ''}`}
            disabled={updateStatusMutation.isPending}
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>

        {/* Status Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => updateStatusMutation.mutate('full')}
            disabled={updateStatusMutation.isPending}
            className={`h-16 flex flex-col items-center justify-center text-white transition-all ${
              item.stockStatus === 'full' 
                ? 'bg-green-600 border-4 border-green-800 scale-105' 
                : 'bg-green-500 hover:bg-green-600 border-2 border-green-600'
            }`}
          >
            <span className="text-2xl mb-1">🟢</span>
            <span className="text-xs font-medium">{getStatusText('full')}</span>
          </Button>

          <Button
            onClick={() => updateStatusMutation.mutate('low')}
            disabled={updateStatusMutation.isPending}
            className={`h-16 flex flex-col items-center justify-center text-white transition-all ${
              item.stockStatus === 'low' 
                ? 'bg-orange-600 border-4 border-orange-800 scale-105' 
                : 'bg-orange-500 hover:bg-orange-600 border-2 border-orange-600'
            }`}
          >
            <span className="text-2xl mb-1">🟠</span>
            <span className="text-xs font-medium">{getStatusText('low')}</span>
          </Button>

          <Button
            onClick={() => updateStatusMutation.mutate('empty')}
            disabled={updateStatusMutation.isPending}
            className={`h-16 flex flex-col items-center justify-center text-white transition-all ${
              item.stockStatus === 'empty' 
                ? 'bg-red-600 border-4 border-red-800 scale-105' 
                : 'bg-red-500 hover:bg-red-600 border-2 border-red-600'
            }`}
          >
            <span className="text-2xl mb-1">🔴</span>
            <span className="text-xs font-medium">{getStatusText('empty')}</span>
          </Button>
        </div>

        {/* Current Status Display */}
        <div className="mt-3 text-center">
          <span className="text-sm text-gray-600">
            {language === 'hi' ? 'मौजूदा स्थिति:' : 'Current Status:'} 
          </span>
          <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(item.stockStatus || 'full')}`}>
            {getStatusEmoji(item.stockStatus || 'full')} {getStatusText(item.stockStatus || 'full')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}