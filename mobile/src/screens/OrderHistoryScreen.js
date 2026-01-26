import React, { useState, useEffect } from 'react';
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

const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'delivering', label: 'Đang giao' },
  { key: 'delivered', label: 'Đã giao' },
  { key: 'cancelled', label: 'Đã hủy' },
];

const OrderHistoryScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const status = activeTab === 'all' ? null : activeTab;
      const allOrders = await orderService.getOrders(status);
      setOrders(allOrders);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      pending: 'CHỜ XỬ LÝ',
      processing: 'ĐANG XỬ LÝ',
      shipped: 'ĐANG GIAO HÀNG',
      delivered: 'ĐÃ HOÀN THÀNH',
      cancelled: 'ĐÃ HỦY',
    };
    return statusMap[status] || status.toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleTrackOrder = (orderId) => {
    // Navigate to track order screen
    Alert.alert('Theo dõi đơn hàng', 'Tính năng đang phát triển');
  };

  const handleViewDetails = (orderId) => {
    // Navigate to order details screen
    Alert.alert('Chi tiết đơn hàng', 'Tính năng đang phát triển');
  };

  const handleRepurchase = (orderId) => {
    Alert.alert('Mua lại', 'Tính năng đang phát triển');
  };

  const handleRate = (orderId) => {
    // Navigate to product reviews or write review
    // For now, navigate to product reviews with orderId
    navigation.navigate('ProductReviews', { productId: null, orderId });
  };

  const handleViewCancelReason = (orderId) => {
    // Navigate to cancel order screen to view reason
    navigation.navigate('CancelOrder', { orderId, viewOnly: true });
  };

  const renderOrderCard = (order) => {
    const status = order.status;
    const isDelivering = status === 'shipped';
    const isDelivered = status === 'delivered';
    const isCancelled = status === 'cancelled';

    return (
      <View key={order._id} style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.statusText}>{getStatusLabel(status)}</Text>
        </View>

        <View style={styles.orderInfo}>
          <Text style={styles.orderMeta}>
            Mã đơn: #{order.orderNumber} • Ngày đặt: {formatDate(order.createdAt)}
          </Text>
        </View>

        <View style={styles.productSection}>
          {order.items && order.items[0] && (
            <>
              <Image
                source={{
                  uri: order.items[0].product?.image || 'https://favorlamp.com/wp-content/uploads/2022/09/RD_RL_36_2-768x768.jpg',
                }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>
                  Sản phẩm: {order.items[0].product?.name || 'Sản phẩm'} (x{order.items[0].quantity || 1})
                </Text>
                <Text style={styles.totalAmount}>
                  Tổng thanh toán: <Text style={styles.amountValue}>{order.totalAmount.toLocaleString('vi-VN')}₫</Text>
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.actionButtons}>
          {isDelivering && (
            <>
              <TouchableOpacity
                style={styles.trackButton}
                onPress={() => handleTrackOrder(order._id)}
              >
                <Ionicons name="car-outline" size={16} color="#fff" />
                <Text style={styles.trackButtonText}>Theo dõi</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => handleViewDetails(order._id)}
              >
                <Text style={styles.detailButtonText}>Chi tiết</Text>
              </TouchableOpacity>
            </>
          )}

          {isDelivered && (
            <>
              <TouchableOpacity
                style={styles.repurchaseButton}
                onPress={() => handleRepurchase(order._id)}
              >
                <Ionicons name="cart-outline" size={16} color="#FF6B35" />
                <Text style={styles.repurchaseButtonText}>Mua lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => handleRate(order._id)}
              >
                <Text style={styles.detailButtonText}>Đánh giá</Text>
              </TouchableOpacity>
            </>
          )}

          {isCancelled && (
            <TouchableOpacity
              style={styles.cancelDetailButton}
              onPress={() => handleViewCancelReason(order._id)}
            >
              <Text style={styles.cancelDetailButtonText}>Xem chi tiết lý do hủy</Text>
            </TouchableOpacity>
          )}

          {!isDelivering && !isDelivered && !isCancelled && (
            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => handleViewDetails(order._id)}
            >
              <Text style={styles.detailButtonText}>Chi tiết</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử mua hàng</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {orders.map(renderOrderCard)}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  searchButton: {
    padding: 8,
  },
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B35',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  orderCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    padding: 16,
  },
  orderHeader: {
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  orderInfo: {
    marginBottom: 12,
  },
  orderMeta: {
    fontSize: 12,
    color: '#666',
  },
  productSection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 14,
    color: '#666',
  },
  amountValue: {
    color: '#FF0000',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  trackButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  trackButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  detailButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    borderRadius: 8,
  },
  detailButtonText: {
    color: '#333',
    fontSize: 14,
  },
  repurchaseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF6B35',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  repurchaseButtonText: {
    color: '#FF6B35',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelDetailButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelDetailButtonText: {
    color: '#333',
    fontSize: 14,
  },
});

export default OrderHistoryScreen;
