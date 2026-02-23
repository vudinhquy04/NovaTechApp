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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProductReviewsScreen = ({ route, navigation }) => {
  const { productId } = route.params || {};
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      
      // Get user's orders that are delivered but not reviewed
      const ordersData = await AsyncStorage.getItem('localOrders');
      const orders = ordersData ? JSON.parse(ordersData) : [];
      
      // Filter delivered orders
      const deliveredOrders = orders.filter(order => 
        order.status === 'delivered' && 
        order.items && 
        order.items.length > 0
      );
      
      // Create pending reviews from delivered orders
      const pendingReviews = deliveredOrders.map(order => ({
        _id: `pending_${order._id}`,
        orderId: order._id,
        orderNumber: order.orderNumber,
        orderDate: order.createdAt,
        canReview: true,
        product: order.items[0], // Use first item as product
        reviewed: false
      }));
      
      setReviews(pendingReviews);
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách sản phẩm cần đánh giá');
    } finally {
      setLoading(false);
    }
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back-outline" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Đánh giá sản phẩm</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Đánh giá sản phẩm</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {reviews.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="star-outline" size={48} color="#DDD" />
              <Text style={styles.emptyText}>Không có sản phẩm nào cần đánh giá</Text>
              <Text style={styles.emptySubText}>Các sản phẩm bạn đã mua sẽ xuất hiện ở đây</Text>
            </View>
          ) : (
            reviews.map((review) => (
              <View key={review._id} style={styles.reviewCard}>
                <View style={styles.productInfo}>
                  <Image 
                    source={{ 
                      uri: review.product?.image || 
                           review.product?.product?.image || 
                           'https://via.placeholder.com/80x80.png?text=No+Image' 
                    }} 
                    style={styles.productImage} 
                  />
                  <View style={styles.productDetails}>
                    <Text style={styles.productName}>
                      {review.product?.name || review.product?.product?.name || 'Sản phẩm'}
                    </Text>
                    <Text style={styles.productPrice}>
                      {formatPrice(review.product?.price || review.product?.product?.price || 0)}
                    </Text>
                    <Text style={styles.orderInfo}>
                      Mã đơn: {review.orderNumber}
                    </Text>
                    <Text style={styles.orderDate}>
                      Đã mua ngày: {formatDate(review.orderDate)}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={() => navigation.navigate('WriteReview', { 
                    productId: review.product?._id || review.product?.product?._id,
                    orderId: review.orderId,
                    product: review.product
                  })}
                >
                  <Ionicons name="create-outline" size={16} color="#FFF" />
                  <Text style={styles.reviewButtonText}>Viết đánh giá</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  reviewCard: {
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
  productInfo: {
    flexDirection: "row",
    marginBottom: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F8F8F8",
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B35",
    marginBottom: 4,
  },
  orderInfo: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 13,
    color: "#666",
  },
  reviewButton: {
    backgroundColor: "#FF6B35",
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
  reviewButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default ProductReviewsScreen;
