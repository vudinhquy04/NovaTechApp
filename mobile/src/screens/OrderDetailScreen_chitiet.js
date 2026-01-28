<<<<<<< HEAD
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
=======
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const OrderDetailScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.orderCodeBox}>
          <Text style={styles.orderCodeLabel}>Mã đơn:</Text>
          <Text style={styles.orderCodeValue}>#NT-99283001</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trạng thái đơn hàng</Text>
          <View style={styles.timeline}>
            <View style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={styles.iconCircleActive}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
                <View style={styles.timelineLineActive} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Đặt hàng thành công</Text>
                <Text style={styles.timelineTime}>10:30, 20/05/2024</Text>
              </View>
            </View>

            <View style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={styles.iconCircleActive}>
                  <Ionicons name="cube-outline" size={16} color="#fff" />
                </View>
                <View style={styles.timelineLineActive} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Đang chuẩn bị hàng</Text>
                <Text style={styles.timelineTime}>14:15, 20/05/2024</Text>
              </View>
            </View>

            <View style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={styles.iconCircleCurrent}>
                  <Ionicons name="car-outline" size={16} color="#fff" />
                </View>
                <View style={styles.timelineLineInactive} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTitle, styles.timelineTitleActive]}>
                  Đang giao hàng
                </Text>
                <Text style={styles.timelineTime}>
                  Đã rời kho phân loại lúc 08:00, 21/05
                </Text>
              </View>
            </View>

            <View style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={styles.iconCircleInactive} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitleMuted}>Giao hàng dự kiến</Text>
                <Text style={styles.timelineTimeMuted}>
                  Dự kiến 22/05/2024
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin nhận hàng</Text>
          <View style={styles.shippingInfoRow}>
            <View style={styles.shippingText}>
              <Text style={styles.receiverName}>Nguyễn Văn An</Text>
              <Text style={styles.receiverPhone}>090 123 4567</Text>
              <Text style={styles.receiverAddress}>
                123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh
              </Text>
            </View>
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map-outline" size={22} color="#FF6B35" />
              <Text style={styles.mapText}>Bản đồ</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sản phẩm (2)</Text>

          <View style={styles.productRow}>
            <View style={styles.productImagePlaceholder}>
              <Text style={styles.productImageText}>NovaTech</Text>
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>
                NovaTech Wireless Pro Gen 2
              </Text>
              <Text style={styles.productVariant}>Màu sắc: Midnight Silver</Text>
              <View style={styles.productMeta}>
                <Text style={styles.productQty}>Số lượng: x1</Text>
                <Text style={styles.productPrice}>4.290.000₫</Text>
              </View>
            </View>
          </View>

          <View style={styles.productRow}>
            <View style={styles.productImagePlaceholder}>
              <Text style={styles.productImageText}>NovaTech</Text>
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>Bàn phím cơ NovaTech K7 Slim</Text>
              <Text style={styles.productVariant}>Switch: Brown Silent</Text>
              <View style={styles.productMeta}>
                <Text style={styles.productQty}>Số lượng: x1</Text>
                <Text style={styles.productPrice}>1.850.000₫</Text>
              </View>
            </View>
          </View>
>>>>>>> 2a0e3f5c (Add Home & OderDetail)
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Chi tiết thanh toán</Text>
<<<<<<< HEAD

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
=======
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>6.140.000₫</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
            <Text style={styles.summaryValue}>35.000₫</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Khuyến mãi</Text>
            <Text style={styles.summaryDiscount}>-150.000₫</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Tổng cộng</Text>
            <Text style={styles.summaryTotalValue}>6.025.000₫</Text>
          </View>
          <Text style={styles.summaryNote}>
            Đã thanh toán qua Thẻ tín dụng (VISA ***4423)
          </Text>
>>>>>>> 2a0e3f5c (Add Home & OderDetail)
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
<<<<<<< HEAD
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
=======
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Hủy đơn hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Đánh giá sản phẩm</Text>
        </TouchableOpacity>
>>>>>>> 2a0e3f5c (Add Home & OderDetail)
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
<<<<<<< HEAD
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
=======
  container: {
    flex: 1,
    backgroundColor: '#FF6B35',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FF6B35',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  orderCodeBox: {
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: '#FFF4EC',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderCodeLabel: {
    color: '#555',
    fontSize: 14,
  },
  orderCodeValue: {
    color: '#FF6B35',
    fontWeight: 'bold',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  timeline: {
    marginTop: 4,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineLeft: {
    alignItems: 'center',
  },
  timelineContent: {
    paddingBottom: 16,
    marginLeft: 12,
    flex: 1,
    borderBottomWidth: 0,
  },
  iconCircleActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleCurrent: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF9F68',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleInactive: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#DDD',
    marginTop: 4,
  },
  timelineLineActive: {
    width: 2,
    flex: 1,
    backgroundColor: '#FF9F68',
  },
  timelineLineInactive: {
    width: 2,
    flex: 1,
    backgroundColor: '#EEE',
  },
  timelineTitle: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  timelineTitleActive: {
    color: '#FF6B35',
  },
  timelineTitleMuted: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  timelineTime: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  timelineTimeMuted: {
    fontSize: 12,
    color: '#BBB',
    marginTop: 4,
  },
  shippingInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  shippingText: {
    flex: 1,
    paddingRight: 8,
  },
  receiverName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  receiverPhone: {
    fontSize: 14,
    color: '#FF6B35',
    marginTop: 4,
  },
  receiverAddress: {
    fontSize: 13,
    color: '#555',
    marginTop: 6,
    lineHeight: 18,
  },
  mapPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: '#FFF4EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    marginTop: 4,
    fontSize: 11,
    color: '#FF6B35',
    fontWeight: '600',
  },
  productRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  productImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F1F2F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productImageText: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  productVariant: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  productQty: {
    fontSize: 12,
    color: '#555',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#555',
  },
  summaryValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
  },
  summaryDiscount: {
    fontSize: 14,
    color: '#0ABF53',
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 10,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  summaryNote: {
    marginTop: 8,
    fontSize: 12,
    color: '#777',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  secondaryButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  secondaryButtonText: {
    color: '#FF6B35',
    fontWeight: '600',
    fontSize: 14,
  },
  primaryButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
>>>>>>> 2a0e3f5c (Add Home & OderDetail)
});

export default OrderDetailScreen;

