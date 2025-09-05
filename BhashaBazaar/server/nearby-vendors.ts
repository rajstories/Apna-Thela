import type { Express } from "express";

// Google Places API integration
interface GooglePlacesResult {
  displayName: {
    text: string;
    languageCode: string;
  };
  formattedAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  priceLevel?: string;
  businessStatus?: string;
  types: string[];
  nationalPhoneNumber?: string;
  websiteUri?: string;
  regularOpeningHours?: {
    openNow: boolean;
    periods: Array<{
      open: { day: number; hour: number; minute: number };
      close?: { day: number; hour: number; minute: number };
    }>;
  };
}

// Function to search nearby businesses using Google Places API
async function searchNearbyBusinesses(lat: number, lng: number, radius: number = 2000): Promise<GooglePlacesResult[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.warn('Google Places API key not found, using mock data');
    return [];
  }

  try {
    // Define business types relevant to food vendors and suppliers
    const relevantTypes = [
      'grocery_store',
      'supermarket', 
      'convenience_store',
      'restaurant',
      'meal_takeaway',
      'food',
      'bakery',
      'butcher_shop',
      'fish_market',
      'fruit_and_vegetable_store',
      'health_food_store',
      'liquor_store',
      'pharmacy', // Often sells food items
      'shopping_mall'
    ];

    const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.rating,places.priceLevel,places.businessStatus,places.types,places.nationalPhoneNumber,places.websiteUri,places.regularOpeningHours',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        includedTypes: relevantTypes,
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: {
              latitude: lat,
              longitude: lng
            },
            radius: radius
          }
        }
      })
    });

    if (!response.ok) {
      console.error('Google Places API error:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    return data.places || [];
  } catch (error) {
    console.error('Error calling Google Places API:', error);
    return [];
  }
}

// Function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export interface NearbyVendor {
  id: string;
  vendorName: string;
  storeName: string;
  area: string;
  phone?: string;
  categories: string[];
  distance: number;
  rating?: number;
  verified: boolean;
  isOpen?: boolean;
  priceLevel?: string;
  websiteUrl?: string;
  businessType: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Helper function to convert Google Places result to our vendor format
function convertGooglePlaceToVendor(place: GooglePlacesResult, userLat?: number, userLng?: number): NearbyVendor {
  const distance = userLat && userLng ? 
    calculateDistance(userLat, userLng, place.location.latitude, place.location.longitude) : 0;
  
  // Determine business type category
  const getBusinessType = (types: string[]): string => {
    if (types.includes('grocery_store') || types.includes('supermarket')) return 'grocery';
    if (types.includes('restaurant') || types.includes('meal_takeaway')) return 'restaurant';
    if (types.includes('bakery')) return 'bakery';
    if (types.includes('convenience_store')) return 'convenience';
    if (types.includes('butcher_shop') || types.includes('fish_market')) return 'meat_seafood';
    if (types.includes('fruit_and_vegetable_store')) return 'produce';
    return 'general';
  };

  // Generate categories based on business type
  const getCategories = (types: string[]): string[] => {
    const categories: string[] = [];
    if (types.includes('grocery_store')) categories.push('किराना', 'groceries');
    if (types.includes('restaurant')) categories.push('भोजन', 'food');
    if (types.includes('bakery')) categories.push('बेकरी', 'bakery');
    if (types.includes('convenience_store')) categories.push('सुविधा स्टोर', 'convenience');
    if (types.includes('supermarket')) categories.push('सुपरमार्केट', 'supermarket');
    if (types.includes('butcher_shop')) categories.push('मांस', 'meat');
    if (types.includes('fruit_and_vegetable_store')) categories.push('फल-सब्जी', 'produce');
    return categories.length > 0 ? categories : ['सामान्य', 'general'];
  };

  return {
    id: `google_${place.location.latitude}_${place.location.longitude}`.replace(/[.-]/g, '_'),
    vendorName: place.displayName.text,
    storeName: place.displayName.text,
    area: place.formattedAddress,
    phone: place.nationalPhoneNumber,
    categories: getCategories(place.types),
    distance: Math.round(distance * 1000), // Convert to meters
    rating: place.rating,
    verified: place.businessStatus === 'OPERATIONAL',
    isOpen: place.regularOpeningHours?.openNow,
    priceLevel: place.priceLevel,
    websiteUrl: place.websiteUri,
    businessType: getBusinessType(place.types),
    coordinates: {
      lat: place.location.latitude,
      lng: place.location.longitude
    }
  };
}

// Sample nearby vendors data for demonstration (fallback data)
const sampleNearbyVendors: NearbyVendor[] = [
  {
    id: "vendor_001",
    vendorName: "राम कुमार",
    storeName: "राम भैया की चाट",
    area: "Karol Bagh",
    phone: "9876543210",
    categories: ["चाट", "समोसा", "चाय"],
    distance: 150,
    rating: 4.8,
    verified: true,
    businessType: 'restaurant',
    coordinates: { lat: 28.6519, lng: 77.1909 }
  },
  {
    id: "vendor_002", 
    vendorName: "सुनीता देवी",
    storeName: "मटका कुल्फी वाला",
    area: "Karol Bagh",
    phone: "9876543211",
    categories: ["कुल्फी", "आइसक्रीम", "शरबत"],
    distance: 280,
    rating: 4.6,
    verified: true,
    businessType: 'restaurant',
    coordinates: { lat: 28.6509, lng: 77.1919 }
  },
  {
    id: "vendor_003",
    vendorName: "विकास शर्मा", 
    storeName: "माँ की रसोई",
    area: "Karol Bagh",
    phone: "9876543212",
    categories: ["पराठा", "सब्जी", "दाल"],
    distance: 350,
    rating: 4.7,
    verified: false,
    businessType: 'restaurant',
    coordinates: { lat: 28.6529, lng: 77.1899 }
  },
  {
    id: "vendor_004",
    vendorName: "अजय गुप्ता",
    storeName: "गर्म चाय स्टॉल",
    area: "Karol Bagh", 
    phone: "9876543213",
    categories: ["चाय", "बिस्कुट", "मैगी"],
    distance: 420,
    rating: 4.5,
    verified: true,
    businessType: 'restaurant',
    coordinates: { lat: 28.6539, lng: 77.1889 }
  },
  {
    id: "vendor_005",
    vendorName: "प्रिया देवी",
    storeName: "प्रिया का ढाबा",
    area: "Lajpat Nagar",
    phone: "9876543214", 
    categories: ["राजमा", "चावल", "रोटी"],
    distance: 2200,
    rating: 4.9,
    verified: true,
    businessType: 'restaurant',
    coordinates: { lat: 28.5678, lng: 77.2434 }
  },
  {
    id: "vendor_006",
    vendorName: "संजय कुमार",
    storeName: "फ्रेश फ्रूट जूस",
    area: "Connaught Place",
    phone: "9876543215",
    categories: ["जूस", "फल", "शेक"],
    distance: 3100,
    rating: 4.4,
    verified: false,
    businessType: 'restaurant',
    coordinates: { lat: 28.6315, lng: 77.2167 }
  }
];

export function registerNearbyVendorsRoutes(app: Express) {
  // Get nearby vendors based on location or pincode
  app.get("/api/nearby-vendors", async (req, res) => {
    const { lat, lng, pincode, area } = req.query;
    
    try {
      let filteredVendors: NearbyVendor[] = [];
      
      console.log('API called with params:', { lat, lng, pincode, area });
      
      // Try to get real data from Google Places API first
      if (lat && lng && typeof lat === 'string' && typeof lng === 'string') {
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        
        console.log('Searching for nearby businesses using Google Places API...');
        const googlePlaces = await searchNearbyBusinesses(userLat, userLng);
        
        console.log(`Google Places returned ${googlePlaces.length} results`);
        
        if (googlePlaces.length > 0) {
          console.log(`Found ${googlePlaces.length} businesses from Google Places`);
          filteredVendors = googlePlaces.map(place => convertGooglePlaceToVendor(place, userLat, userLng));
        } else {
          console.log('No results from Google Places API, using fallback data');
          filteredVendors = sampleNearbyVendors.map(vendor => ({
            ...vendor,
            distance: vendor.coordinates ? 
              Math.round(calculateDistance(userLat, userLng, vendor.coordinates.lat, vendor.coordinates.lng) * 1000) : 
              vendor.distance
          }));
          console.log(`Fallback data has ${filteredVendors.length} vendors`);
        }
      } else {
        // Fallback to sample data
        console.log('No lat/lng provided, using sample data');
        filteredVendors = [...sampleNearbyVendors];
      }
      
      // Filter by area if provided
      if (area && typeof area === 'string') {
        const searchArea = area.toLowerCase();
        filteredVendors = filteredVendors.filter(vendor => 
          vendor.area.toLowerCase().includes(searchArea) ||
          searchArea.includes(vendor.area.toLowerCase())
        );
      }
      
      // Filter by pincode mapping (simplified)
      if (pincode && typeof pincode === 'string') {
        const pincodeAreaMap: Record<string, string[]> = {
          '110005': ['Karol Bagh'],
          '110024': ['Lajpat Nagar'], 
          '110001': ['Connaught Place'],
          '110006': ['Karol Bagh'],
          '110017': ['Lajpat Nagar']
        };
        
        const areasForPincode = pincodeAreaMap[pincode] || [];
        if (areasForPincode.length > 0) {
          filteredVendors = filteredVendors.filter(vendor =>
            areasForPincode.some(area => 
              vendor.area.toLowerCase().includes(area.toLowerCase())
            )
          );
        }
      }
      
      // Ensure we always have some vendors to show
      if (filteredVendors.length === 0) {
        console.log('No vendors found after filtering, adding sample data');
        const userLat = lat ? parseFloat(lat as string) : null;
        const userLng = lng ? parseFloat(lng as string) : null;
        
        filteredVendors = sampleNearbyVendors.map(vendor => ({
          ...vendor,
          distance: (vendor.coordinates && userLat && userLng) ? 
            Math.round(calculateDistance(userLat, userLng, vendor.coordinates.lat, vendor.coordinates.lng) * 1000) : 
            vendor.distance
        }));
      }
      
      // Sort by distance (closest first)
      filteredVendors.sort((a, b) => a.distance - b.distance);
      
      // Limit to top 10 results
      const results = filteredVendors.slice(0, 10);
      
      res.json(results);
    } catch (error) {
      console.error('Error fetching nearby vendors:', error);
      res.status(500).json({ error: 'Failed to fetch nearby vendors' });
    }
  });
}

