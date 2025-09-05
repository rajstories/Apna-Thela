import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HelpModal } from '@/components/help-modal';
import { useLanguage } from '@/hooks/use-language';
import { getTranslation } from '@/lib/i18n';
import { Headphones } from 'lucide-react';

export function FloatingHelpButton() {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const { language } = useLanguage();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white hover:bg-opacity-20 mr-2"
        onClick={() => setShowHelpModal(true)}
        title={getTranslation(language, 'help.title')}
      >
        <Headphones className="w-5 h-5" />
      </Button>

      <HelpModal 
        open={showHelpModal} 
        onClose={() => setShowHelpModal(false)} 
      />
    </>
  );
}