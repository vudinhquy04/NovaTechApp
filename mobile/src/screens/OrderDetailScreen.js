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
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Chi tiết thanh toán</Text>
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
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Hủy đơn hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Đánh giá sản phẩm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default OrderDetailScreen;

