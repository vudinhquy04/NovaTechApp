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
  { key: 'delivered', label: 'Giao hàng dự kiến', icon: 'home-outline' },
];

const statusIndex = (status) => {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  if (idx >= 0) return idx;
  return status === 'cancelled' ? 1 : 0;
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const date = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return `${time}, ${date}`;
};

const formatMoney = (value) => {
  const num = Number(value || 0);
  return `${num.toLocaleString('vi-VN')}₫`;
};

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId, order: orderFromRoute, recipient, payment } = route.params || {};
  const [order, setOrder] = useState(orderFromRoute || null);
  const [loading, setLoading] = useState(!orderFromRoute && !!orderId);

  useEffect(() => {
    if (!orderFromRoute && orderId) {
      fetchOrder();
    }
   
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrderById(orderId);
      setOrder(data);
    } catch (e) {
      Alert.alert('Lỗi', e.message || 'Không thể tải chi tiết đơn hàng');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const derivedPayment = useMemo(() => {
    const items = order?.items || [];
    const subtotal = items.reduce((sum, it) => sum + (Number(it?.product?.price || 0) * Number(it?.quantity || 0)), 0);
    const shippingFee = Number(payment?.shippingFee ?? 0);
    const discount = Number(payment?.discount ?? 0);
    const total = Number(payment?.total ?? order?.totalAmount ?? subtotal + shippingFee - discount);
    return { subtotal, shippingFee, discount, total };
  }, [order, payment]);

  const currentStepIndex = useMemo(() => statusIndex(order?.status), [order?.status]);
  const isCancelled = order?.status === 'cancelled';
  const isDelivered = order?.status === 'delivered';

  const receiverName = recipient?.name || recipient?.fullName || 'Chưa có thông tin';
  const receiverPhone = recipient?.phone || '—';
  const receiverAddress = recipient?.address || '—';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4D1A" />
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
          <Text style={styles.headerSubTitle}>Mã đơn: #{order.orderNumber}</Text>
        </View>
        <TouchableOpacity
          onPress={() => Alert.alert('Hỗ trợ', 'Tính năng hỗ trợ đang phát triển')}
          style={styles.headerIconBtn}
        >
          <Ionicons name="help-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trạng thái đơn hàng</Text>

          {isCancelled ? (
            <View style={styles.cancelBanner}>
              <Ionicons name="close-circle" size={18} color="#C62828" />
              <Text style={styles.cancelBannerText}>Đơn hàng đã bị hủy</Text>
            </View>
          ) : null}

          <View style={styles.timelineWrap}>
            {STATUS_STEPS.map((step, idx) => {
              const active = idx <= currentStepIndex && !isCancelled;
              const isCurrent = idx === currentStepIndex && !isCancelled;
              const circleBg = active ? '#FF4D1A' : '#E9E9E9';
              const circleFg = active ? '#fff' : '#A6A6A6';

              let sub = '';
              if (idx === 0) sub = formatDateTime(order.createdAt);
              if (idx === 1 && order.updatedAt) sub = formatDateTime(order.updatedAt);
              if (idx === 2 && order.updatedAt) sub = 'Đã rời kho phân loại';
              if (idx === 3 && isDelivered) sub = formatDateTime(order.updatedAt);

              return (
                <View key={step.key} style={styles.timelineRow}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineCircle, { backgroundColor: circleBg }]}>
                      <Ionicons name={step.icon} size={18} color={circleFg} />
                    </View>
                    {idx !== STATUS_STEPS.length - 1 ? (
                      <View style={[styles.timelineLine, { backgroundColor: active ? '#FF4D1A' : '#E9E9E9' }]} />
                    ) : null}
                  </View>

                  <View style={styles.timelineRight}>
                    <Text style={[styles.timelineLabel, active && styles.timelineLabelActive]}>
                      {step.label}
                      {isCurrent ? '' : ''}
                    </Text>
                    {!!sub && <Text style={styles.timelineSub}>{sub}</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="location-outline" size={18} color="#FF4D1A" />
            <Text style={styles.cardTitle}>Thông tin nhận hàng</Text>
          </View>
          <View style={styles.receiverRow}>
            <Text style={styles.receiverName}>{receiverName}</Text>
            <Text style={styles.receiverPhone}>{receiverPhone}</Text>
          </View>
          <Text style={styles.receiverAddress}>{receiverAddress}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sản phẩm ({(order.items || []).length})</Text>
          {(order.items || []).map((it, idx) => (
            <View key={`${it?.product?.name || 'item'}-${idx}`} style={styles.productRow}>
              <Image
                source={{
                  uri:
                    it?.product?.image ||
                    'https://favorlamp.com/wp-content/uploads/2022/09/RD_RL_36_2-768x768.jpg',
                }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {it?.product?.name || 'Sản phẩm'}
                </Text>
                <Text style={styles.productMeta}>
                  Số lượng: x{Number(it?.quantity || 0)}
                </Text>
              </View>
              <Text style={styles.productPrice}>
                {formatMoney(Number(it?.product?.price || 0) * Number(it?.quantity || 0))}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Chi tiết thanh toán</Text>

          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Tạm tính</Text>
            <Text style={styles.payValue}>{formatMoney(derivedPayment.subtotal)}</Text>
          </View>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Phí vận chuyển</Text>
            <Text style={styles.payValue}>{formatMoney(derivedPayment.shippingFee)}</Text>
          </View>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Khuyến mãi</Text>
            <Text style={[styles.payValue, styles.discountValue]}>
              -{formatMoney(derivedPayment.discount)}
            </Text>
          </View>

          <View style={styles.payDivider} />

          <View style={styles.payTotalRow}>
            <Text style={styles.payTotalLabel}>Tổng cộng</Text>
            <Text style={styles.payTotalValue}>{formatMoney(derivedPayment.total)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {!isDelivered && !isCancelled ? (
          <>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('CancelOrder', { orderId: order._id })}
            >
              <Text style={styles.secondaryBtnText}>Hủy đơn hàng</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => Alert.alert('Theo dõi', 'Tính năng đang phát triển')}
            >
              <Text style={styles.primaryBtnText}>Theo dõi đơn</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('OrderHistory')}
            >
              <Text style={styles.secondaryBtnText}>Quay lại</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigation.navigate('ProductReviews', { orderId: order._id })}
            >
              <Text style={styles.primaryBtnText}>Đánh giá sản phẩm</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },

  header: {
    backgroundColor: '#FF4D1A',
    paddingTop: 46,
    paddingBottom: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitleWrap: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerSubTitle: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 2 },

  scrollView: { flex: 1 },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#222', marginBottom: 12 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },

  cancelBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  cancelBannerText: { color: '#C62828', fontWeight: '600' },

  timelineWrap: { paddingTop: 4 },
  timelineRow: { flexDirection: 'row' },
  timelineLeft: { width: 34, alignItems: 'center' },
  timelineCircle: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  timelineLine: { width: 3, flex: 1, borderRadius: 2, marginTop: 4, marginBottom: 4 },
  timelineRight: { flex: 1, paddingBottom: 14 },
  timelineLabel: { fontSize: 14, fontWeight: '600', color: '#666' },
  timelineLabelActive: { color: '#111' },
  timelineSub: { marginTop: 3, fontSize: 12, color: '#888' },

  receiverRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  receiverName: { fontSize: 16, fontWeight: '700', color: '#222' },
  receiverPhone: { fontSize: 14, color: '#FF4D1A', fontWeight: '700' },
  receiverAddress: { marginTop: 6, color: '#666', fontSize: 13, lineHeight: 18 },

  productRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  productImage: { width: 54, height: 54, borderRadius: 10, backgroundColor: '#f0f0f0', marginRight: 10 },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '600', color: '#222' },
  productMeta: { marginTop: 4, fontSize: 12, color: '#888' },
  productPrice: { fontSize: 14, fontWeight: '700', color: '#FF0000' },

  payRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  payLabel: { color: '#666', fontSize: 13 },
  payValue: { color: '#111', fontSize: 13, fontWeight: '600' },
  discountValue: { color: '#1B8F2A' },
  payDivider: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },
  payTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  payTotalLabel: { fontSize: 15, color: '#111', fontWeight: '700' },
  payTotalValue: { fontSize: 20, color: '#FF0000', fontWeight: '800' },

  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  secondaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { color: '#333', fontSize: 14, fontWeight: '600' },
  primaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FF4D1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

export default OrderDetailScreen;

