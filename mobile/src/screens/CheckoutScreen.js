import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { createOrder } from '../services/orderService';

export default function CheckoutScreen({ navigation, route }) {
  const { selectedItems = [] } = route.params || {};
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Thông tin giao hàng
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  
  // Phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  const paymentMethods = [
    { id: 'COD', name: 'Thanh toán khi nhận hàng (COD)', icon: 'cash-outline' },
    { id: 'BANKING', name: 'Chuyển khoản ngân hàng', icon: 'card-outline' },
    { id: 'MOMO', name: 'Ví MoMo', icon: 'wallet-outline' },
  ];

  useEffect(() => {
    loadCartData();
    loadUserInfo();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserInfo();
    });
    return unsubscribe;
  }, [navigation]);

  const loadCartData = async () => {
    try {
      const cartData = await AsyncStorage.getItem('cart');
      if (cartData) {
        const parsedCart = JSON.parse(cartData);
        const selected = parsedCart.filter(item => selectedItems.includes(item.id));
        setCart(selected);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const loadUserInfo = async () => {
    try {
      let name = '';
      let phoneNum = '';
      let addr = '';

      // Load personal info
      const personalInfoStr = await AsyncStorage.getItem('personalInfo');
      if (personalInfoStr) {
        const personalInfo = JSON.parse(personalInfoStr);
        name = personalInfo.fullName || '';
        phoneNum = personalInfo.phone || '';
      }

      // Load default shipping address
      const addressesStr = await AsyncStorage.getItem('shippingAddresses');
      if (addressesStr) {
        const addresses = JSON.parse(addressesStr);
        const defaultAddress = addresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          // Nếu personalInfo không có tên/sđt, lấy từ địa chỉ
          if (!name) name = defaultAddress.fullName;
          if (!phoneNum) phoneNum = defaultAddress.phone;
          addr = defaultAddress.address;
        }
      }

      // Fallback to user info nếu không có personalInfo và shippingAddress
      if (!name || !phoneNum || !addr) {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (!name) name = user.fullName || user.name || '';
          if (!phoneNum) phoneNum = user.phone || '';
          if (!addr) addr = user.address || '';
        }
      }

      // Set state một lần cuối
      setFullName(name);
      setPhone(phoneNum);
      setAddress(addr);
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập họ tên');
      return false;
    }
    if (!phone.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập số điện thoại');
      return false;
    }
    if (phone.length < 10) {
      Alert.alert('Thông báo', 'Số điện thoại không hợp lệ');
      return false;
    }
    if (!address.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập địa chỉ giao hàng');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    
    if (cart.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng trống');
      return;
    }

    setLoading(true);

    try {
      // Chuẩn bị dữ liệu đơn hàng
      const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;
      const orderData = {
        orderNumber,
        items: cart.map(item => ({
          product: item.id, // ID sản phẩm
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || item.thumbnail
        })),
        customerInfo: {
          fullName,
          phone,
          address,
          note,
        },
        paymentMethod,
        totalAmount: calculateTotal(),
        shippingFee: 30000,
        finalAmount: calculateTotal() + 30000,
      };

      // Gọi API để tạo đơn hàng
      const response = await createOrder(orderData);
      
      // Lưu đơn hàng vào AsyncStorage để xem offline
      const ordersData = await AsyncStorage.getItem('orders');
      const orders = ordersData ? JSON.parse(ordersData) : [];
      orders.unshift({
        ...response.order,
        _id: response.order._id,
        orderId: response.order._id
      });
      await AsyncStorage.setItem('orders', JSON.stringify(orders));

      // Xóa các sản phẩm đã đặt khỏi giỏ hàng
      const cartData = await AsyncStorage.getItem('cart');
      if (cartData) {
        const allCart = JSON.parse(cartData);
        const remainingCart = allCart.filter(item => !selectedItems.includes(item.id));
        await AsyncStorage.setItem('cart', JSON.stringify(remainingCart));
      }

      // Tạo thông báo mới
      const newNotification = {
        id: Date.now().toString(),
        type: 'order',
        title: 'Đơn hàng đã được đặt thành công',
        message: `Đơn hàng ${orderNumber} của bạn đã được tiếp nhận và đang chờ xác nhận. Chúng tôi sẽ liên hệ với bạn sớm nhất.`,
        time: new Date().toISOString(),
        read: false,
        icon: 'checkmark-circle',
        iconColor: '#4CAF50',
        orderId: response.order._id,
        orderNumber: orderNumber
      };

      // Lưu thông báo vào AsyncStorage
      const notificationsData = await AsyncStorage.getItem('notifications');
      const notifications = notificationsData ? JSON.parse(notificationsData) : [];
      notifications.unshift(newNotification);
      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));

      setLoading(false);

      // Hiển thị thông báo thành công
      Alert.alert(
        'Đặt hàng thành công! 🎉',
        `Mã đơn hàng: ${orderNumber}\nChúng tôi sẽ liên hệ với bạn sớm nhất.`,
        [
          {
            text: 'Xem đơn hàng',
            onPress: () => navigation.replace('OrderDetail', { order: response.order }),
          },
          {
            text: 'Về trang chủ',
            onPress: () => navigation.navigate('Home'),
          },
        ]
      );
    } catch (error) {
      setLoading(false);
      console.error('Error placing order:', error);
      const errorMessage = error.response?.data?.message || 'Không thể đặt hàng. Vui lòng thử lại.';
      Alert.alert('Lỗi', errorMessage);
    }
  };

  const shippingFee = 30000;
  const totalAmount = calculateTotal();
  const finalAmount = totalAmount + shippingFee;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Thông tin giao hàng */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location-outline" size={20} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
            </View>
            <TouchableOpacity 
              onPress={() => navigation.navigate('ShippingAddress')}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Ionicons name="bookmark-outline" size={16} color="#FF6B35" />
              <Text style={{ fontSize: 14, color: '#FF6B35', marginLeft: 4 }}>
                Sổ địa chỉ
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập họ và tên"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số điện thoại"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={11}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ giao hàng *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Nhập địa chỉ chi tiết"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ghi chú (tùy chọn)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ghi chú cho người bán..."
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Phương thức thanh toán */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card-outline" size={20} color="#FF6B35" />
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          </View>

          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                paymentMethod === method.id && styles.paymentMethodActive
              ]}
              onPress={() => setPaymentMethod(method.id)}
            >
              <View style={styles.paymentMethodLeft}>
                <Ionicons 
                  name={method.icon} 
                  size={24} 
                  color={paymentMethod === method.id ? '#FF6B35' : '#666'} 
                />
                <Text style={[
                  styles.paymentMethodText,
                  paymentMethod === method.id && styles.paymentMethodTextActive
                ]}>
                  {method.name}
                </Text>
              </View>
              <View style={[
                styles.radio,
                paymentMethod === method.id && styles.radioActive
              ]}>
                {paymentMethod === method.id && (
                  <View style={styles.radioDot} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sản phẩm đặt hàng */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cart-outline" size={20} color="#FF6B35" />
            <Text style={styles.sectionTitle}>
              Sản phẩm ({cart.length})
            </Text>
          </View>

          {cart.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.itemDetails}>
                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                <Text style={styles.itemPrice}>
                  {formatPrice(item.price * item.quantity)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Chi tiết thanh toán */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt-outline" size={20} color="#FF6B35" />
            <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tạm tính</Text>
            <Text style={styles.priceValue}>{formatPrice(totalAmount)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Phí vận chuyển</Text>
            <Text style={styles.priceValue}>{formatPrice(shippingFee)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{formatPrice(finalAmount)}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer - Đặt hàng */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerLabel}>Tổng thanh toán</Text>
          <Text style={styles.footerPrice}>{formatPrice(finalAmount)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.orderButton, loading && styles.orderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.orderButtonText}>Đặt hàng</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 40,
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFF',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  paymentMethodActive: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF9F6',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  paymentMethodTextActive: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: '#FF6B35',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B35',
  },
  orderItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 13,
    color: '#999',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  footerLeft: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 13,
    color: '#666',
  },
  footerPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginTop: 2,
  },
  orderButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  orderButtonDisabled: {
    backgroundColor: '#CCC',
  },
  orderButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});
