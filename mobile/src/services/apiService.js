// Simple API service to provide consistent data
const API_BASE_URL = 'http://192.168.1.2:5000/api';

class ApiService {
  constructor() {
    this.cache = new Map();
  }

  // Simulate network delay
  async delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
    
    // Return cached data if available
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    await this.delay();

    // Mock responses based on endpoint
    let response;
    
    switch (endpoint) {
      case '/products/featured':
        response = {
          success: true,
          data: [
            {
              _id: 'featured1',
              name: 'Laptop Gaming ASUS ROG',
              price: 25000000,
              originalPrice: 30000000,
              discount: 17,
              image: 'https://cdn.tgdd.vn/Products/Images/44/281297/rog-strix-g15-g513rc-hn015w-1-750x500.jpg',
              rating: 4.5,
              sold: 120,
              category: 'laptop',
              description: 'Laptop gaming cao cấp với Intel Core i7, RTX 3070, RAM 16GB',
              specifications: {
                'CPU': 'Intel Core i7-12700H',
                'RAM': '16GB DDR5',
                'Ổ cứng': '1TB NVMe SSD',
                'Card đồ họa': 'NVIDIA RTX 3070',
                'Màn hình': '15.6" FHD 144Hz'
              },
              features: [
                'Chính hãng 100%',
                'Bảo hành 24 tháng',
                'Miễn phí vận chuyển',
                'Đổi trả trong 30 ngày'
              ]
            },
            {
              _id: 'featured2',
              name: 'iPhone 15 Pro Max',
              price: 28000000,
              originalPrice: 32000000,
              discount: 13,
              image: 'https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-titanium-1-750x500.jpg',
              rating: 4.8,
              sold: 200,
              category: 'phone',
              description: 'iPhone 15 Pro Max với chip A17 Pro, camera 48MP, Dynamic Island',
              specifications: {
                'Chip': 'A17 Pro',
                'RAM': '8GB',
                'Bộ nhớ': '256GB',
                'Camera': '48MP + 12MP',
                'Màn hình': '6.7" Super Retina XDR'
              },
              features: [
                'Chính hãng 100%',
                'Bảo hành 12 tháng',
                'Miễn phí vận chuyển',
                'Tặng kèm ốp lưng'
              ]
            }
          ]
        };
        break;

      case '/products/hot':
        response = {
          success: true,
          data: [
            {
              _id: 'hot1',
              name: 'Samsung Galaxy S24 Ultra',
              price: 26000000,
              originalPrice: 29000000,
              discount: 10,
              image: 'https://cdn.tgdd.vn/Products/Images/42/312887/samsung-galaxy-s24-ultra-titanium-black-750x500.jpg',
              rating: 4.7,
              sold: 150,
              category: 'phone',
              description: 'Samsung Galaxy S24 Ultra với camera 200MP, S Pen, màn hình Dynamic AMOLED 2X',
              specifications: {
                'Chip': 'Snapdragon 8 Gen 3',
                'RAM': '12GB',
                'Bộ nhớ': '512GB',
                'Camera': '200MP + 12MP + 10MP',
                'Màn hình': '6.8" Dynamic AMOLED 2X'
              },
              features: [
                'Chính hãng 100%',
                'Bảo hành 12 tháng',
                'Miễn phí vận chuyển',
                'Kháng nước IP68'
              ]
            },
            {
              _id: 'hot2',
              name: 'AirPods Pro 2',
              price: 5500000,
              originalPrice: 6000000,
              discount: 8,
              image: 'https://cdn.tgdd.vn/Products/Images/42/312887/airpods-pro-2-2024-750x500.jpg',
              rating: 4.9,
              sold: 300,
              category: 'audio',
              description: 'AirPods Pro 2 với chip H2, ANC 2x, spatial audio',
              specifications: {
                'Chip': 'Apple H2',
                'Thời gian pin': '6 giờ listening',
                'Chống ồn': 'ANC 2x',
                'Kết nối': 'Bluetooth 5.3'
              },
              features: [
                'Chính hãng 100%',
                'Bảo hành 12 tháng',
                'Miễn phí vận chuyển',
                'Hỗ trợ Spatial Audio'
              ]
            }
          ]
        };
        break;

      case '/products':
        const category = options.category || 'all';
        response = {
          success: true,
          data: this.getProductsByCategory(category, options.search)
        };
        break;

      case '/categories':
        response = {
          success: true,
          data: [
            { name: 'Laptop', slug: 'laptop', icon: 'laptop-outline' },
            { name: 'Điện thoại', slug: 'phone', icon: 'phone-portrait-outline' },
            { name: 'Tablet', slug: 'tablet', icon: 'tablet-portrait-outline' },
            { name: 'Phụ kiện', slug: 'accessory', icon: 'headset-outline' },
            { name: 'Đồng hồ', slug: 'watch', icon: 'watch-outline' },
            { name: 'Âm thanh', slug: 'audio', icon: 'musical-notes-outline' },
            { name: 'Smart Home', slug: 'smart-home', icon: 'home-outline' },
            { name: 'Gaming', slug: 'gaming', icon: 'game-controller-outline' }
          ]
        };
        break;

      case '/products/search':
        const query = options.search || '';
        response = {
          success: true,
          data: this.searchProducts(query)
        };
        break;

      default:
        response = { success: false, message: 'Endpoint not found' };
    }

    // Cache the response
    this.cache.set(cacheKey, response);
    return response;
  }

  getProductsByCategory(category, search = '') {
    const allProducts = [
      // Laptops
      {
        _id: 'laptop1',
        name: 'Dell XPS 13',
        price: 23000000,
        originalPrice: 26000000,
        discount: 12,
        image: 'https://cdn.tgdd.vn/Products/Images/42/305658/dell-xps-13-9310-i7-1360p-2022-xam-1-750x500.jpg',
        rating: 4.3,
        sold: 89,
        category: 'laptop',
        description: 'Dell XPS 13 mỏng nhẹ, hiệu năng cao',
        specifications: {
          'CPU': 'Intel Core i5-1135G7',
          'RAM': '8GB DDR4',
          'Ổ cứng': '256GB SSD',
          'Màn hình': '13.4" FHD+'
        },
        features: [
          'Chính hãng 100%',
          'Bảo hành 12 tháng',
          'Miễn phí vận chuyển'
        ]
      },
      {
        _id: 'laptop2',
        name: 'MacBook Air M2',
        price: 35000000,
        originalPrice: 38000000,
        discount: 8,
        image: 'https://cdn.tgdd.vn/Products/Images/42/305658/macbook-air-m2-2022-midnight-1-750x500.jpg',
        rating: 4.6,
        sold: 156,
        category: 'laptop',
        description: 'MacBook Air M2 siêu mỏng, pin 18 giờ',
        specifications: {
          'Chip': 'Apple M2',
          'RAM': '8GB',
          'Bộ nhớ': '256GB SSD',
          'Thời gian pin': '18 giờ'
        },
        features: [
          'Chính hãng 100%',
          'Bảo hành 12 tháng',
          'Miễn phí vận chuyển'
        ]
      },
      // Phones
      {
        _id: 'phone1',
        name: 'iPhone 14',
        price: 21000000,
        originalPrice: 24000000,
        discount: 13,
        image: 'https://cdn.tgdd.vn/Products/Images/42/305658/iphone-14-2022-blue-1-750x500.jpg',
        rating: 4.5,
        sold: 234,
        category: 'phone',
        description: 'iPhone 14 với chip A15, camera 12MP',
        specifications: {
          'Chip': 'A15 Bionic',
          'RAM': '6GB',
          'Màn hình': '6.1" Super Retina XDR'
        },
        features: [
          'Chính hãng 100%',
          'Bảo hành 12 tháng',
          'Miễn phí vận chuyển'
        ]
      },
      {
        _id: 'phone2',
        name: 'Google Pixel 7',
        price: 18000000,
        originalPrice: 20000000,
        discount: 10,
        image: 'https://cdn.tgdd.vn/Products/Images/42/305658/google-pixel-7-2022-snow-1-750x500.jpg',
        rating: 4.4,
        sold: 167,
        category: 'phone',
        description: 'Google Pixel 7 với camera 50MP, Tensor G2',
        specifications: {
          'Chip': 'Google Tensor G2',
          'RAM': '8GB',
          'Camera': '50MP + 12MP',
          'Pin': '5000mAh'
        },
        features: [
          'Chính hãng 100%',
          'Bảo hành 12 tháng',
          'Miễn phí vận chuyển'
        ]
      },
      // Tablets
      {
        _id: 'tablet1',
        name: 'iPad Air',
        price: 15000000,
        originalPrice: 17000000,
        discount: 12,
        image: 'https://cdn.tgdd.vn/Products/Images/42/305658/ipad-air-2022-wifi-2022-xam-1-750x500.jpg',
        rating: 4.7,
        sold: 289,
        category: 'tablet',
        description: 'iPad Air với chip M1, màn hình 10.9"',
        specifications: {
          'Chip': 'Apple M1',
          'RAM': '8GB',
          'Màn hình': '10.9" Liquid Retina'
        },
        features: [
          'Chính hãng 100%',
          'Bảo hành 12 tháng',
          'Miễn phí vận chuyển'
        ]
      }
    ];

    let filtered = allProducts;

    // Filter by category
    if (category && category !== 'all') {
      filtered = filtered.filter(product => product.category === category);
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }

  searchProducts(query) {
    const allProducts = this.getProductsByCategory();
    
    if (!query) {
      return allProducts.slice(0, 10);
    }

    const searchLower = query.toLowerCase();
    return allProducts.filter(product =>
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower)
    ).slice(0, 20);
  }

  // Product detail
  async getProductById(id) {
    await this.delay();
    
    const allProducts = this.getProductsByCategory();
    const product = allProducts.find(p => p._id === id);
    
    if (product) {
      return {
        success: true,
        data: {
          ...product,
          // Add additional details for product detail
          origin: 'Việt Nam',
          warranty: '12 tháng',
          sku: `NV-${id}`,
          stock: Math.floor(Math.random() * 50) + 10,
          reviewCount: Math.floor(Math.random() * 100) + 20
        }
      };
    }
    
    return {
      success: false,
      message: 'Sản phẩm không tồn tại'
    };
  }

  // Related products
  async getRelatedProducts(category, excludeId) {
    await this.delay();
    
    const categoryProducts = this.getProductsByCategory(category);
    const related = categoryProducts
      .filter(p => p._id !== excludeId)
      .slice(0, 5);
    
    return {
      success: true,
      data: related
    };
  }
}

export default new ApiService();
