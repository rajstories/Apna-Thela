import type { Express } from "express";

export interface NearbyVendor {
  id: string;
  vendorName: string;
  storeName: string;
  area: string;
  phone: string;
  categories: string[];
  distance: number;
  rating: number;
  verified: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Sample nearby vendors data for demonstration
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
    coordinates: { lat: 28.6315, lng: 77.2167 }
  }
];

export function registerNearbyVendorsRoutes(app: Express) {
  // Get nearby vendors based on location or pincode
  app.get("/api/nearby-vendors", (req, res) => {
    const { lat, lng, pincode, area } = req.query;
    
    try {
      let filteredVendors = [...sampleNearbyVendors];
      
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
      
      // Calculate distance if user coordinates provided
      if (lat && lng && typeof lat === 'string' && typeof lng === 'string') {
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        
        filteredVendors = filteredVendors.map(vendor => {
          if (vendor.coordinates) {
            const distance = calculateDistance(
              userLat, userLng, 
              vendor.coordinates.lat, vendor.coordinates.lng
            );
            return { ...vendor, distance: Math.round(distance) };
          }
          return vendor;
        });
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

// Helper function to calculate distance between two coordinates (in meters)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lng2-lng1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}