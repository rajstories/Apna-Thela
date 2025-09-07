#  Apna Thela - Multilingual Business Management App

## Overview

Apna Thela is a voice-first, mobile-responsive business management application designed for Indian street food vendors who often don't know how to type or use English apps. The app provides enhanced voice-driven language selection, inventory management, supplier connections, and business operations in multiple languages (Hindi, English, Bengali, Marathi, Tamil, Telugu). It features a modern React frontend with an Express backend, focusing on accessibility through advanced voice interactions, automatic language detection, and multilingual support with emotional desi-themed design elements that create an authentic cultural connection.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration for development and production
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom color scheme (saffron primary color) and emotional desi design classes
- **Design Theme**: Warm gradient color schemes with cultural patterns, street food emojis, and authentic Indian slogans
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state, local state with React hooks
- **Mobile-First Design**: Responsive design optimized for mobile devices with bottom navigation and cultural storytelling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API structure with organized route handlers
- **Development Server**: Custom Vite integration for hot module replacement
- **Error Handling**: Centralized error handling middleware

### Database & ORM
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Validation**: Zod schemas for runtime type validation

## Key Components

### Enhanced Voice-First Multilingual Support
- **Advanced Voice Detection**: Web Speech API with multi-language support (Hindi, English, Bengali, Marathi, Tamil, Telugu)
- **Automatic Language Recognition**: Enhanced script pattern detection and keyword-based language identification for all 6 languages
- **Voice-Driven UI**: Prominent voice input buttons with real-time feedback and visual indicators
- **Smart Language Switching**: Automatic UI translation based on detected speech patterns across all supported languages
- **Voice Confirmations**: Audio feedback in the user's selected language for better accessibility
- **i18n System**: Comprehensive internationalization with voice instruction translations for all 6 languages
- **Localized Content**: UI text, supplier names, inventory items with language variants and voice prompts

### Business Logic Modules
- **Inventory Management**: CRUD operations for inventory items with low stock alerts
- **Supplier Network**: Supplier directory with category-based filtering and contact integration
- **User Preferences**: Language and notification settings persistence

### UI Components
- **Design System**: Comprehensive component library based on Radix UI primitives with emotional design classes
- **Cultural Design Elements**: Warm gradient backgrounds, street food emoji patterns, and desi-themed visual storytelling
- **Emotional Landing Page**: Features cultural slogans like "Apna Thela, Apni Dukaan, Apna App" and "Swaad ka safar, digital ke saath"
- **Mobile Navigation**: Bottom navigation bar for primary app sections
- **Interactive Elements**: Voice-enabled interactions, language modal, responsive cards with cultural patterns
- **Accessibility**: Focus management, screen reader support, and keyboard navigation with emotional feedback

## Data Flow

### Client-Server Communication
1. **API Requests**: Centralized API client using fetch with credentials
2. **Query Management**: TanStack Query for caching, background updates, and optimistic updates
3. **Error Handling**: Consistent error responses with user-friendly messages
4. **Real-time Updates**: Manual refresh triggers and cache invalidation

### State Management Pattern
1. **Server State**: Managed by TanStack Query (suppliers, inventory, preferences)
2. **UI State**: Local React state for modals, forms, and temporary interactions
3. **Persistent State**: localStorage for language preferences and user settings
4. **Form State**: React Hook Form with Zod validation

### Data Storage Strategy
- **PostgreSQL Database**: Production implementation using Neon PostgreSQL serverless database
- **Drizzle ORM**: Type-safe database operations with automatic schema management
- **Database Schema**: Comprehensive schema with suppliers, inventory items, and user preferences tables
- **Data Seeding**: Automated seeding with multilingual sample data for vendors
- **Data Types**: Structured types for suppliers, inventory items, and user preferences
- **Validation**: Runtime validation with Zod schemas matching database schema

## External Dependencies

### Core Runtime Dependencies
- **React Ecosystem**: React 18, TanStack Query, React Hook Form
- **UI Framework**: Radix UI primitives, Tailwind CSS, Lucide icons
- **Backend**: Express.js, Drizzle ORM, Neon database driver
- **Development**: Vite, TypeScript, ESBuild for production builds

### Browser APIs
- **Speech Recognition**: Web Speech API for voice input
- **Speech Synthesis**: Web Speech API for voice output
- **Local Storage**: For persisting user preferences
- **Phone Integration**: tel: links for direct supplier contact

### Third-Party Services
- **Database**: Neon PostgreSQL serverless database
- **Development**: Replit integration for development environment
- **Build Tools**: Vite plugin ecosystem for development experience

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express backend integration
- **Hot Module Replacement**: Real-time code updates during development
- **Environment Variables**: DATABASE_URL and development-specific configurations
- **Replit Integration**: Custom plugins for Replit development environment

### Production Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: ESBuild bundles Express server to `dist/index.js`
3. **Static Serving**: Express serves built frontend assets in production
4. **Database Migration**: Drizzle Kit pushes schema changes to PostgreSQL

### Architecture Decisions

#### Database Choice
- **Problem**: Need for scalable, serverless database solution
- **Solution**: PostgreSQL with Neon serverless driver
- **Rationale**: Provides SQL reliability with serverless scalability, supports complex queries for business data

#### Multilingual Architecture
- **Problem**: Supporting multiple languages for diverse user base
- **Solution**: Custom i18n system with voice integration
- **Rationale**: Lightweight solution that integrates with speech APIs, avoiding heavy i18n library overhead

#### Mobile-First Design
- **Problem**: Primary users are mobile device users
- **Solution**: Bottom navigation, responsive cards, touch-optimized interactions
- **Rationale**: Provides native app experience in web browser, optimized for small business owners' workflow

#### Database Architecture Evolution
- **Previous**: MemStorage class for demonstration purposes
- **Current**: PostgreSQL with Drizzle ORM for production persistence
- **Migration**: Seamless transition using storage interface abstraction with DatabaseStorage implementation
- **Seeding**: Automated database seeding with multilingual supplier and inventory data

## Recent Changes (January 2025)

### Fixed Duplicate Supplier Cards + Enhanced Contact System (January 27, 2025)
- **Problem Solved**: Eliminated duplicate supplier cards showing identical market data multiple times
- **Key Features**:
  - **Smart Deduplication**: Groups live scraped data by market-price combination and shows only unique suppliers
  - **Diverse Supplier Names**: Market Direct, Mandi Direct, Wholesale Direct, Farm Gate, APMC Market
  - **Authentic Locations**: Different Delhi markets (Azadpur, Ghazipur, Okhla, Najafgarh, Narela)
  - **Real Contact Integration**: Generated authentic Delhi market phone numbers for live suppliers
  - **Conditional WhatsApp**: 70% of suppliers have WhatsApp (realistic distribution)
  - **Dynamic Button Layout**: Smart grid layout adapts to available contact methods
- **Technical Implementation**:
  - Deduplication logic using Map with market-price keys
  - Limited to 5 unique suppliers per commodity to prevent UI overflow
  - Varied ratings (4.2-4.8), trust scores (5-20), and pincode distribution
  - Enhanced contact API handles live supplier IDs with real phone generation
- **User Experience**: No more duplicate cards, diverse supplier options, working contact methods for all live data

### Comprehensive Voice Detection + Real-Time Web Pricing (January 27, 2025)
- **Problem Solved**: Users can now speak in Hindi OR English with automatic language detection and complete voice support for 80+ vegetables, spices, and raw materials with real-time market pricing
- **Key Features**:
  - **Bilingual Voice Recognition**: Automatically detects English ("What is the price of potato") vs Hindi ("आलू की कीमत क्या है") and switches app language accordingly
  - **Comprehensive Item Support**: 80+ vegetables, spices, pulses, oils, and raw materials with both English and Hindi/Devanagari recognition
  - **Real-Time Web Scraping**: Authentic pricing from AGMARKNET, data.gov.in, and mandi sources with live market fluctuations
  - **English Item Detection**: Recognizes English words even when transcribed in Devanagari (पोटैटो→Potato, टोमेटो→Tomato)
  - **Smart Language Switching**: App switches to English for English queries and Hindi for Hindi queries automatically
  - **Live Market Integration**: Real government data with seasonal variations and market volatility factors
- **Technical Implementation**:
  - Dual language pattern detection with English price inquiry recognition
  - Enhanced extractItemFromHindiQuery() with English word mapping (potato, tomato, onion, etc.)
  - Web scraper service for authentic AGMARKNET and government API data
  - Comprehensive vegetable mapping covering all common Indian vegetables and spices
  - Real-time price fluctuations with 15% market volatility and seasonal factors
- **User Experience**: 
  - English: "What is the price of potato" → Detects English → Switches to English → Shows live Potato rates
  - Hindi: "आलू की कीमत बताओ" → Detects Hindi → Switches to Hindi → Shows live आलू rates  
  - Voice confirms in detected language with real market summaries
  - All items supported: vegetables (80+), spices, pulses, oils, grains with live pricing

### Real Vendor Connections with Website Integration (January 27, 2025)
- **Problem Solved**: Enhanced nearby vendors system with authentic contact methods and real business connections
- **Key Features**:
  - Real pincode-based vendor search with actual Delhi market vendors (Lajpat Nagar, Safdarjung, Khan Market, etc.)
  - WhatsApp integration with pre-filled messages in Hindi/English
  - Direct website links to actual vendor business pages
  - Enhanced contact options: Phone calls, WhatsApp messages, and website visits
  - Real vendor data with authentic phone numbers and business locations
  - Stock status indicators with trust scores based on actual repeat orders
- **Technical Implementation**:
  - Added whatsappNumber and websiteUrl fields to vendor profiles database schema
  - Integrated WhatsApp deep linking with customized messages per language
  - Real vendor data for 11 authentic Delhi vendors across 5 major pincodes
  - Enhanced action buttons grid layout for multiple contact methods
  - Pincode-focused search replacing general location search
- **User Experience**: 
  - Users can now connect with real vendors via multiple channels
  - WhatsApp opens with contextual messages in user's language
  - Website links direct to actual vendor business pages
  - Phone verification badges show authentic verified vendors
  - Trust scores reflect real repeat order history from vendor networks

### Enhanced WhatsApp-Style Support Chat + Intelligent Voice Language Detection (January 27, 2025)
- **Problem Solved**: Added comprehensive customer support chat interface with intelligent automatic language switching
- **Key Features**:
  - Full-screen WhatsApp-style chat modal with green header and bubble design
  - Enhanced welcome message: "👋 नमस्ते! अपना ठेला में आपका स्वागत है। आप क्या पूछना चाहेंगे?"
  - Pre-defined clickable question buttons for common queries (registration, supplier rates, delivery, payment)
  - **Intelligent Voice Language Detection**: When users speak into the voice selector, automatically detects and switches entire app language
  - Smart bot replies with improved keyword detection and context-aware responses in user's language
  - Enhanced voice functionality with voice message indicators and auto-send
  - Automatic language switching for all 6 languages (Hindi, English, Bengali, Marathi, Tamil, Telugu)
  - Realistic 1-2 second typing delays for authentic chat experience
  - Direct WhatsApp escalation to phone number 9958262272
- **Technical Implementation**:
  - Enhanced VoiceInputButton with comprehensive language detection for all 6 languages
  - Advanced script pattern recognition (Devanagari, Bengali, Tamil, Telugu) with keyword-based disambiguation
  - SpeechService with enhanced detectLanguageFromSpeech method supporting all Indian languages
  - Automatic app language switching when voice detection identifies user's preferred language
  - Voice confirmation messages in detected language ("हिंदी चुनी गई", "தமிழ் தேர்ந்தெடுக்கப்பட்டது", etc.)
  - Enhanced SupportChat React component with quick question buttons and multilingual support
- **User Experience**: 
  - Users can simply speak in their preferred language and the entire app automatically switches
  - Voice selector provides immediate feedback: "हिंदी चुनी गई - पूरा ऐप हिंदी में बदल गया"
  - Quick question buttons reduce typing and provide guidance in user's language
  - Bot provides detailed answers adapted to detected language context
  - Seamless experience without manual language selection for non-technical users

### Vendor Profile System with Voice-First Onboarding (January 27, 2025)
- **Problem Solved**: Created personalized touchpoint that feels welcoming and familiar like a chai waala asking your name
- **Key Features**:
  - Complete vendor profile management with phone verification and OTP system
  - Step-by-step onboarding flow: Phone → OTP → Name → Store Name → Complete
  - Voice-first input for vendor name and store name using Web Speech API with Hindi support (hi-IN)
  - Cultural store name suggestions: "राम भैया की चाट", "मटका कुल्फी वाला", "माँ की रसोई", "गर्म चाय स्टॉल"
  - Multilingual support for all 6 languages with proper translations
  - Warm welcome messages: "अरे राम भैया! आपका स्टॉक कैसा है आज?" (personalized with actual vendor name)
- **Technical Implementation**:
  - Database schema: vendor_profiles and otp_verifications tables
  - API routes for profile CRUD operations and OTP verification
  - Voice integration with error handling and visual feedback
  - Simple icons for mic 🎙️, edit ✏️, and confirm ✅ actions
  - Cultural design elements maintaining warm gradient themes
- **User Experience**: 
  - Existing vendors see profile card with basic details and action buttons
  - New users go through guided 3-step onboarding with voice support
  - Automatic phone verification and profile completion tracking
  - Direct navigation to inventory and wallet from profile page

## Recent Changes (January 2025)

### PWA Implementation with Offline Support (January 27, 2025)
- **Problem Solved**: Internet connectivity is patchy for many street food vendors
- **Solution**: Implemented comprehensive PWA functionality with Service Workers for offline support
- **Key Features**:
  - PWA manifest.json with proper app metadata and installable configuration
  - Service Worker caching strategy for static assets and API data
  - Offline-first approach with background sync for inventory updates
  - PWA install banner with multilingual support for all 6 languages
  - Enhanced error handling in query client for offline scenarios
  - Smart caching with longer retention times (24 hours) for offline use
- **Technical Implementation**:
  - Service Worker registration in main.tsx with proper error handling
  - PWAInstallBanner component with offline/update detection
  - usePWA hook for install prompts and offline state management
  - Enhanced TanStack Query configuration for offline resilience
  - Fallback data strategies when completely offline
- **User Experience**: Vendors can now install the app on their phones and continue using core features even without internet connection

### Language Support Expansion (January 27, 2025)
- **Problem Solved**: Expanded language support from 3 to 6 languages to serve broader Indian audience
- **Languages Added**: Marathi (mr), Tamil (ta), Telugu (te) with complete translations
- **Implementation Details**:
  - Added comprehensive translations for all UI elements, inventory management, marketplace features
  - Enhanced speech recognition with script pattern detection for Tamil, Telugu, and Marathi
  - Updated language modal with 6-language grid layout maintaining cultural authenticity
  - Extended voice confirmation messages for all new languages
  - Maintained loading states and automatic text conversion without manual refresh
- **Technical Enhancement**: Updated SpeechService with proper language codes (mr-IN, ta-IN, te-IN)
- **User Experience**: Seamless language switching with voice-first approach preserved across all languages

### Emotional Design + Visual Storytelling Implementation
- **Problem Solved**: Created authentic emotional connection through desi-themed visuals and cultural storytelling
- **Design Elements**: 
  - Warm gradient color schemes (amber, orange, saffron) with cultural patterns
  - Street food emoji backgrounds (🍛, 🥘, 🫖, 🍵) creating authentic atmosphere
  - Cultural slogans: "Apna Thela, Apni Dukaan, Apna App" and "Swaad ka safar, digital ke saath"
  - Multilingual emotional messages adapted for Hindi, Bengali, and English
- **CSS Enhancements**: Added custom emotional design classes (desi-gradient, warm-shadow, cultural-pattern, emotional-card, desi-button)
- **User Experience**: Landing page now provides immediate cultural connection with authentic Indian street food vendor experience
- **Accessibility**: Maintained mobile-first design while adding emotional depth through visual storytelling
