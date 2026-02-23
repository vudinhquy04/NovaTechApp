import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { orderService } from '../services/orderService';

export default function CheckoutScreen({ navigation, route }) {
  const [cart, setCart] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { selectedAddress: routeAddress } = route.params || {};

  useFocusEffect(
    React.useCallback(() => {
      loadCart();
      if (routeAddress) {
        setSelectedAddress(routeAddress);
      }
    }, [routeAddress])
  );

  const loadCart = async () => {
    try {
      const data = await AsyncStorage.getItem('cart');
      const cartData = data ? JSON.parse(data) : [];
      setCart(cartData.filter(item => item && item.id));
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const loadDefaultAddress = async () => {
    try {
      const data = await AsyncStorage.getItem('addresses');
      const addresses = data ? JSON.parse(data) : [];
      const defaultAddr = addresses.find(addr => addr.isDefault) || addresses[0];
      if (defaultAddr && !selectedAddress) {
        setSelectedAddress(defaultAddr);
      }
    } catch (error) {
      console.error('Error loading default address:', error);
    }
  };

  useEffect(() => {
    loadDefaultAddress();
  }, []);

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    // Free shipping for orders over 500k
    const total = calculateTotal();
    return total >= 500000 ? 0 : 30000;
  };

  const calculateFinalTotal = () => {
    return calculateTotal() + calculateShipping();
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      Alert.alert('Lỗi', 'Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Lỗi', 'Giỏ hàng trống');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        totalAmount: calculateFinalTotal(),
        shippingAddress: selectedAddress,
        paymentMethod,
        orderNotes,
        status: 'pending'
      };

      console.log('Sending order data:', orderData);

      const response = await orderService.createOrder(orderData);
      
      console.log('Order response:', response);
      
      if (response.success) {
        // Clear cart
        await AsyncStorage.setItem('cart', JSON.stringify([]));
        
        Alert.alert(
          'Đặt hàng thành công!',
          `Mã đơn hàng: ${response.data.orderNumber || response.data._id}\nĐơn hàng của bạn đang chờ xác nhận.`,
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('OrderHistory', { initialTab: 'pending' });
              }
            }
          ]
        );
      } else {
        Alert.alert('Lỗi', 'Không thể đặt hàng. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Lỗi', 'Không thể đặt hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const selectAddress = () => {
    navigation.navigate('Address', { fromCheckout: true });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Đang xử lý đơn hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Shipping Address */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={20} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
            </View>
            
            {selectedAddress ? (
              <TouchableOpacity style={styles.addressCard} onPress={selectAddress}>
                <View style={styles.addressContent}>
                  <View style={styles.addressInfo}>
                    <Text style={styles.addressName}>{selectedAddress.name}</Text>
                    <Text style={styles.addressPhone}>{selectedAddress.phone}</Text>
                    <Text style={styles.addressDetail}>
                      {selectedAddress.address}, {selectedAddress.ward && `${selectedAddress.ward}, `}
                      {selectedAddress.district}, {selectedAddress.city}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.addAddressButton} onPress={selectAddress}>
                <Ionicons name="add-circle-outline" size={20} color="#FF6B35" />
                <Text style={styles.addAddressText}>Chọn địa chỉ giao hàng</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Order Items */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cart-outline" size={20} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Sản phẩm ({cart.length})</Text>
            </View>
            
            {cart.map((item, index) => (
              <View key={item.id} style={styles.orderItem}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemPrice}>{item.price.toLocaleString()}đ</Text>
                    <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                  </View>
                </View>
                <Text style={styles.itemTotal}>
                  {(item.price * item.quantity).toLocaleString()}đ
                </Text>
              </View>
            ))}
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="card-outline" size={20} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            </View>
            
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'cod' && styles.selectedPayment]}
              onPress={() => setPaymentMethod('cod')}
            >
              <Ionicons 
                name={paymentMethod === 'cod' ? "radio-button-on" : "radio-button-off"} 
                size={20} 
                color={paymentMethod === 'cod' ? "#FF6B35" : "#666"} 
              />
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>Thanh toán khi nhận hàng (COD)</Text>
                <Text style={styles.paymentDesc}>Thanh toán bằng tiền mặt khi nhận hàng</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'bank' && styles.selectedPayment]}
              onPress={() => setPaymentMethod('bank')}
            >
              <Ionicons 
                name={paymentMethod === 'bank' ? "radio-button-on" : "radio-button-off"} 
                size={20} 
                color={paymentMethod === 'bank' ? "#FF6B35" : "#666"} 
              />
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>Chuyển khoản ngân hàng</Text>
                <Text style={styles.paymentDesc}>Chuyển khoản trước khi giao hàng</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Order Notes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={20} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Ghi chú đơn hàng</Text>
            </View>
            
            <TextInput
              style={styles.notesInput}
              value={orderNotes}
              onChangeText={setOrderNotes}
              placeholder="Nhập ghi chú cho đơn hàng (tùy chọn)"
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="receipt-outline" size={20} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính</Text>
              <Text style={styles.summaryValue}>{calculateTotal().toLocaleString()}đ</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
              <Text style={styles.summaryValue}>
                {calculateShipping() === 0 ? 'Miễn phí' : calculateShipping().toLocaleString() + 'đ'}
              </Text>
            </View>
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>{calculateFinalTotal().toLocaleString()}đ</Text>
            </View>
            
            {calculateTotal() < 500000 && (
              <Text style={styles.freeShippingNote}>
                Mua thêm {(500000 - calculateTotal()).toLocaleString()}đ để được miễn phí vận chuyển
              </Text>
            )}
          </View>
        </ScrollView>

        {/* Checkout Button */}
        <View style={styles.checkoutSection}>
          <TouchableOpacity
            style={[
              styles.checkoutButton,
              (!selectedAddress || cart.length === 0) && styles.checkoutButtonDisabled
            ]}
            onPress={handleCheckout}
            disabled={!selectedAddress || cart.length === 0}
          >
            <Text style={styles.checkoutButtonText}>
              Đặt hàng • {calculateFinalTotal().toLocaleString()}đ
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  addressCard: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
  },
  addressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  addressDetail: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  addAddressText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
    marginLeft: 8,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedPayment: {
    backgroundColor: '#FFF5F0',
  },
  paymentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  paymentDesc: {
    fontSize: 14,
    color: '#666',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    height: 80,
    textAlignVertical: 'top',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
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
  freeShippingNote: {
    fontSize: 12,
    color: '#FF6B35',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  checkoutSection: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  checkoutButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    opacity: 0.5,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
