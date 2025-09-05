# Apna Thela - Multilingual Business Management App

## Overview

Apna Thela is a voice-first, mobile-responsive business management application designed for Indian street food vendors who often don't know how to type or use English apps. The app provides comprehensive business management tools with advanced multilingual voice support across 6 Indian languages (Hindi, English, Bengali, Marathi, Tamil, Telugu), featuring automated language detection, inventory management, supplier networking, and real-time price comparison functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern React features
- **Build Tool**: Vite with custom configuration for fast development and optimized production builds
- **UI Library**: Radix UI components with shadcn/ui design system for accessible, customizable components
- **Styling**: Tailwind CSS with custom saffron color scheme and emotional desi design patterns
- **Routing**: Wouter for lightweight client-side routing without heavy dependencies
- **State Management**: TanStack Query for server state management with caching, local React hooks for component state
- **PWA Features**: Service worker implementation with offline support, installable app manifest, and background sync
- **Mobile-First Design**: Responsive design optimized for mobile devices with bottom navigation and touch-friendly interfaces

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful API structure with organized route handlers and middleware
- **Development Server**: Custom Vite integration for hot module replacement and seamless development experience
- **Error Handling**: Centralized error handling middleware with structured logging

### Database & ORM
- **Database**: PostgreSQL with Neon serverless driver for scalable cloud database
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Schema Management**: Drizzle Kit for migrations and database schema versioning
- **Validation**: Zod schemas for runtime type validation and data integrity

## External Dependencies

### Voice & Speech Technologies
- **Web Speech API**: Browser-native speech recognition and synthesis for voice input/output
- **Enhanced Language Detection**: Custom script pattern detection and keyword-based identification for automatic language switching
- **Speech Synthesis**: Text-to-speech functionality with voice selection for multilingual audio feedback

### Third-Party Services
- **Live Market Price APIs**: Integration with AGMARKNET and government agricultural market data
- **Web Scraping Services**: Real-time price data collection from multiple market sources
- **Location Services**: Browser geolocation API for nearby vendor discovery
- **PWA Technologies**: Service Worker API, Web App Manifest, and background sync capabilities

### Development Tools
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **Build Optimization**: ESBuild for fast bundling and code splitting
- **Type Safety**: TypeScript strict mode with comprehensive type definitions

### UI/UX Libraries
- **Chart Visualization**: Recharts for responsive data visualization and analytics
- **Icon System**: Lucide React for consistent iconography
- **Animation**: CSS animations and transitions for smooth user interactions
- **Accessibility**: ARIA compliance and keyboard navigation support