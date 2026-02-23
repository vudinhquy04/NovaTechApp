import axios from 'axios';

const API_URL = 'http://192.168.1.2:5000/api/products';

const productService = {
  // Get all products with filters
  getProducts: async (params = {}) => {
    try {
      const response = await axios.get(API_URL, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async () => {
    try {
      const response = await axios.get(`${API_URL}/featured`);
      return response.data;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },

  // Get hot products
  getHotProducts: async () => {
    try {
      const response = await axios.get(`${API_URL}/hot`);
      return response.data;
    } catch (error) {
      console.error('Error fetching hot products:', error);
      throw error;
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Get all categories
  getCategories: async () => {
    try {
      const response = await axios.get(`${API_URL}/categories/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Search products
  searchProducts: async (query) => {
    try {
      console.log('=== SEARCH PRODUCTS DEBUG ===');
      console.log('Search query:', query);
      
      // Try API search first
      try {
        const response = await axios.get(`${API_URL}/search`, {
          params: { q: query }
        });
        console.log('API SEARCH SUCCESS:', response.data);
        return response.data;
      } catch (apiError) {
        console.log('API SEARCH FAILED, using local fallback');
        
        // Fallback: Get all products and filter locally
        const allProducts = await productService.getProducts();
        const products = allProducts.data || allProducts;
        
        if (Array.isArray(products)) {
          const filtered = products.filter(product => 
            product.name?.toLowerCase().includes(query.toLowerCase()) ||
            product.description?.toLowerCase().includes(query.toLowerCase()) ||
            product.category?.toLowerCase().includes(query.toLowerCase())
          );
          
          console.log('LOCAL SEARCH RESULTS:', filtered);
          return { data: filtered };
        } else {
          return { data: [] };
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      return { data: [] };
    }
  },
  // Get related products
  getRelatedProducts: async (category, excludeId, limit = 4) => {
  try {
    const response = await axios.get(`${API_URL}/related`, {
      params: {
        category,
        excludeId,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching related products:', error);
    throw error;
  }
 },
} ;

export default productService;