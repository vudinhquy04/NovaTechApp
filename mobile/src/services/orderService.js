import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.2:5000/api/orders';

// Mock order service for testing
export const orderService = {
  // Get all orders for current user
  getOrders: async (status = null) => {
    try {
      console.log('=== GET ORDERS DEBUG ===');
      
      // Try API first
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('Token:', token);
        const params = status ? { status } : {};
        const response = await axios.get(API_URL, {
          params,
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('API SUCCESS - Orders:', response.data);
        
        // Check if API returned empty array
        if (Array.isArray(response.data) && response.data.length === 0) {
          console.log('API returned empty array, checking local orders');
          
          // Fallback to local orders
          const localOrdersData = await AsyncStorage.getItem('localOrders');
          console.log('Raw localOrders data:', localOrdersData);
          
          const localOrders = localOrdersData ? JSON.parse(localOrdersData) : [];
          console.log('Parsed local orders:', localOrders);
          console.log('Local orders length:', localOrders.length);
          
          // Filter by status if provided
          if (status && status !== 'all') {
            const filtered = localOrders.filter(order => order.status === status);
            console.log('Filtered orders by status', status, ':', filtered);
            return filtered;
          }
          
          console.log('Returning all local orders');
          return localOrders;
        }
        
        return response.data;
      } catch (apiError) {
        console.log('API failed, getting local orders:', apiError.message);
        
        // Fallback: Get local orders
        const localOrdersData = await AsyncStorage.getItem('localOrders');
        console.log('Raw localOrders data:', localOrdersData);
        
        const localOrders = localOrdersData ? JSON.parse(localOrdersData) : [];
        console.log('Parsed local orders:', localOrders);
        console.log('Local orders length:', localOrders.length);
        
        // Filter by status if provided
        if (status && status !== 'all') {
          const filtered = localOrders.filter(order => order.status === status);
          console.log('Filtered orders by status', status, ':', filtered);
          return filtered;
        }
        
        console.log('Returning all local orders');
        return localOrders;
      }
    } catch (error) {
      console.error('Get orders error:', error);
      throw new Error('Không thể tải danh sách đơn hàng');
    }
  },

  // Get single order by ID
  getOrderById: async (orderId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token:', token);
      const response = await axios.get(`${API_URL}/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể tải thông tin đơn hàng');
    }
  },

  // Create new order
  createOrder: async (orderData) => {
    console.log('=== ORDER SERVICE DEBUG ===');
    
    // Generate order number FIRST - before any try-catch
    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    console.log('Generated orderNumber:', orderNumber);
    
    // Add orderNumber to order data
    const orderWithNumber = {
      orderNumber,
      ...orderData
    };
    
    console.log('Final order data to send:', JSON.stringify(orderWithNumber, null, 2));
    console.log('==========================');

    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token exists:', !!token);

      // Try API first
      try {
        const response = await axios.post(API_URL, orderWithNumber, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('API SUCCESS:', response.data);
        return response.data;
      } catch (apiError) {
        console.log('API FAILED:', apiError.message);
        console.log('API ERROR DETAILS:', apiError.response?.data);
        
        // Fallback: Create order locally
        const localOrder = {
          _id: `local_${Date.now()}`,
          orderNumber,
          ...orderWithNumber,
          createdAt: new Date().toISOString(),
          isLocal: true
        };

        // Store in AsyncStorage
        const existingOrders = await AsyncStorage.getItem('localOrders') || '[]';
        const orders = JSON.parse(existingOrders);
        orders.push(localOrder);
        await AsyncStorage.setItem('localOrders', JSON.stringify(orders));

        console.log('LOCAL ORDER CREATED:', localOrder);
        return {
          success: true,
          data: localOrder
        };
      }
    } catch (error) {
      console.log('ORDER SERVICE ERROR:', error.message);
      throw new Error(error.response?.data?.message || 'Không thể tạo đơn hàng');
    }
  },

  // Cancel order
  cancelOrder: async (orderId, cancelData) => {
    try {
      console.log('=== CANCEL ORDER DEBUG ===');
      console.log('Order ID:', orderId);
      console.log('Cancel data:', cancelData);
      
      const token = await AsyncStorage.getItem('token');
      console.log('Token:', token);
      
      // Try API first
      try {
        const response = await axios.put(`${API_URL}/${orderId}/cancel`, cancelData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('API CANCEL SUCCESS:', response.data);
        return response.data;
      } catch (apiError) {
        console.log('API CANCEL FAILED, trying local fallback');
        
        // Fallback: Update local order status
        const localOrdersData = await AsyncStorage.getItem('localOrders');
        const localOrders = localOrdersData ? JSON.parse(localOrdersData) : [];
        
        const orderIndex = localOrders.findIndex(order => 
          order._id === orderId || order.orderNumber === orderId
        );
        
        if (orderIndex !== -1) {
          localOrders[orderIndex].status = 'cancelled';
          localOrders[orderIndex].cancellationReason = cancelData.cancellationReason;
          localOrders[orderIndex].cancellationNotes = cancelData.cancellationNotes;
          localOrders[orderIndex].cancelledAt = new Date().toISOString();
          
          await AsyncStorage.setItem('localOrders', JSON.stringify(localOrders));
          console.log('LOCAL CANCEL SUCCESS');
          return localOrders[orderIndex];
        } else {
          throw new Error('Không tìm thấy đơn hàng');
        }
      }
    } catch (error) {
      console.log('CANCEL ERROR:', error);
      throw new Error(error.response?.data?.message || error.message || 'Không thể hủy đơn hàng');
    }
  },

  // Track order
  trackOrder: async (orderId) => {
    try {
      console.log('=== TRACK ORDER DEBUG ===');
      console.log('Order ID:', orderId);
      
      const token = await AsyncStorage.getItem('token');
      
      // Try API first
      try {
        const response = await axios.get(`${API_URL}/${orderId}/track`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('API TRACK SUCCESS:', response.data);
        return response.data;
      } catch (apiError) {
        console.log('API TRACK FAILED, using local fallback');
        
        // Fallback: Get local order with tracking info
        const localOrdersData = await AsyncStorage.getItem('localOrders');
        const localOrders = localOrdersData ? JSON.parse(localOrdersData) : [];
        
        const order = localOrders.find(o => 
          o._id === orderId || o.orderNumber === orderId
        );
        
        if (order) {
          // Mock tracking data
          const trackingData = {
            order: order,
            tracking: [
              {
                status: 'pending',
                title: 'Đơn hàng đã được tạo',
                description: 'Đơn hàng của bạn đã được tạo thành công',
                time: order.createdAt,
                completed: true
              },
              {
                status: 'processing',
                title: 'Đang xử lý',
                description: 'Đơn hàng đang được xử lý',
                time: new Date().toISOString(),
                completed: order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered'
              },
              {
                status: 'shipped',
                title: 'Đang vận chuyển',
                description: 'Đơn hàng đang được giao đến bạn',
                time: new Date().toISOString(),
                completed: order.status === 'shipped' || order.status === 'delivered'
              },
              {
                status: 'delivered',
                title: 'Đã giao hàng',
                description: 'Đơn hàng đã được giao thành công',
                time: new Date().toISOString(),
                completed: order.status === 'delivered'
              }
            ]
          };
          return trackingData;
        } else {
          throw new Error('Không tìm thấy đơn hàng');
        }
      }
    } catch (error) {
      console.log('TRACK ERROR:', error);
      throw new Error(error.response?.data?.message || error.message || 'Không thể theo dõi đơn hàng');
    }
  }
};