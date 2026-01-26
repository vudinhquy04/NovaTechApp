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
import { reviewService } from '../services/reviewService';

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'with_images', label: 'Có hình ảnh' },
  { key: '5', label: '★ 5 sao' },
  { key: 'newest', label: 'Mới nhất' },
];

const ProductReviewsScreen = ({ route, navigation }) => {
  const { productId } = route.params || {};
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (productId) {
      fetchData();
    } else {
      // Demo data
      setStats({
        averageRating: 4.8,
        totalReviews: 1240,
        ratingDistribution: {
          '5': 75,
          '4': 15,
          '3': 5,
          '2': 3,
          '1': 2
        }
      });
      setReviews([
        {
          _id: '1',
          user: { name: 'Lê Minh Tuấn' },
          rating: 5,
          comment: 'NovaBook Pro chạy cực kỳ mượt mà, màn hình 4K hiển thị màu sắc rất trung thực. Build hoàn thiện cao cấp, vỏ nhôm cầm rất chắc tay. Rất đáng tiền cho dân đồ họa!',
          images: ['https://favorlamp.com/wp-content/uploads/2022/09/RD_RL_36_2-768x768.jpg', 'https://favorlamp.com/wp-content/uploads/2022/09/RD_RL_36_2-768x768.jpg', 'https://favorlamp.com/wp-content/uploads/2022/09/RD_RL_36_2-768x768.jpg'],
          helpfulCount: 12,
          verifiedPurchase: true,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '2',
          user: { name: 'Nguyễn Thị Hoa' },
          rating: 5,
          comment: 'Laptop thiết kế mỏng nhẹ, pin trâu đúng như mô tả. Giao hàng cực nhanh, mình ở HCM đặt sáng chiều có luôn. Rất hài lòng với dịch vụ NovaTech.',
          helpfulCount: 5,
          verifiedPurchase: true,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '3',
          user: { name: 'Trần Văn Đức' },
          rating: 5,
          comment: 'Hiệu năng tốt trong tầm giá, chiến game phà phà. Tuy nhiên máy hơi nóng khi render video dài, quạt tản nhiệt hơi ồn xíu nhưng không đáng kể.',
          helpfulCount: 2,
          verifiedPurchase: true,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
      setLoading(false);
    }
  }, [productId, activeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reviewsData, statsData] = await Promise.all([
        reviewService.getProductReviews(productId, activeFilter === 'all' ? null : activeFilter, activeFilter === 'newest' ? 'newest' : null),
        reviewService.getProductReviewStats(productId)
      ]);
      setReviews(reviewsData);
      setStats(statsData);
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : star === Math.ceil(rating) && rating % 1 !== 0 ? 'star-half' : 'star-outline'}
            size={16}
            color="#FF6B35"
          />
        ))}
      </View>
    );
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} tuần trước`;
    return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
  };

  const handleHelpful = async (reviewId) => {
    try {
      if (productId) {
        await reviewService.markHelpful(reviewId);
        fetchData();
      } else {
        Alert.alert('Thông báo', 'Đã đánh dấu hữu ích');
      }
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    }
  };

  const handleReply = (reviewId) => {
    Alert.alert('Phản hồi', 'Tính năng đang phát triển');
  };

  const renderRatingBar = (rating, percentage) => {
    return (
      <View key={rating} style={styles.ratingBarRow}>
        <Text style={styles.ratingLabel}>{rating} sao</Text>
        <View style={styles.ratingBarContainer}>
          <View style={[styles.ratingBar, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.ratingPercentage}>{percentage}%</Text>
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
        <Text style={styles.headerTitle}>Đánh giá sản phẩm</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Rating Summary */}
          {stats && (
            <View style={styles.ratingSummary}>
              <Text style={styles.averageRating}>{stats.averageRating}</Text>
              {renderStars(stats.averageRating)}
              <Text style={styles.totalReviews}>{stats.totalReviews.toLocaleString('vi-VN')} đánh giá</Text>
            </View>
          )}

          {/* Rating Distribution */}
          {stats && (
            <View style={styles.ratingDistribution}>
              {[5, 4, 3, 2, 1].map((rating) =>
                renderRatingBar(rating, stats.ratingDistribution[rating.toString()] || 0)
              )}
            </View>
          )}

          {/* Filters */}
          <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {FILTERS.map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterButton,
                    activeFilter === filter.key && styles.activeFilterButton,
                  ]}
                  onPress={() => setActiveFilter(filter.key)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      activeFilter === filter.key && styles.activeFilterText,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Reviews List */}
          <View style={styles.reviewsList}>
            {reviews.map((review) => (
              <View key={review._id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {review.user?.name?.charAt(0) || 'U'}
                      </Text>
                    </View>
                    <View style={styles.reviewerDetails}>
                      <Text style={styles.reviewerName}>{review.user?.name || 'Người dùng'}</Text>
                      {review.verifiedPurchase && (
                        <View style={styles.verifiedBadge}>
                          <Ionicons name="checkmark-circle" size={12} color="#32CD32" />
                          <Text style={styles.verifiedText}>ĐÃ MUA HÀNG</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Text style={styles.timeAgo}>{formatTimeAgo(review.createdAt)}</Text>
                </View>

                {renderStars(review.rating)}

                <Text style={styles.reviewComment}>{review.comment}</Text>

                {review.images && review.images.length > 0 && (
                  <View style={styles.reviewImages}>
                    {review.images.slice(0, 3).map((image, index) => (
                      <Image
                        key={index}
                        source={{ uri: image }}
                        style={styles.reviewImage}
                      />
                    ))}
                    {review.images.length > 3 && (
                      <View style={styles.moreImages}>
                        <Text style={styles.moreImagesText}>+{review.images.length - 3}</Text>
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.reviewActions}>
                  <TouchableOpacity
                    style={styles.helpfulButton}
                    onPress={() => handleHelpful(review._id)}
                  >
                    <Ionicons name="thumbs-up-outline" size={16} color="#666" />
                    <Text style={styles.helpfulText}>
                      Hữu ích ({review.helpfulCount || 0})
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.replyButton}
                    onPress={() => handleReply(review._id)}
                  >
                    <Ionicons name="chatbubble-outline" size={16} color="#666" />
                    <Text style={styles.replyText}>Phản hồi</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Write Review Button */}
      <View style={styles.writeButtonContainer}>
        <TouchableOpacity
          style={styles.writeButton}
          onPress={() => navigation.navigate('WriteReview', { productId })}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.writeButtonText}>Viết đánh giá của bạn</Text>
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
  shareButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  ratingSummary: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  averageRating: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: '#666',
  },
  ratingDistribution: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 12,
    color: '#666',
    width: 40,
  },
  ratingBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  ratingBar: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 4,
  },
  ratingPercentage: {
    fontSize: 12,
    color: '#666',
    width: 35,
    textAlign: 'right',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginLeft: 8,
  },
  activeFilterButton: {
    backgroundColor: '#FF6B35',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  reviewsList: {
    padding: 16,
  },
  reviewCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 10,
    color: '#32CD32',
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: 12,
    color: '#999',
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewImages: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  moreImages: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  helpfulText: {
    fontSize: 12,
    color: '#666',
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  replyText: {
    fontSize: 12,
    color: '#666',
  },
  writeButtonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  writeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  writeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductReviewsScreen;
