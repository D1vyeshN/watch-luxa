import { Product } from '@models/product.model';
import { Brand } from '@models/brand.model';
import { logger } from './logger';
import { slugify } from '@utils/string';

interface ProductSeedData {
  name: string;
  brand: string;
  category: string;
  gender: 'men' | 'women' | 'unisex';
  shortDescription: string;
  fullDescription: string;
  basePrice: number;
  heroImage: string;
  images: string[];
  specs: {
    referenceNumber: string;
    movementType: string;
    movementCaliber?: string;
    powerReserve?: number;
    jewels?: number;
    caseDiameter: number;
    caseThickness?: number;
    lugWidth?: number;
    caseMaterial: string;
    bezelMaterial?: string;
    crystalType: string;
    waterResistance: number;
    indices?: string;
    hands?: string;
    warranty: string;
    boxAndPapers: boolean;
  };
  variants: Array<{
    sku: string;
    dialColor: string;
    dialFinish?: string;
    caseMaterial: string;
    caseSize: number;
    bezelType?: string;
    indicesType?: string;
    strapType: string;
    strapColor: string;
    claspType?: string;
    movement: 'automatic' | 'manual' | 'quartz' | 'solar';
    complications: string[];
    price: number;
    stock: number;
    lowStockThreshold: number;
    images: string[];
    isActive: boolean;
  }>;
  tags: string[];
  featured: boolean;
  isLimitedEdition: boolean;
  limitedQuantity?: number;
}

const SYSTEM_PRODUCTS: ProductSeedData[] = [
  {
    name: 'Submariner Date',
    brand: 'Rolex',
    category: 'dive-watches',
    gender: 'men',
    shortDescription: 'The iconic dive watch with Cerachrom bezel',
    fullDescription: 'The Rolex Submariner is the reference diver\'s watch. Crafted from Oystersteel, this 41mm model features a Cerachrom bezel with a 60-minute graduations, a black dial, and large Chromalight hour markers.',
    basePrice: 850000, // ₹8,500 in paise
    heroImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&q=80',
    ],
    specs: {
      referenceNumber: '126610LN',
      movementType: 'Automatic',
      movementCaliber: '3235',
      powerReserve: 70,
      jewels: 31,
      caseDiameter: 41,
      caseThickness: 12.5,
      lugWidth: 21,
      caseMaterial: 'Oystersteel',
      bezelMaterial: 'Cerachrom',
      crystalType: 'Sapphire',
      waterResistance: 300,
      indices: 'Chromalight',
      hands: 'Mercedes',
      warranty: '5 years',
      boxAndPapers: true,
    },
    variants: [
      {
        sku: 'RLX-SUB-126610LN-BLK',
        dialColor: 'Black',
        dialFinish: 'Matte',
        caseMaterial: 'Oystersteel',
        caseSize: 41,
        bezelType: 'Unidirectional',
        indicesType: 'Circle',
        strapType: 'Oyster',
        strapColor: 'Black',
        claspType: 'Folding Oysterlock',
        movement: 'automatic',
        complications: ['Date'],
        price: 850000,
        stock: 15,
        lowStockThreshold: 3,
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'],
        isActive: true,
      },
    ],
    tags: ['dive', 'waterproof', 'iconic', 'automatic'],
    featured: true,
    isLimitedEdition: false,
  },
  {
    name: 'Speedmaster Professional',
    brand: 'Omega',
    category: 'pilot-watches',
    gender: 'men',
    shortDescription: 'The legendary Moonwatch',
    fullDescription: 'The Omega Speedmaster Professional is the first watch worn on the moon. This manual-winding chronograph features a Hesalite crystal, black dial, and the famous tachymetric scale.',
    basePrice: 450000,
    heroImage: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=80',
      'https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=800&q=80',
    ],
    specs: {
      referenceNumber: '311.30.42.30.01.005',
      movementType: 'Manual',
      movementCaliber: '3861',
      powerReserve: 50,
      jewels: 26,
      caseDiameter: 42,
      caseThickness: 13.8,
      lugWidth: 20,
      caseMaterial: 'Stainless Steel',
      bezelMaterial: 'Anodized Aluminum',
      crystalType: 'Hesalite',
      waterResistance: 50,
      indices: 'White',
      hands: 'Alpha',
      warranty: '5 years',
      boxAndPapers: true,
    },
    variants: [
      {
        sku: 'OMG-SPD-311-HES-BLK',
        dialColor: 'Black',
        dialFinish: 'Matte',
        caseMaterial: 'Stainless Steel',
        caseSize: 42,
        bezelType: 'Tachymetric',
        indicesType: 'Applied',
        strapType: 'Leather',
        strapColor: 'Black',
        claspType: 'Buckle',
        movement: 'manual',
        complications: ['Chronograph', 'Tachymeter'],
        price: 450000,
        stock: 20,
        lowStockThreshold: 5,
        images: ['https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=80'],
        isActive: true,
      },
    ],
    tags: ['chronograph', 'manual', 'iconic', 'space'],
    featured: true,
    isLimitedEdition: false,
  },
  {
    name: 'Monaco Calibre 11',
    brand: 'Tag Heuer',
    category: 'racing-watches',
    gender: 'men',
    shortDescription: 'The square-shaped racing chronograph',
    fullDescription: 'The TAG Heuer Monaco is an icon of motor racing. Its distinctive square case, revolutionary water-resistant square case, and chronograph movement make it a timeless classic.',
    basePrice: 550000,
    heroImage: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80',
      'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800&q=80',
    ],
    specs: {
      referenceNumber: 'CAW211P.FC6356',
      movementType: 'Automatic',
      movementCaliber: 'Heuer 02',
      powerReserve: 80,
      jewels: 33,
      caseDiameter: 39,
      caseThickness: 14.3,
      lugWidth: 22,
      caseMaterial: 'Stainless Steel',
      bezelMaterial: 'Fixed',
      crystalType: 'Sapphire',
      waterResistance: 100,
      indices: 'Applied',
      hands: 'Batons',
      warranty: '2 years',
      boxAndPapers: true,
    },
    variants: [
      {
        sku: 'TAG-MCA-CAW211P-BLU',
        dialColor: 'Blue',
        dialFinish: 'Sunburst',
        caseMaterial: 'Stainless Steel',
        caseSize: 39,
        bezelType: 'Fixed',
        indicesType: 'Applied',
        strapType: 'Leather',
        strapColor: 'Blue',
        claspType: 'Buckle',
        movement: 'automatic',
        complications: ['Chronograph', 'Date'],
        price: 550000,
        stock: 12,
        lowStockThreshold: 3,
        images: ['https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80'],
        isActive: true,
      },
    ],
    tags: ['chronograph', 'racing', 'square', 'iconic'],
    featured: true,
    isLimitedEdition: false,
  },
  {
    name: 'Presage Cocktail Time',
    brand: 'Seiko',
    category: 'dress-watches',
    gender: 'men',
    shortDescription: 'Elegant dial with sunburst finish',
    fullDescription: 'The Seiko Presage Cocktail Time features a stunning sunburst dial inspired by the colors of classic cocktails. This elegant dress watch combines Japanese craftsmanship with timeless design.',
    basePrice: 250000,
    heroImage: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80',
      'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80',
    ],
    specs: {
      referenceNumber: 'SRPB41J1',
      movementType: 'Automatic',
      movementCaliber: '4R35',
      powerReserve: 41,
      jewels: 23,
      caseDiameter: 40.5,
      caseThickness: 11.8,
      lugWidth: 22,
      caseMaterial: 'Stainless Steel',
      bezelMaterial: 'Fixed',
      crystalType: 'Sapphire',
      waterResistance: 50,
      indices: 'Dauphine',
      hands: 'Dauphine',
      warranty: '3 years',
      boxAndPapers: true,
    },
    variants: [
      {
        sku: 'SEK-PRS-SRPB41-BLU',
        dialColor: 'Blue',
        dialFinish: 'Sunburst',
        caseMaterial: 'Stainless Steel',
        caseSize: 40.5,
        bezelType: 'Fixed',
        indicesType: 'Applied',
        strapType: 'Leather',
        strapColor: 'Brown',
        claspType: 'Buckle',
        movement: 'automatic',
        complications: ['Date'],
        price: 250000,
        stock: 25,
        lowStockThreshold: 5,
        images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80'],
        isActive: true,
      },
    ],
    tags: ['dress', 'automatic', 'elegant', 'value'],
    featured: true,
    isLimitedEdition: false,
  },
  {
    name: 'Tank Louis Cartier',
    brand: 'Cartier',
    category: 'dress-watches',
    gender: 'unisex',
    shortDescription: 'The quintessential rectangular dress watch',
    fullDescription: 'The Cartier Tank Louis Cartier is an icon of Art Deco design. Its rectangular case, Roman numerals, and blue cabochon crown have made it a symbol of elegance since 1917.',
    basePrice: 1200000,
    heroImage: 'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=800&q=80',
      'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80',
    ],
    specs: {
      referenceNumber: 'WSTA0028',
      movementType: 'Manual',
      movementCaliber: '430 MC',
      powerReserve: 38,
      jewels: 19,
      caseDiameter: 33.7,
      caseThickness: 6.6,
      lugWidth: 22,
      caseMaterial: 'Yellow Gold',
      bezelMaterial: 'Fixed',
      crystalType: 'Sapphire',
      waterResistance: 30,
      indices: 'Roman',
      hands: 'Blued Steel',
      warranty: '8 years',
      boxAndPapers: true,
    },
    variants: [
      {
        sku: 'CRT-TNK-WSTA0028-YGD',
        dialColor: 'Silver',
        dialFinish: 'Guilloché',
        caseMaterial: 'Yellow Gold',
        caseSize: 33.7,
        bezelType: 'Fixed',
        indicesType: 'Printed',
        strapType: 'Leather',
        strapColor: 'Brown',
        claspType: 'Buckle',
        movement: 'manual',
        complications: [],
        price: 1200000,
        stock: 8,
        lowStockThreshold: 2,
        images: ['https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=800&q=80'],
        isActive: true,
      },
    ],
    tags: ['dress', 'manual', 'iconic', 'luxury'],
    featured: true,
    isLimitedEdition: false,
  },
  {
    name: 'Nautilus 5711',
    brand: 'Patek Philippe',
    category: 'Sport Watches',
    gender: 'men',
    shortDescription: 'The legendary sports watch',
    fullDescription: 'The Patek Philippe Nautilus 5711 is one of the most sought-after watches in the world. Its distinctive porthole design, integrated bracelet, and exceptional finishing make it a grail watch for collectors.',
    basePrice: 3500000,
    heroImage: 'https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=800&q=80',
      'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800&q=80',
    ],
    specs: {
      referenceNumber: '5711/1A-010',
      movementType: 'Automatic',
      movementCaliber: '324 S C',
      powerReserve: 45,
      jewels: 29,
      caseDiameter: 40,
      caseThickness: 8.3,
      lugWidth: 21,
      caseMaterial: 'Stainless Steel',
      bezelMaterial: 'Integrated',
      crystalType: 'Sapphire',
      waterResistance: 120,
      indices: 'Applied',
      hands: 'Batons',
      warranty: '2 years',
      boxAndPapers: true,
    },
    variants: [
      {
        sku: 'PPH-NPT-5711-BLU',
        dialColor: 'Blue',
        dialFinish: 'Horizontal',
        caseMaterial: 'Stainless Steel',
        caseSize: 40,
        bezelType: 'Integrated',
        indicesType: 'Applied',
        strapType: 'Metal',
        strapColor: 'Steel',
        claspType: 'Folding',
        movement: 'automatic',
        complications: ['Date'],
        price: 3500000,
        stock: 3,
        lowStockThreshold: 1,
        images: ['https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=800&q=80'],
        isActive: true,
      },
    ],
    tags: ['sport', 'iconic', 'grail', 'automatic'],
    featured: true,
    isLimitedEdition: true,
    limitedQuantity: 3,
  },
  {
    name: 'Royal Oak 15500',
    brand: 'Audemars Piguet',
    category: 'Sport Watches',
    gender: 'men',
    shortDescription: 'The legendary integrated bracelet sports watch',
    fullDescription: 'The Audemars Piguet Royal Oak 15500 features the iconic Genta design with its integrated bracelet, octagonal bezel, and stunning finish. A true icon of luxury sports watchmaking.',
    basePrice: 2800000,
    heroImage: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80',
      'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80',
    ],
    specs: {
      referenceNumber: '15500ST.OO.1220ST.01',
      movementType: 'Automatic',
      movementCaliber: '4302',
      powerReserve: 70,
      jewels: 32,
      caseDiameter: 41,
      caseThickness: 10.4,
      lugWidth: 22,
      caseMaterial: 'Stainless Steel',
      bezelMaterial: 'Integrated',
      crystalType: 'Sapphire',
      waterResistance: 100,
      indices: 'Applied',
      hands: 'Royal Oak',
      warranty: '5 years',
      boxAndPapers: true,
    },
    variants: [
      {
        sku: 'APR-ROY-15500-BLU',
        dialColor: 'Blue',
        dialFinish: 'Grande Tapisserie',
        caseMaterial: 'Stainless Steel',
        caseSize: 41,
        bezelType: 'Octagonal',
        indicesType: 'Applied',
        strapType: 'Metal',
        strapColor: 'Steel',
        claspType: 'Folding',
        movement: 'automatic',
        complications: ['Date'],
        price: 2800000,
        stock: 5,
        lowStockThreshold: 2,
        images: ['https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80'],
        isActive: true,
      },
    ],
    tags: ['sport', 'iconic', 'grail', 'automatic'],
    featured: true,
    isLimitedEdition: false,
  },
  {
    name: 'Navitimer B01',
    brand: 'Breitling',
    category: 'pilot-watches',
    gender: 'men',
    shortDescription: 'The aviation chronograph with slide rule bezel',
    fullDescription: 'The Breitling Navitimer is the ultimate pilot\'s watch. Its famous slide rule bezel, large case, and chronograph functionality have made it the choice of aviators for over 65 years.',
    basePrice: 750000,
    heroImage: 'https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    ],
    specs: {
      referenceNumber: 'AB0138211B1A1',
      movementType: 'Automatic',
      movementCaliber: 'B01',
      powerReserve: 70,
      jewels: 47,
      caseDiameter: 43,
      caseThickness: 14.6,
      lugWidth: 22,
      caseMaterial: 'Stainless Steel',
      bezelMaterial: 'Slide Rule',
      crystalType: 'Sapphire',
      waterResistance: 30,
      indices: 'Applied',
      hands: 'Batons',
      warranty: '5 years',
      boxAndPapers: true,
    },
    variants: [
      {
        sku: 'BRL-NAV-AB0138-BLK',
        dialColor: 'Black',
        dialFinish: 'Matte',
        caseMaterial: 'Stainless Steel',
        caseSize: 43,
        bezelType: 'Slide Rule',
        indicesType: 'Applied',
        strapType: 'Leather',
        strapColor: 'Black',
        claspType: 'Buckle',
        movement: 'automatic',
        complications: ['Chronograph', 'Date', 'Slide Rule'],
        price: 750000,
        stock: 10,
        lowStockThreshold: 3,
        images: ['https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=800&q=80'],
        isActive: true,
      },
    ],
    tags: ['chronograph', 'aviation', 'pilot', 'automatic'],
    featured: true,
    isLimitedEdition: false,
  },
];

export const seedSystemProducts = async () => {
  for (const productData of SYSTEM_PRODUCTS) {
    const slug = slugify(productData.name);
    const existing = await Product.findOne({ slug });

    if (!existing) {
      // Find brand by name (case-insensitive)
      const brand = await Brand.findOne({ name: { $regex: new RegExp(`^${productData.brand}$`, 'i') } });
      if (!brand) {
        logger.warn(`⚠️  Brand not found: ${productData.brand}, skipping product: ${productData.name}`);
        continue;
      }

      await Product.create({
        ...productData,
        slug,
        brandId: brand._id,
        status: 'active',
        publishedAt: new Date(),
      });
      logger.info(`🌱 Created system product: ${productData.name}`);
    }
  }
  logger.info('✅ System products seeded');
};
