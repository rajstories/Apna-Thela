import { speechService } from './speech';

export interface VoiceOrder {
  quantity: number;
  unit: string;
  product: string;
}

export interface MarketplaceProduct {
  id: string;
  productName: string;
  productNameHi?: string;
  productNameBn?: string;
  category: string;
  unit: string;
  pricePerUnit: string;
  onlineStoreUrl: string;
  supplier: {
    name: string;
    nameHi?: string;
    nameBn?: string;
  };
}

export class VoiceShoppingService {
  private async getMarketplaceProducts(): Promise<MarketplaceProduct[]> {
    try {
      const response = await fetch('/api/marketplace/products');
      if (!response.ok) {
        throw new Error('Failed to fetch marketplace products');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching marketplace products:', error);
      return [];
    }
  }

  private normalizeProductName(name: string): string {
    return name.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ')    // Normalize spaces
      .trim();
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const normalized1 = this.normalizeProductName(str1);
    const normalized2 = this.normalizeProductName(str2);
    
    // Exact match
    if (normalized1 === normalized2) return 1.0;
    
    // Contains match
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
      return 0.8;
    }
    
    // Check individual words
    const words1 = normalized1.split(' ');
    const words2 = normalized2.split(' ');
    
    let matchedWords = 0;
    for (const word1 of words1) {
      for (const word2 of words2) {
        if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
          matchedWords++;
          break;
        }
      }
    }
    
    if (matchedWords > 0) {
      return matchedWords / Math.max(words1.length, words2.length) * 0.6;
    }
    
    return 0;
  }

  private findBestProductMatch(voiceProduct: string, products: MarketplaceProduct[]): MarketplaceProduct | null {
    console.log('Finding best match for:', voiceProduct);
    
    let bestMatch: MarketplaceProduct | null = null;
    let bestScore = 0;
    
    // Item mapping for better matching
    const itemMappings: Record<string, string[]> = {
      'potato': ['potato', 'aloo', 'आलू'],
      'onion': ['onion', 'pyaz', 'pyaaz', 'प्याज'],
      'tomato': ['tomato', 'tamatar', 'टमाटर'],
      'ginger': ['ginger', 'adrak', 'अदरक'],
      'garlic': ['garlic', 'lahsun', 'लहसुन'],
      'capsicum': ['capsicum', 'bell pepper', 'shimla mirch', 'शिमला मिर्च'],
      'turmeric': ['turmeric', 'haldi', 'हल्दी'],
      'chili': ['chili', 'mirch', 'मिर्च', 'red chili'],
      'coriander': ['coriander', 'dhania', 'धनिया'],
      'oil': ['oil', 'tel', 'तेल'],
      'milk': ['milk', 'doodh', 'दूध'],
      'paneer': ['paneer', 'cottage cheese', 'पनीर'],
      'chicken': ['chicken', 'murga', 'मुर्गा'],
      'mutton': ['mutton', 'bakra', 'बकरा']
    };
    
    for (const product of products) {
      // Check against product names in different languages
      const namesToCheck = [
        product.productName,
        product.productNameHi,
        product.productNameBn
      ].filter(Boolean) as string[];
      
      for (const productName of namesToCheck) {
        const score = this.calculateSimilarity(voiceProduct, productName);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = product;
        }
      }
      
      // Check against item mappings
      for (const [key, synonyms] of Object.entries(itemMappings)) {
        for (const synonym of synonyms) {
          const score = this.calculateSimilarity(voiceProduct, synonym);
          if (score > 0.7) { // High threshold for synonym matching
            // Check if this product contains the key term
            const productScore = this.calculateSimilarity(key, product.productName);
            if (productScore > 0.5 && score > bestScore) {
              bestScore = score;
              bestMatch = product;
            }
          }
        }
      }
    }
    
    // Only return if we have a reasonable confidence
    if (bestScore >= 0.4) {
      console.log('Best match found:', bestMatch?.productName, 'Score:', bestScore);
      return bestMatch;
    }
    
    console.log('No good match found. Best score:', bestScore);
    return null;
  }

  async processVoiceOrder(transcript: string): Promise<{
    success: boolean;
    order?: VoiceOrder;
    product?: MarketplaceProduct;
    redirectUrl?: string;
    message: string;
  }> {
    console.log('Processing voice order:', transcript);
    
    // Parse the voice order
    const parsedOrder = speechService.parseVoiceOrder(transcript);
    if (!parsedOrder) {
      return {
        success: false,
        message: 'Could not understand the order. Please try saying something like "1 kg potato" or "2 kilo onion"'
      };
    }
    
    console.log('Parsed order:', parsedOrder);
    
    // Get marketplace products
    const products = await this.getMarketplaceProducts();
    if (products.length === 0) {
      return {
        success: false,
        message: 'No products available in marketplace. Please try again later.'
      };
    }
    
    // Find best matching product
    const matchedProduct = this.findBestProductMatch(parsedOrder.product, products);
    if (!matchedProduct) {
      return {
        success: false,
        message: `Could not find "${parsedOrder.product}" in our marketplace. Try saying a more common product name like "potato", "onion", or "tomato".`
      };
    }
    
    console.log('Matched product:', matchedProduct.productName);
    
    return {
      success: true,
      order: parsedOrder,
      product: matchedProduct,
      redirectUrl: matchedProduct.onlineStoreUrl,
      message: `Found ${matchedProduct.productName} for ₹${matchedProduct.pricePerUnit}/${matchedProduct.unit} on ${matchedProduct.supplier.name}. Redirecting to buy...`
    };
  }
}

export const voiceShoppingService = new VoiceShoppingService();