const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/novatech';

const categories = [
  { name: 'Laptop', slug: 'laptop', icon: 'laptop-outline', order: 1 },
  { name: 'Điện thoại', slug: 'phone', icon: 'phone-portrait-outline', order: 2 },
  { name: 'Tablet', slug: 'tablet', icon: 'tablet-portrait-outline', order: 3 },
  { name: 'Phụ kiện', slug: 'accessory', icon: 'headset-outline', order: 4 },
  { name: 'Đồng hồ', slug: 'watch', icon: 'watch-outline', order: 5 },
  { name: 'Âm thanh', slug: 'audio', icon: 'musical-notes-outline', order: 6 }
];

const products = [
  {
    name: 'Laptop ASUS Vivobook Gaming RTX3050 16 inch',
    price: 15000000,
    originalPrice: 18000000,
    discount: 17,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&h=600&fit=crop'
    ],
    category: 'laptop',
    brand: 'ASUS',
    description: 'Laptop ASUS Vivobook Gaming với RTX 3050, màn hình 16 inch, hiệu năng mạnh mẽ',
    specifications: {
      cpu: 'Intel Core i5-11400H',
      ram: '8GB DDR4',
      storage: '512GB SSD',
      display: '16 inch Full HD',
      gpu: 'NVIDIA RTX 3050 4GB'
    },
    stock: 25,
    sold: 45,
    rating: 4.5,
    reviewCount: 120,
    isFeatured: true,
    isHot: true
  },
  {
    name: 'iPhone 15 Pro 128GB Titanium',
    price: 24500000,
    originalPrice: 28000000,
    discount: 13,
    image: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=600&h=600&fit=crop'
    ],
    category: 'phone',
    brand: 'Apple',
    description: 'iPhone 15 Pro với chip A17 Pro, khung titanium cao cấp',
    specifications: {
      chip: 'Apple A17 Pro',
      ram: '8GB',
      storage: '128GB',
      display: '6.1 inch Super Retina XDR',
      camera: '48MP + 12MP + 12MP'
    },
    stock: 15,
    sold: 89,
    rating: 5,
    reviewCount: 256,
    isFeatured: true,
    isHot: true
  },
  {
    name: 'MacBook Air M2 13" 2022',
    price: 21800000,
    originalPrice: 24000000,
    discount: 9,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop'
    ],
    category: 'laptop',
    brand: 'Apple',
    description: 'MacBook Air M2 mỏng nhẹ, hiệu năng vượt trội',
    specifications: {
      chip: 'Apple M2 8-core CPU',
      ram: '8GB',
      storage: '256GB SSD',
      display: '13.6 inch Liquid Retina',
      battery: '18 hours'
    },
    stock: 10,
    sold: 67,
    rating: 4.8,
    reviewCount: 189,
    isFeatured: true,
    isHot: false
  },
  {
    name: 'Laptop Dell Inspiron 15 Business Edition',
    price: 13500000,
    originalPrice: 16000000,
    discount: 16,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&h=600&fit=crop'
    ],
    category: 'laptop',
    brand: 'Dell',
    description: 'Dell Inspiron 15 cho công việc văn phòng',
    specifications: {
      cpu: 'Intel Core i5-1235U',
      ram: '8GB DDR4',
      storage: '512GB SSD',
      display: '15.6 inch Full HD'
    },
    stock: 30,
    sold: 23,
    rating: 4.2,
    reviewCount: 45,
    isFeatured: false,
    isHot: false
  },
  {
    name: 'Laptop Lenovo Yoga Slim 9 Pro',
    price: 18000000,
    originalPrice: 22000000,
    discount: 18,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop'
    ],
    category: 'laptop',
    brand: 'Lenovo',
    description: 'Lenovo Yoga Slim mỏng nhẹ, thiết kế sang trọng',
    specifications: {
      cpu: 'Intel Core i7-1360P',
      ram: '16GB LPDDR5',
      storage: '512GB SSD',
      display: '14 inch 2.8K OLED'
    },
    stock: 12,
    sold: 34,
    rating: 4.6,
    reviewCount: 78,
    isFeatured: true,
    isHot: false
  },
  {
    name: 'Apple MacBook Air M2 15" Midnight',
    price: 27900000,
    originalPrice: 31000000,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&h=600&fit=crop'
    ],
    category: 'laptop',
    brand: 'Apple',
    description: 'MacBook Air 15 inch với màn hình lớn hơn',
    specifications: {
      chip: 'Apple M2',
      ram: '8GB',
      storage: '256GB SSD',
      display: '15.3 inch Liquid Retina'
    },
    stock: 8,
    sold: 56,
    rating: 4.9,
    reviewCount: 145,
    isFeatured: true,
    isHot: true
  },
  {
    name: 'Chuột Logitech Master 3S Graphite',
    price: 2250000,
    originalPrice: 2500000,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop'
    ],
    category: 'accessory',
    brand: 'Logitech',
    description: 'Chuột không dây cao cấp với độ chính xác tuyệt vời',
    stock: 50,
    sold: 123,
    rating: 4.7,
    reviewCount: 234,
    isFeatured: false,
    isHot: true
  },
  {
    name: 'Bàn phím cơ AKKO 3068B Multi-mode',
    price: 1800000,
    originalPrice: 2100000,
    discount: 14,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop'
    ],
    category: 'accessory',
    brand: 'AKKO',
    description: 'Bàn phím cơ 65% kết nối đa chế độ',
    stock: 35,
    sold: 87,
    rating: 4.5,
    reviewCount: 156,
    isFeatured: false,
    isHot: false
  },
  {
    name: 'Samsung Galaxy S24 Ultra 12GB 256GB',
    price: 31900000,
    originalPrice: 35000000,
    discount: 9,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop'
    ],
    category: 'phone',
    brand: 'Samsung',
    description: 'Samsung Galaxy S24 Ultra với AI mạnh mẽ',
    specifications: {
      chip: 'Snapdragon 8 Gen 3',
      ram: '12GB',
      storage: '256GB',
      display: '6.8 inch Dynamic AMOLED 2X',
      camera: '200MP + 50MP + 12MP + 10MP'
    },
    stock: 20,
    sold: 145,
    rating: 4.8,
    reviewCount: 289,
    isFeatured: true,
    isHot: true
  },
  {
    name: 'iPad Pro M2 11" WiFi 128GB',
    price: 21900000,
    originalPrice: 24000000,
    discount: 9,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop'
    ],
    category: 'tablet',
    brand: 'Apple',
    description: 'iPad Pro với chip M2, màn hình Liquid Retina',
    specifications: {
      chip: 'Apple M2',
      ram: '8GB',
      storage: '128GB',
      display: '11 inch Liquid Retina'
    },
    stock: 15,
    sold: 78,
    rating: 4.9,
    reviewCount: 167,
    isFeatured: true,
    isHot: false
  },
  {
    name: 'Apple Watch Series 9 GPS 45mm',
    price: 10900000,
    originalPrice: 12000000,
    discount: 9,
    image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&h=600&fit=crop'
    ],
    category: 'watch',
    brand: 'Apple',
    description: 'Apple Watch Series 9 với màn hình luôn bật',
    specifications: {
      chip: 'Apple S9',
      display: '45mm Retina LTPO',
      battery: '18 hours'
    },
    stock: 25,
    sold: 92,
    rating: 4.7,
    reviewCount: 203,
    isFeatured: false,
    isHot: true
  },
  {
    name: 'Tai nghe Sony WH-1000XM5 Wireless',
    price: 8900000,
    originalPrice: 9900000,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop'
    ],
    category: 'audio',
    brand: 'Sony',
    description: 'Tai nghe chống ồn hàng đầu từ Sony',
    specifications: {
      type: 'Over-ear',
      connectivity: 'Bluetooth 5.3',
      battery: '30 hours',
      anc: 'Yes'
    },
    stock: 30,
    sold: 134,
    rating: 4.8,
    reviewCount: 278,
    isFeatured: true,
    isHot: true
  },
  {
    name: 'Dell XPS 13 Intel Core i7',
    price: 28500000,
    originalPrice: 32000000,
    discount: 11,
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&h=600&fit=crop'
    ],
    category: 'laptop',
    brand: 'Dell',
    description: 'Laptop Dell XPS 13 thiết kế cao cấp, hiệu năng mạnh mẽ',
    specifications: {
      cpu: 'Intel Core i7-1355U',
      ram: '16GB LPDDR5',
      storage: '512GB SSD',
      display: '13.4 inch FHD+',
      gpu: 'Intel Iris Xe'
    },
    stock: 15,
    sold: 38,
    rating: 4.6,
    reviewCount: 95,
    isFeatured: true,
    isHot: false
  },
  {
    name: 'Samsung Galaxy Z Fold5 512GB',
    price: 38900000,
    originalPrice: 42000000,
    discount: 7,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop'
    ],
    category: 'phone',
    brand: 'Samsung',
    description: 'Điện thoại gập Samsung Galaxy Z Fold5 màn hình lớn',
    specifications: {
      cpu: 'Snapdragon 8 Gen 2',
      ram: '12GB',
      storage: '512GB',
      display: '7.6 inch AMOLED',
      camera: '50MP + 12MP + 10MP'
    },
    stock: 10,
    sold: 22,
    rating: 4.7,
    reviewCount: 58,
    isFeatured: false,
    isHot: true
  },
  {
    name: 'Xiaomi 14 Ultra 16GB 512GB',
    price: 27900000,
    originalPrice: 30000000,
    discount: 7,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=600&fit=crop'
    ],
    category: 'phone',
    brand: 'Xiaomi',
    description: 'Xiaomi 14 Ultra camera Leica chuyên nghiệp',
    specifications: {
      cpu: 'Snapdragon 8 Gen 3',
      ram: '16GB',
      storage: '512GB',
      display: '6.73 inch AMOLED 2K',
      camera: '50MP Leica Quad Camera'
    },
    stock: 18,
    sold: 64,
    rating: 4.6,
    reviewCount: 142,
    isFeatured: true,
    isHot: true
  },
  {
    name: 'iPad Air M2 11 inch WiFi 256GB',
    price: 18500000,
    originalPrice: 19990000,
    discount: 7,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop'
    ],
    category: 'tablet',
    brand: 'Apple',
    description: 'iPad Air với chip M2 mạnh mẽ, màn hình 11 inch',
    specifications: {
      chip: 'Apple M2',
      ram: '8GB',
      storage: '256GB',
      display: '11 inch Liquid Retina',
      connectivity: 'WiFi 6E'
    },
    stock: 22,
    sold: 87,
    rating: 4.8,
    reviewCount: 176,
    isFeatured: false,
    isHot: false
  },
  {
    name: 'Lenovo ThinkPad X1 Carbon Gen 11',
    price: 42000000,
    originalPrice: 48000000,
    discount: 13,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&h=600&fit=crop'
    ],
    category: 'laptop',
    brand: 'Lenovo',
    description: 'Laptop doanh nhân cao cấp ThinkPad X1 Carbon',
    specifications: {
      cpu: 'Intel Core i7-1355U',
      ram: '32GB LPDDR5',
      storage: '1TB SSD',
      display: '14 inch 2.8K OLED',
      gpu: 'Intel Iris Xe'
    },
    stock: 8,
    sold: 15,
    rating: 4.9,
    reviewCount: 42,
    isFeatured: true,
    isHot: false
  },
  {
    name: 'AirPods Pro 2 USB-C',
    price: 6490000,
    originalPrice: 7000000,
    discount: 7,
    image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=600&h=600&fit=crop'
    ],
    category: 'audio',
    brand: 'Apple',
    description: 'Tai nghe không dây AirPods Pro 2 với chống ồn chủ động',
    specifications: {
      type: 'In-ear',
      connectivity: 'Bluetooth 5.3',
      battery: '6 hours (30 hours with case)',
      anc: 'Yes'
    },
    stock: 45,
    sold: 256,
    rating: 4.7,
    reviewCount: 489,
    isFeatured: true,
    isHot: true
  },
  {
    name: 'Samsung Galaxy Watch6 Classic 47mm',
    price: 8900000,
    originalPrice: 9900000,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=600&fit=crop'
    ],
    category: 'watch',
    brand: 'Samsung',
    description: 'Đồng hồ thông minh Samsung Galaxy Watch6 Classic',
    specifications: {
      chip: 'Exynos W930',
      display: '47mm Super AMOLED',
      battery: '2 days',
      sensors: 'Heart Rate, ECG, Blood Oxygen'
    },
    stock: 28,
    sold: 112,
    rating: 4.5,
    reviewCount: 234,
    isFeatured: false,
    isHot: true
  },
  {
    name: 'Bàn phím cơ Keychron K8 Pro',
    price: 3290000,
    originalPrice: 3690000,
    discount: 11,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop'
    ],
    category: 'accessory',
    brand: 'Keychron',
    description: 'Bàn phím cơ không dây Keychron K8 Pro',
    specifications: {
      layout: 'TKL (87 keys)',
      switch: 'Gateron Pro',
      connectivity: 'Bluetooth 5.1 + USB-C',
      battery: '4000mAh'
    },
    stock: 35,
    sold: 178,
    rating: 4.8,
    reviewCount: 312,
    isFeatured: true,
    isHot: true
  },
  {
    name: 'Chuột Logitech MX Master 3S',
    price: 2490000,
    originalPrice: 2790000,
    discount: 11,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop'
    ],
    category: 'accessory',
    brand: 'Logitech',
    description: 'Chuột không dây cao cấp Logitech MX Master 3S',
    specifications: {
      sensor: '8000 DPI',
      connectivity: 'Bluetooth + USB Receiver',
      battery: '70 days',
      buttons: '7 programmable'
    },
    stock: 42,
    sold: 203,
    rating: 4.9,
    reviewCount: 421,
    isFeatured: false,
    isHot: true
  },
  {
    name: 'HP Pavilion Gaming 15 RTX4050',
    price: 19900000,
    originalPrice: 23000000,
    discount: 13,
    image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600&h=600&fit=crop'
    ],
    category: 'laptop',
    brand: 'HP',
    description: 'Laptop gaming HP Pavilion với RTX 4050',
    specifications: {
      cpu: 'Intel Core i7-13700H',
      ram: '16GB DDR5',
      storage: '512GB SSD',
      display: '15.6 inch FHD 144Hz',
      gpu: 'NVIDIA RTX 4050 6GB'
    },
    stock: 20,
    sold: 67,
    rating: 4.4,
    reviewCount: 128,
    isFeatured: false,
    isHot: true
  },
  {
    name: 'Xiaomi Pad 6 Pro 12.4 inch',
    price: 14900000,
    originalPrice: 16990000,
    discount: 12,
    image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&h=600&fit=crop'
    ],
    category: 'tablet',
    brand: 'Xiaomi',
    description: 'Máy tính bảng Xiaomi Pad 6 Pro màn hình lớn 12.4 inch',
    specifications: {
      cpu: 'Snapdragon 8+ Gen 1',
      ram: '12GB',
      storage: '512GB',
      display: '12.4 inch 3K 120Hz',
      battery: '10000mAh'
    },
    stock: 16,
    sold: 54,
    rating: 4.5,
    reviewCount: 98,
    isFeatured: true,
    isHot: false
  },
  {
    name: 'OPPO Find N3 Flip',
    price: 19990000,
    originalPrice: 22990000,
    discount: 13,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop'
    ],
    category: 'phone',
    brand: 'OPPO',
    description: 'Điện thoại gập OPPO Find N3 Flip thiết kế nhỏ gọn',
    specifications: {
      cpu: 'MediaTek Dimensity 9200',
      ram: '12GB',
      storage: '256GB',
      display: '6.8 inch AMOLED',
      camera: '50MP + 48MP + 32MP'
    },
    stock: 14,
    sold: 41,
    rating: 4.6,
    reviewCount: 87,
    isFeatured: false,
    isHot: false
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('Cleared existing data');

    // Insert categories
    await Category.insertMany(categories);
    console.log('Categories seeded successfully');

    // Insert products
    await Product.insertMany(products);
    console.log('Products seeded successfully');

    console.log(`✅ Seeded ${categories.length} categories and ${products.length} products`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
