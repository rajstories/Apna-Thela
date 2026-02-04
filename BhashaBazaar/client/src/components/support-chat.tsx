import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useLanguage } from '@/hooks/use-language';
import { useSpeech } from '@/hooks/use-speech';
import { ArrowLeft, Send, Mic, ExternalLink } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface SupportChatProps {
  open: boolean;
  onClose: () => void;
  initialMessage?: string;
}

export function SupportChat({ open, onClose, initialMessage = '' }: SupportChatProps) {
  const { language } = useLanguage();
  const { startListening, isListening } = useSpeech();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message and pre-fill input if provided
  useEffect(() => {
    if (open && messages.length === 0) {
      const welcomeMessage = language === 'hi' ? 
        '👋 नमस्ते! अपना ठेला में आपका स्वागत है। आप क्या पूछना चाहेंगे?' :
        '👋 Hello! Welcome to Apna Thela. What would you like to ask?';
      
      setMessages([{
        id: '1',
        text: welcomeMessage,
        isUser: false,
        timestamp: new Date()
      }]);
    }
    
    // Pre-fill input with initial message if provided
    if (open && initialMessage) {
      setInputText(initialMessage);
    }
  }, [open, language, initialMessage]);

  // Smart bot reply logic with enhanced responses
  const getBotReply = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    const isHindi = language === 'hi' || /[ऀ-ॿ]/.test(userMessage);

    // Registration help
    if (msg.includes('register') || msg.includes('रजिस्टर') || msg.includes('कैसे register करें') || msg.includes('sign up') || msg.includes('साइन अप')) {
      return isHindi ?
        '📋 आप हमारे होम स्क्रीन से "Profile" बटन दबाकर आसानी से अपना ठेला चालू कर सकते हैं। फ़ोन नंबर डालें, OTP वेरिफाई करें और अपनी जानकारी भरें।' :
        '📋 You can easily start your thela by clicking the "Profile" button on our home screen. Enter your phone number, verify OTP and fill your information.';
    }

    // Supplier rates inquiry
    if (msg.includes('supplier') || msg.includes('सप्लायर') || msg.includes('rate') || msg.includes('रेट') || msg.includes('price') || msg.includes('कीमत')) {
      return isHindi ?
        '💰 सप्लायर के रेट देखने के लिए "Buy Ingredients" सेक्शन में जाएं। वहां आपको सभी सप्लायर की कीमतें और संपर्क जानकारी मिलेगी।' :
        '💰 To check supplier rates, go to "Buy Ingredients" section. There you will find all supplier prices and contact information.';
    }

    // Delivery timing
    if (msg.includes('delivery') || msg.includes('डिलीवरी') || msg.includes('कब होती है') || msg.includes('time') || msg.includes('समय')) {
      return isHindi ?
        '🚚 डिलीवरी आमतौर पर ऑर्डर के 24-48 घंटे में हो जाती है। आपातकालीन ऑर्डर के लिए सप्लायर से सीधे बात करें।' :
        '🚚 Delivery usually happens within 24-48 hours of order. For emergency orders, contact suppliers directly.';
    }

    // Payment methods
    if (msg.includes('payment') || msg.includes('भुगतान') || msg.includes('pay') || msg.includes('upi') || msg.includes('money') || msg.includes('पैसा')) {
      return isHindi ?
        '💳 भुगतान UPI, कैश या ऑनलाइन से कर सकते हैं। वॉलेट सेक्शन में जाकर अपने खर्च ट्रैक करें और पेमेंट हिस्ट्री देखें।' :
        '💳 You can pay via UPI, cash or online. Go to wallet section to track your expenses and view payment history.';
    }

    // Stock management
    if (msg.includes('stock') || msg.includes('स्टॉक') || msg.includes('inventory') || msg.includes('समान') || msg.includes('सामान')) {
      return isHindi ? 
        '🧾 अपना स्टॉक "Manage Inventory" से देख सकते हैं। कम स्टॉक की अलर्ट भी मिलती है। Voice Order भी कर सकते हैं।' :
        '🧾 You can view your stock from "Manage Inventory". You also get low stock alerts. Voice orders are also available.';
    }

    // General help
    if (msg.includes('help') || msg.includes('मदद') || msg.includes('how') || msg.includes('कैसे') || msg.includes('use') || msg.includes('इस्तेमाल')) {
      return isHindi ?
        '📱 ऐप में 4 मुख्य सेक्शन हैं: Buy Ingredients (सामान खरीदें), Manage Inventory (स्टॉक देखें), Wallet (पैसे ट्रैक करें), Profile (प्रोफाइल)। कोई भी सवाल हो तो पूछिए!' :
        '📱 App has 4 main sections: Buy Ingredients, Manage Inventory, Wallet, Profile. Ask me anything!';
    }

    // Default response
    return isHindi ?
      '💬 मैं आपकी मदद कर सकता हूं। कोई खास सवाल है? नीचे दिए गए बटन भी दबा सकते हैं।' :
      '💬 I can help you. Any specific question? You can also click the buttons below.';
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Show typing indicator
    setIsTyping(true);

    // Simulate bot response delay (1-2 seconds for realism)
    setTimeout(() => {
      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotReply(text),
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botReply]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // 1-2 second delay
  };

  const handleVoiceInput = () => {
    const voiceLanguage = language === 'hi' ? 'hi-IN' : 'en-US';
    
    startListening(voiceLanguage).then((transcript: string | null) => {
      if (!transcript) return;
      setInputText(transcript);
      
      // Show voice message indicator
      const voiceMessage: Message = {
        id: Date.now().toString(),
        text: '🎤 (voice message sent)',
        isUser: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, voiceMessage]);
      
      // Auto-send after voice input
      setTimeout(() => {
        sendMessage(transcript);
      }, 500);
    }).catch(() => {
      // Handle error silently
    });
  };

  // Pre-defined questions
  const quickQuestions = language === 'hi' ? [
    'कैसे register करें?',
    'Supplier के rate कैसे देखें?',
    'Delivery कब होती है?',
    'Payment कैसे करें?'
  ] : [
    'How to register?',
    'How to check supplier rates?',
    'When is delivery?',
    'How to make payment?'
  ];

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-md h-[90vh] flex flex-col">
        <DialogTitle className="sr-only">
          {language === 'hi' ? 'अपना ठेला सपोर्ट चैट' : 'Apna Thela Support Chat'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {language === 'hi' ? 'ग्राहक सेवा चैट इंटरफेस' : 'Customer support chat interface'}
        </DialogDescription>
        {/* Header */}
        <div className="bg-green-600 text-white p-4 flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-green-700 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="font-semibold">
              {language === 'hi' ? 'अपना ठेला सपोर्ट' : 'Apna Thela Support'}
            </h2>
            <p className="text-xs opacity-90">
              {language === 'hi' ? 'ऑनलाइन • तुरंत जवाब' : 'Online • Instant replies'}
            </p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isUser
                    ? 'bg-green-500 text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.isUser ? 'text-green-100' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 rounded-lg rounded-bl-none shadow-sm px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions - Show only if no messages yet or just welcome message */}
        {messages.length <= 1 && (
          <div className="px-4 py-2 border-t bg-gray-50">
            <p className="text-xs text-gray-600 mb-2">
              {language === 'hi' ? 'आम सवाल:' : 'Common questions:'}
            </p>
            <div className="grid grid-cols-1 gap-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickQuestion(question)}
                  className="text-xs text-left justify-start h-auto py-2 px-3 bg-white hover:bg-blue-50 border-blue-200"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* WhatsApp Contact Banner */}
        <div className="bg-blue-50 border-t border-blue-200 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-blue-700">
              {language === 'hi' ? 
                'व्हाट्सऐप पर तुरंत मदद पाएं:' : 
                'Get instant help on WhatsApp:'
              }
            </p>
            <Button
              size="sm"
              onClick={() => window.open('https://wa.me/919958262272?text=Namaste%20team%2C%20mujhe%20madad%20chahiye', '_blank')}
              className="bg-green-600 hover:bg-green-700 text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              {language === 'hi' ? 'चैट करें' : 'Chat'}
            </Button>
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t bg-white p-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={language === 'hi' ? 'मैसेज टाइप करें...' : 'Type a message...'}
                className="pr-10"
              />
              <Button
                onClick={handleVoiceInput}
                disabled={isListening}
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-600"
              >
                <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse text-red-500' : ''}`} />
              </Button>
            </div>
            <Button
              onClick={() => sendMessage(inputText)}
              disabled={!inputText.trim()}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}