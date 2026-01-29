import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { orderService } from '../services/orderService';

const STATUS_STEPS = [
  { key: 'pending', label: 'Đặt hàng thành công', icon: 'checkmark' },
  { key: 'processing', label: 'Đang chuẩn bị hàng', icon: 'receipt-outline' },
  { key: 'shipped', label: 'Đang giao hàng', icon: 'car-outline' },
  { key: 'delivered', label: 'Giao hàng thành công', icon: 'home-outline' },
];

const statusIndex = (status) => {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  if (idx >= 0) return idx;
  return 0;
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return `${d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })}, ${d.toLocaleDateString('vi-VN')}`;
};

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString('vi-VN')}₫`;

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const data = await orderService.getOrderById(orderId);
      setOrder(data);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể tải chi tiết đơn hàng');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const payment = useMemo(() => {
    const items = order?.items || [];
    const subtotal = items.reduce(
      (sum, it) =>
        sum +
        Number(it?.product?.price || 0) * Number(it?.quantity || 0),
      0
    );
    const shippingFee = order?.shippingFee || 0;
    const discount = order?.discount || 0;
    const total = subtotal + shippingFee - discount;
    return { subtotal, shippingFee, discount, total };
  }, [order]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FF4D1A" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.loading}>
        <Text>Không tìm thấy đơn hàng</Text>
      </View>
    );
  }

  const currentStep = statusIndex(order.status);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* STATUS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trạng thái đơn hàng</Text>

          {STATUS_STEPS.map((step, index) => {
            const active = index <= currentStep;
            return (
              <View key={step.key} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.circle,
                      { backgroundColor: active ? '#FF4D1A' : '#DDD' },
                    ]}
                  >
                    <Ionicons
                      name={step.icon}
                      size={16}
                      color="#fff"
                    />
                  </View>
                  {index < STATUS_STEPS.length - 1 && (
                    <View
                      style={[
                        styles.line,
                        { backgroundColor: active ? '#FF4D1A' : '#DDD' },
                      ]}
                    />
                  )}
                </View>
                <View style={styles.timelineRight}>
                  <Text style={styles.stepLabel}>{step.label}</Text>
                  {index === 0 && (
                    <Text style={styles.stepTime}>
                      {formatDateTime(order.createdAt)}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* RECEIVER */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin nhận hàng</Text>
          <Text style={styles.receiverName}>{order.recipient?.name}</Text>
          <Text style={styles.receiverPhone}>{order.recipient?.phone}</Text>
          <Text style={styles.receiverAddress}>
            {order.recipient?.address}
          </Text>
        </View>

        {/* PRODUCTS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Sản phẩm ({order.items.length})
          </Text>

          {order.items.map((it, idx) => (
            <View key={idx} style={styles.productRow}>
              <Image
                source={{
                  uri:
                    it.product?.image ||
                    'https://via.placeholder.com/100',
                }}
                style={styles.productImage}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>
                  {it.product?.name}
                </Text>
                <Text style={styles.productQty}>
                  Số lượng: x{it.quantity}
                </Text>
              </View>
              <Text style={styles.productPrice}>
                {formatMoney(it.product.price * it.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* PAYMENT */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Chi tiết thanh toán</Text>
          <Row label="Tạm tính" value={formatMoney(payment.subtotal)} />
          <Row
            label="Phí vận chuyển"
            value={formatMoney(payment.shippingFee)}
          />
          <Row
            label="Khuyến mãi"
            value={`-${formatMoney(payment.discount)}`}
            green
          />
          <View style={styles.divider} />
          <Row
            label="Tổng cộng"
            value={formatMoney(payment.total)}
            bold
          />
        </View>
      </ScrollView>

      {/* BOTTOM */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() =>
            navigation.navigate('CancelOrder', { orderId: order._id })
          }
        >
          <Text style={styles.cancelText}>Hủy đơn</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.trackBtn}>
          <Text style={styles.trackText}>Theo dõi đơn</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Row = ({ label, value, bold, green }) => (
  <View style={styles.payRow}>
    <Text style={styles.payLabel}>{label}</Text>
    <Text
      style={[
        styles.payValue,
        bold && { fontSize: 18, fontWeight: '700', color: '#FF4D1A' },
        green && { color: '#2E7D32' },
      ]}
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    backgroundColor: '#FF4D1A',
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },

  card: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 14,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },

  timelineRow: { flexDirection: 'row' },
  timelineLeft: { width: 30, alignItems: 'center' },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: { width: 3, flex: 1, marginVertical: 4 },
  timelineRight: { paddingBottom: 16 },
  stepLabel: { fontSize: 14, fontWeight: '600' },
  stepTime: { fontSize: 12, color: '#777', marginTop: 2 },

  receiverName: { fontWeight: '700', fontSize: 15 },
  receiverPhone: { color: '#FF4D1A', marginTop: 4 },
  receiverAddress: { color: '#555', marginTop: 6 },

  productRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  productImage: {
    width: 54,
    height: 54,
    borderRadius: 8,
    marginRight: 10,
  },
  productName: { fontWeight: '600' },
  productQty: { color: '#777', fontSize: 12 },
  productPrice: { fontWeight: '700', color: '#FF0000' },

  payRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  payLabel: { color: '#555' },
  payValue: { fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },

  bottom: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#EEE',
    marginRight: 8,
    borderRadius: 8,
    alignItems: 'center',
    padding: 12,
  },
  cancelText: { fontWeight: '600' },
  trackBtn: {
    flex: 1,
    backgroundColor: '#FF4D1A',
    borderRadius: 8,
    alignItems: 'center',
    padding: 12,
  },
  trackText: { color: '#fff', fontWeight: '700' },
});

export default OrderDetailScreen;
