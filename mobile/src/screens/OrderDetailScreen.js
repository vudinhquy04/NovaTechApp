import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { orderService } from '../services/orderService';

const OrderDetailScreen = ({ route, navigation }) => {
  const { order } = route.params;
  const [loading, setLoading] = React.useState(false);

  console.log('=== ORDER DETAIL DEBUG ===');
  console.log('Order data:', JSON.stringify(order, null, 2));
  console.log('Order items:', order.items);
  console.log('==========================');

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTrackOrder = async () => {
    try {
      setLoading(true);
      const trackingData = await orderService.trackOrder(order._id);
      navigation.navigate('TrackOrder', { orderId: order._id });
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    Alert.alert(
      'Xác nhận hủy đơn',
      'Bạn có chắc muốn hủy đơn hàng này?',
      [
        { text: 'Không', style: 'cancel' },
        { 
          text: 'Có, hủy đơn', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await orderService.cancelOrder(order._id, {
                cancellationReason: 'changed_mind',
                cancellationNotes: 'Khách hàng hủy đơn'
              });
              
              Alert.alert(
                'Thành công',
                'Đơn hàng đã được hủy',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack()
                  }
                ]
              );
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể hủy đơn hàng. Vui lòng thử lại.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      pending: 'ĐANG CHỜ XÁC NHẬN',
      processing: 'ĐANG XỬ LÝ',
      shipped: 'ĐANG GIAO HÀNG',
      delivering: 'ĐANG GIAO',
      delivered: 'ĐÃ GIAO',
      cancelled: 'ĐÃ HỬY',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: '#FFA500',
      processing: '#007BFF',
      shipped: '#17A2B8',
      delivering: '#28A745',
      delivered: '#28A745',
      cancelled: '#DC3545',
    };
    return colorMap[status] || '#6C757D';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={24} color="#FFF" />
          </TouchableOpacity>

          <Text style={styles.title}>Chi tiết đơn hàng</Text>

          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          {/* Order Info */}
          <View style={styles.card}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderNumber}>Mã đơn: {order.orderNumber}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
              </View>
            </View>
            
            <View style={styles.orderInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ngày đặt:</Text>
                <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phương thức:</Text>
                <Text style={styles.infoValue}>
                  {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Thanh toán online'}
                </Text>
              </View>
              
              {order.orderNotes && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Ghi chú:</Text>
                  <Text style={styles.infoValue}>{order.orderNotes}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Shipping Address */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
            <View style={styles.addressContainer}>
              <Ionicons name="location-outline" size={20} color="#FF6B35" style={styles.addressIcon} />
              <View style={styles.addressInfo}>
                <Text style={styles.addressName}>
                  {order.shippingAddress?.name || 'Khách hàng'}
                </Text>
                <Text style={styles.addressPhone}>
                  {order.shippingAddress?.phone || 'N/A'}
                </Text>
                <Text style={styles.addressDetail}>
                  {order.shippingAddress?.address || 'N/A'}, {order.shippingAddress?.ward || 'N/A'}, {order.shippingAddress?.district || 'N/A'}
                </Text>
                <Text style={styles.addressCity}>
                  {order.shippingAddress?.city || 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Order Items */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Sản phẩm</Text>
            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => (
                <View key={index} style={styles.itemContainer}>
                  <Image 
                    source={{ 
                      uri: item.image || 
                           (item.product?.image) || 
                           'https://via.placeholder.com/60x60.png?text=No+Image' 
                    }} 
                    style={styles.itemImage} 
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>
                      {item.name || item.product?.name || 'Sản phẩm'}
                    </Text>
                    <Text style={styles.itemPrice}>
                      {formatPrice(item.price || item.product?.price || 0)}
                    </Text>
                    <View style={styles.itemQuantity}>
                      <Text style={styles.quantityLabel}>Số lượng:</Text>
                      <Text style={styles.quantityValue}>x{item.quantity || 1}</Text>
                    </View>
                  </View>
                  <View style={styles.itemTotal}>
                    <Text style={styles.totalLabel}>Thành tiền:</Text>
                    <Text style={styles.totalValue}>
                      {formatPrice((item.price || item.product?.price || 0) * (item.quantity || 1))}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noItemsText}>Không có thông tin sản phẩm</Text>
            )}
          </View>

          {/* Total */}
          <View style={styles.totalContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalAmount}>{formatPrice(order.totalAmount || 0)}</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            {order.status === 'pending' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancelOrder}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="close-circle-outline" size={20} color="#FFF" />
                    <Text style={styles.actionText}>Hủy đơn</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.actionButton, styles.trackButton]}
              onPress={handleTrackOrder}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="locate-outline" size={20} color="#FFF" />
                  <Text style={styles.actionText}>Theo dõi</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default OrderDetailScreen;
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#FF6B35",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFF",
  },
  orderInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  addressIcon: {
    marginTop: 2,
  },
  addressInfo: {
    flex: 1,
    gap: 4,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  addressPhone: {
    fontSize: 14,
    color: "#666",
  },
  addressDetail: {
    fontSize: 14,
    color: "#333",
  },
  addressCity: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  itemContainer: {
    flexDirection: "row",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#F8F8F8",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    gap: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "bold",
  },
  itemQuantity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityLabel: {
    fontSize: 12,
    color: "#666",
  },
  quantityValue: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },
  itemTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    color: "#666",
  },
  totalValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
  totalContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cancelButton: {
    backgroundColor: "#DC3545",
  },
  trackButton: {
    backgroundColor: "#007BFF",
  },
  actionText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
  noItemsText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: 20,
  },
});
