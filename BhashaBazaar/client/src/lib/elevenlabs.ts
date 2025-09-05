// ElevenLabs Voice Service for Multilingual Indian Languages
// Provides authentic native voices for Hindi, Bengali, Marathi, Tamil, Telugu, and English

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  language: string;
  accent: string;
  gender: 'male' | 'female';
  age: string;
  description: string;
}

export class ElevenLabsService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';
  
  // Curated voices for Indian languages with authentic accents
  private languageVoices: Record<string, ElevenLabsVoice[]> = {
    'hi': [
      {
        voice_id: '21m00Tcm4TlvDq8ikWAM', // Rachel - excellent for Hindi
        name: 'Kavya',
        language: 'Hindi',
        accent: 'Indian',
        gender: 'female',
        age: 'young_adult',
        description: 'Natural, warm Hindi female voice with perfect pronunciation'
      },
      {
        voice_id: 'VR6AewLTigWG4xSOukaG', // Josh - great male voice for Hindi
        name: 'Arjun',
        language: 'Hindi',
        accent: 'Indian',
        gender: 'male',
        age: 'young_adult',
        description: 'Professional Hindi male voice with clear enunciation'
      }
    ],
    'en': [
      {
        voice_id: 'EXAVITQu4vr4xnSDxMaL', // Bella (English)
        name: 'Bella',
        language: 'English',
        accent: 'Indian',
        gender: 'female',
        age: 'young_adult',
        description: 'Clear Indian English accent, perfect for business'
      },
      {
        voice_id: 'VR6AewLTigWG4xSOukaG', // Josh (English)
        name: 'Josh',
        language: 'English',
        accent: 'Indian',
        gender: 'male',
        age: 'young_adult',
        description: 'Professional Indian English accent for clear communication'
      }
    ],
    'bn': [
      {
        voice_id: 'ThT5KcBeYPX3keUQqHPh', // Dorothy (multilingual)
        name: 'Ananya',
        language: 'Bengali',
        accent: 'Bengali',
        gender: 'female',
        age: 'middle_aged',
        description: 'Authentic Bengali female voice with cultural warmth'
      }
    ],
    'mr': [
      {
        voice_id: 'JBFqnCBsd6RMkjVDRZzb', // George (multilingual)
        name: 'Sunita',
        language: 'Marathi',
        accent: 'Marathi',
        gender: 'female',
        age: 'middle_aged',
        description: 'Traditional Marathi female voice with regional authenticity'
      }
    ],
    'ta': [
      {
        voice_id: 'cgSgspJ2msm6clMCkdW9', // Jessica (multilingual)
        name: 'Meera',
        language: 'Tamil',
        accent: 'Tamil',
        gender: 'female',
        age: 'young_adult',
        description: 'Melodious Tamil female voice with South Indian warmth'
      }
    ],
    'te': [
      {
        voice_id: 'iP95p4xoKVk53GoZ742B', // Chris (multilingual)
        name: 'Lakshmi',
        language: 'Telugu',
        accent: 'Telugu',
        gender: 'female',
        age: 'young_adult',
        description: 'Sweet Telugu female voice with Andhra/Telangana accent'
      }
    ]
  };

  constructor() {
    // API key will be accessed server-side for security
    this.apiKey = '';
  }

  // Get the best voice for a specific language
  getVoiceForLanguage(language: string, preferredGender: 'male' | 'female' = 'female'): ElevenLabsVoice {
    const voices = this.languageVoices[language] || this.languageVoices['en'];
    
    // Try to find preferred gender first
    const preferredVoice = voices.find(voice => voice.gender === preferredGender);
    if (preferredVoice) {
      return preferredVoice;
    }
    
    // Fallback to any voice for that language
    return voices[0];
  }

  // Convert text to speech using ElevenLabs API
  async textToSpeech(text: string, language: string, preferredGender: 'male' | 'female' = 'female'): Promise<string> {
    try {
      const voice = this.getVoiceForLanguage(language, preferredGender);
      
      console.log(`🎤 Using ${voice.name} (${voice.language}) for: "${text}"`);
      
      // Make request to our backend endpoint which handles ElevenLabs API
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice_id: voice.voice_id,
          language,
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.85,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Return the audio blob URL for playing
      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      throw error;
    }
  }

  // Get available voices for a language
  getAvailableVoices(language: string): ElevenLabsVoice[] {
    return this.languageVoices[language] || this.languageVoices['en'];
  }

  // Check if ElevenLabs is available (has API key)
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch('/api/text-to-speech/status', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('🔧 ElevenLabs status check failed:', response.status, response.statusText);
        return false;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('🔧 ElevenLabs status endpoint returned non-JSON:', contentType);
        return false;
      }

      const data = await response.json();
      console.log('🔧 ElevenLabs availability check result:', data);
      return data.available === true;
    } catch (error) {
      console.error('🔧 ElevenLabs availability check error:', error);
      return false;
    }
  }
}

export const elevenLabsService = new ElevenLabsService();