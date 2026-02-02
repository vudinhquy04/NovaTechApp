import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { orderService } from '../services/orderService';

const TIMELINE_STEPS = [
  { key: 'placed', label: 'Đơn hàng đã đặt', icon: 'checkmark' },
  { key: 'confirmed', label: 'Xác nhận đơn hàng', icon: 'checkmark' },
  { key: 'packing', label: 'Đang đóng gói', icon: 'checkmark' },
  { key: 'shipping', label: 'Đang vận chuyển', icon: 'car-outline' },
  { key: 'delivered', label: 'Giao hàng thành công', icon: 'ellipse-outline' },
];

const statusToStepIndex = (status) => {
  const map = { pending: 0, processing: 2, shipped: 3, delivered: 4 };
  return map[status] ?? 0;
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}, ${d.toLocaleDateString('vi-VN')}`;
};

const OrderStatusScreen = ({ route, navigation }) => {
  const { orderId } = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await orderService.getOrderById(orderId);
        setOrder(data);
      } catch {
        Alert.alert('Lỗi', 'Không thể tải tình trạng đơn hàng');
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) load();
  }, [orderId]);

  const copyTracking = () => {
    const code = order?.trackingCode || 'GHN992837465VN';
    if (Platform.OS === 'web' && navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      Share.share({ message: code, title: 'Mã vận đơn' }).then(() => setCopied(true));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openMap = () => {
    const address = order?.recipient?.address || 'Quận 1, TP. HCM';
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url).catch(() => {});
  };

  const currentStep = order ? statusToStepIndex(order.status) : 0;
  const orderCode = order?.orderNumber || `NT${(orderId || '').slice(-5) || '12345'}`;
  const trackingCode = order?.trackingCode || 'GHN992837465VN';
  const carrierName = order?.carrierName || 'Giao Hàng Nhanh (GHN)';
  const arrivalAddress = order?.recipient?.address || 'Quận 1, TP. HCM';

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tình trạng đơn hàng</Text>
          <TouchableOpacity>
            <Ionicons name="information-circle-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tình trạng đơn hàng</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loading}>
          <Text style={styles.errorText}>Không tìm thấy đơn hàng</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Tình trạng đơn hàng #{orderCode}</Text>
        <TouchableOpacity>
          <Ionicons name="information-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Lộ trình giao hàng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lộ trình giao hàng</Text>
          <View style={styles.timelineCard}>
            {TIMELINE_STEPS.map((step, index) => {
              const isDone = index < currentStep;
              const isCurrent = index === currentStep;
              const isPending = index > currentStep;
              return (
                <View key={step.key} style={styles.timelineRow}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineCircle,
                        isDone && styles.timelineCircleDone,
                        isCurrent && styles.timelineCircleCurrent,
                        isPending && styles.timelineCirclePending,
                      ]}
                    >
                      {isCurrent && step.icon === 'car-outline' ? (
                        <Ionicons name="car-outline" size={16} color="#fff" />
                      ) : (isDone || isCurrent) && step.icon !== 'ellipse-outline' ? (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      ) : isPending && step.icon === 'ellipse-outline' ? (
                        <View style={styles.timelineDot} />
                      ) : null}
                    </View>
                    {index < TIMELINE_STEPS.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          isDone ? styles.timelineLineDone : styles.timelineLinePending,
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.timelineRight}>
                    <Text
                      style={[
                        styles.timelineLabel,
                        isCurrent && styles.timelineLabelCurrent,
                        isPending && styles.timelineLabelPending,
                      ]}
                    >
                      {step.label}
                    </Text>
                    {index === 0 && <Text style={styles.timelineTime}>{formatDateTime(order.createdAt)}</Text>}
                    {index === 1 && (
                      <Text style={styles.timelineTime}>
                        {order.createdAt ? formatDateTime(new Date(new Date(order.createdAt).getTime() + 30 * 60000)) : '11:00, 20/10/2023'}
                      </Text>
                    )}
                    {index === 2 && (
                      <Text style={styles.timelineTime}>
                        {order.updatedAt ? formatDateTime(order.updatedAt) : '14:30, 20/10/2023'}
                      </Text>
                    )}
                    {index === 3 && (
                      <>
                        <Text style={styles.timelineLocation}>Tại kho HCM - Quận 7</Text>
                        <Text style={styles.timelineTime}>Cập nhật: {formatDateTime(order.updatedAt)}</Text>
                      </>
                    )}
                    {index === 4 && (
                      <Text style={styles.timelineTime}>
                        Dự kiến: {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('vi-VN') : '22/10/2023'}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Bản đồ */}
        <View style={styles.section}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="location" size={48} color="#FF6B35" />
            <Text style={styles.mapPlaceholderText}>Bản đồ vị trí</Text>
          </View>
          <View style={styles.mapFooter}>
            <Text style={styles.mapLabel} numberOfLines={1}>Đang đến: {arrivalAddress}</Text>
            <TouchableOpacity onPress={openMap}>
              <Text style={styles.mapLink}>XEM CHI TIẾT &gt;</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Thông tin vận chuyển */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin vận chuyển</Text>
          <View style={styles.shippingCard}>
            <View style={styles.shippingIcon}>
              <Ionicons name="cube-outline" size={24} color="#FF6B35" />
            </View>
            <View style={styles.shippingInfo}>
              <Text style={styles.shippingName}>{carrierName}</Text>
              <Text style={styles.shippingCode}>{trackingCode}</Text>
            </View>
            <TouchableOpacity style={styles.copyBtn} onPress={copyTracking}>
              <Ionicons name="copy-outline" size={18} color="#E53935" />
              <Text style={styles.copyText}>{copied ? 'Đã sao chép' : 'Sao chép'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnPrimary}>
          <Ionicons name="headset-outline" size={22} color="#fff" />
          <Text style={styles.btnPrimaryText}>Liên hệ hỗ trợ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => navigation.navigate('OrderHistory')}
        >
          <Ionicons name="receipt-outline" size={22} color="#1a1a1a" />
          <Text style={styles.btnSecondaryText}>Xem hóa đơn</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#666', fontSize: 15 },

  header: {
    backgroundColor: '#FF6B35',
    paddingTop: Platform.OS === 'ios' ? 48 : 40,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center', marginHorizontal: 8 },

  scroll: { flex: 1 },

  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },

  timelineCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  timelineRow: { flexDirection: 'row' },
  timelineLeft: { width: 32, alignItems: 'center' },
  timelineCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineCircleDone: { backgroundColor: '#FF6B35' },
  timelineCircleCurrent: { backgroundColor: '#FF6B35' },
  timelineCirclePending: { backgroundColor: '#E0E0E0' },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#BBB' },
  timelineLine: { width: 2, flex: 1, marginVertical: 4, backgroundColor: '#E0E0E0' },
  timelineLineDone: { backgroundColor: '#FF6B35' },
  timelineLinePending: { backgroundColor: '#E0E0E0' },
  timelineRight: { flex: 1, paddingBottom: 16 },
  timelineLabel: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  timelineLabelCurrent: { color: '#FF6B35', fontWeight: '700' },
  timelineLabelPending: { color: '#999' },
  timelineTime: { fontSize: 12, color: '#777', marginTop: 2 },
  timelineLocation: { fontSize: 14, color: '#1a1a1a', marginTop: 2 },

  mapPlaceholder: {
    height: 200,
    backgroundColor: '#E8E8E8',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: { marginTop: 8, fontSize: 14, color: '#666' },
  mapFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingHorizontal: 4 },
  mapLabel: { fontSize: 14, color: '#1a1a1a', flex: 1 },
  mapLink: { fontSize: 12, fontWeight: '700', color: '#E53935', marginLeft: 8 },

  shippingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  shippingIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFF4EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shippingInfo: { flex: 1 },
  shippingName: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  shippingCode: { fontSize: 13, color: '#777', marginTop: 4 },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFF4EC',
  },
  copyText: { fontSize: 13, fontWeight: '600', color: '#E53935' },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  btnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 14,
  },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  btnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  btnSecondaryText: { color: '#1a1a1a', fontSize: 15, fontWeight: '600' },
});

export default OrderStatusScreen;
