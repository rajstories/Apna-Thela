import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HelpModal } from '@/components/help-modal';
import { useLanguage } from '@/hooks/use-language';
import { getTranslation } from '@/lib/i18n';
import { HelpCircle } from 'lucide-react';

export function FloatingHelpButton() {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const { language } = useLanguage();

  return (
    <>
      <Button
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg z-30 animate-pulse"
        onClick={() => setShowHelpModal(true)}
        title={getTranslation(language, 'help.title')}
      >
        <HelpCircle className="w-6 h-6" />
      </Button>

      <HelpModal 
        open={showHelpModal} 
        onClose={() => setShowHelpModal(false)} 
      />
    </>
  );
}