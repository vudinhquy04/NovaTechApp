import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { orderService } from '../services/orderService';

const CANCEL_REASONS = [
  { value: 'changed_mind', label: 'Thay đổi ý định' },
  { value: 'better_price', label: 'Tìm thấy giá tốt hơn' },
  { value: 'long_delivery', label: 'Thời gian giao hàng quá lâu' },
  { value: 'other', label: 'Khác' },
];

const CancelOrderScreen = ({ route, navigation }) => {
  const { orderId } = route.params || {};
  const [order, setOrder] = useState(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      // For demo purposes, create a mock order if no orderId provided
      setOrder({
        _id: 'demo',
        orderNumber: 'NT-9982',
        totalAmount: 24500000,
        status: 'processing',
        items: [{
          product: {
            name: 'Đèn bàn LED',
            image: 'https://favorlamp.com/wp-content/uploads/2022/09/RD_RL_36_2-768x768.jpg',
            price: 24500000
          },
          quantity: 1
        }]
      });
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const orderData = await orderService.getOrderById(orderId);
      setOrder(orderData);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedReason) {
      Alert.alert('Lỗi', 'Vui lòng chọn lý do hủy đơn');
      return;
    }

    Alert.alert(
      'Xác nhận hủy đơn',
      'Bạn có chắc chắn muốn hủy đơn hàng này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            setSubmitting(true);
            try {
              await orderService.cancelOrder(order._id, {
                cancellationReason: selectedReason,
                cancellationNotes: notes || null
              });
              Alert.alert('Thành công', 'Đơn hàng đã được hủy thành công', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Lỗi', error.message || 'Không thể hủy đơn hàng');
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Text>Không tìm thấy đơn hàng</Text>
      </View>
    );
  }

  const statusLabels = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    shipped: 'Đang giao hàng',
    delivered: 'Đã giao hàng',
    cancelled: 'Đã hủy'
  };

  const statusColors = {
    pending: '#FFA500',
    processing: '#FF8C00',
    shipped: '#4169E1',
    delivered: '#32CD32',
    cancelled: '#DC143C'
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hủy đơn hàng</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
          <View style={styles.orderCard}>
            {order.items && order.items[0] && (
              <Image
                source={{ uri: order.items[0].product?.image || 'https://favorlamp.com/wp-content/uploads/2022/09/RD_RL_36_2-768x768.jpg' }}
                style={styles.productImage}
              />
            )}
            <View style={styles.orderInfo}>
              <Text style={styles.orderNumber}>Đơn hàng #{order.orderNumber}</Text>
              <Text style={styles.totalAmount}>
                Tổng thanh toán: <Text style={styles.amountValue}>{order.totalAmount.toLocaleString('vi-VN')}₫</Text>
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColors[order.status] || '#999' }]}>
              <Text style={styles.statusText}>{statusLabels[order.status] || order.status}</Text>
            </View>
          </View>
        </View>

        {/* Cancellation Reason */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Lý do hủy đơn <Text style={styles.required}>(Bắt buộc)</Text>
          </Text>
          {CANCEL_REASONS.map((reason) => (
            <TouchableOpacity
              key={reason.value}
              style={styles.reasonOption}
              onPress={() => setSelectedReason(reason.value)}
            >
              <Text style={styles.reasonLabel}>{reason.label}</Text>
              <View style={styles.radioContainer}>
                {selectedReason === reason.value ? (
                  <View style={styles.radioSelected}>
                    <View style={styles.radioInner} />
                  </View>
                ) : (
                  <View style={styles.radioUnselected} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Additional Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi chú thêm</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Nhập thêm thông tin chi tiết (tùy chọn)..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
            textAlignVertical="top"
          />
        </View>

        {/* Refund Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color="#FF6B35" />
          <Text style={styles.infoText}>
            Số tiền hoàn lại sẽ được chuyển vào tài khoản của bạn trong vòng 3-5 ngày làm việc sau khi yêu cầu được duyệt.
          </Text>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.confirmButton, submitting && styles.buttonDisabled]}
          onPress={handleCancel}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>XÁC NHẬN HỦY</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  required: {
    color: '#FF0000',
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#2d5016',
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 14,
    color: '#666',
  },
  amountValue: {
    color: '#FF0000',
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  reasonOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  reasonLabel: {
    fontSize: 14,
    color: '#333',
  },
  radioContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioUnselected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  radioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF6B35',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B35',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 100,
    backgroundColor: '#f9f9f9',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF4E6',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    lineHeight: 18,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  confirmButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default CancelOrderScreen;
