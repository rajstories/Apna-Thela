import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HelpModal } from '@/components/help-modal';
import { useLanguage } from '@/hooks/use-language';
import { getTranslation } from '@/lib/i18n';
import { MessageCircle } from 'lucide-react';

export function FloatingHelpButton() {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const { language } = useLanguage();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white hover:bg-opacity-30 mr-1 rounded-full transition-all duration-200 hover:scale-110"
        onClick={() => setShowHelpModal(true)}
        title={getTranslation(language, 'help.title')}
      >
        <MessageCircle className="w-5 h-5" />
      </Button>

      <HelpModal 
        open={showHelpModal} 
        onClose={() => setShowHelpModal(false)} 
      />
    </>
  );
}