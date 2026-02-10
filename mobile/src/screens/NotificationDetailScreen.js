import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationDetailScreen({ navigation, route }) {
  const { notification } = route.params;
  const [isLiked, setIsLiked] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${notification.title}\n\n${notification.message}`,
        title: notification.title
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'promotion': return 'pricetag-outline';
      case 'product': return 'cube-outline';
      case 'order': return 'cart-outline';
      case 'system': return 'settings-outline';
      default: return 'notifications-outline';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'promotion': return '#FF6B35';
      case 'product': return '#4CAF50';
      case 'order': return '#2196F3';
      case 'system': return '#9C27B0';
      default: return '#666';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'promotion': return 'Khuyến mãi';
      case 'product': return 'Sản phẩm';
      case 'order': return 'Đơn hàng';
      case 'system': return 'Hệ thống';
      default: return 'Thông báo';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAction = () => {
    switch (notification.type) {
      case 'promotion':
        navigation.navigate('Categories');
        break;
      case 'product':
        // Navigate to product if product ID is available
        Alert.alert('Sản phẩm', 'Xem chi tiết sản phẩm');
        break;
      case 'order':
        navigation.navigate('OrderHistory');
        break;
      case 'system':
        Alert.alert('Hệ thống', 'Cài đặt đã được cập nhật');
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết thông báo</Text>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notification Header */}
        <View style={styles.notificationHeader}>
          <View style={styles.typeContainer}>
            <View style={[styles.typeIcon, { backgroundColor: getTypeColor(notification.type) }]}>
              <Ionicons name={getTypeIcon(notification.type)} size={24} color="#FFF" />
            </View>
            <View style={styles.typeInfo}>
              <Text style={styles.typeLabel}>{getTypeLabel(notification.type)}</Text>
              <Text style={styles.notificationDate}>{formatDate(notification.date)}</Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={20} 
                color={isLiked ? "#FF6B35" : "#666"} 
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Xóa', 'Bạn có muốn xóa thông báo này?', [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Xóa', style: 'destructive', onPress: () => navigation.goBack() }
            ])}>
              <Ionicons name="trash-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{notification.title}</Text>

        {/* Image */}
        {notification.image && (
          <Image source={{ uri: notification.image }} style={styles.notificationImage} />
        )}

        {/* Message */}
        <Text style={styles.message}>{notification.message}</Text>

        {/* Additional Content */}
        <View style={styles.additionalContent}>
          {notification.type === 'promotion' && (
            <View style={styles.promotionCard}>
              <Ionicons name="gift-outline" size={24} color="#FF6B35" />
              <View style={styles.promotionInfo}>
                <Text style={styles.promotionTitle}>Ưu đãi đặc biệt</Text>
                <Text style={styles.promotionDescription}>Sử dụng mã: NOVATECH50</Text>
                <Text style={styles.promotionExpiry}>Hết hạn: 31/12/2024</Text>
              </View>
            </View>
          )}

          {notification.type === 'product' && (
            <View style={styles.productCard}>
              <Ionicons name="cube-outline" size={24} color="#4CAF50" />
              <View style={styles.productInfo}>
                <Text style={styles.productTitle}>Sản phẩm nổi bật</Text>
                <Text style={styles.productDescription}>Khám phá ngay các sản phẩm mới nhất</Text>
              </View>
            </View>
          )}

          {notification.type === 'order' && (
            <View style={styles.orderCard}>
              <Ionicons name="cart-outline" size={24} color="#2196F3" />
              <View style={styles.orderInfo}>
                <Text style={styles.orderTitle}>Theo dõi đơn hàng</Text>
                <Text style={styles.orderDescription}>Xem trạng thái đơn hàng của bạn</Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.actionButtonLarge} onPress={handleAction}>
          <Text style={styles.actionButtonText}>
            {notification.type === 'promotion' && 'Xem khuyến mãi'}
            {notification.type === 'product' && 'Xem sản phẩm'}
            {notification.type === 'order' && 'Xem đơn hàng'}
            {notification.type === 'system' && 'Cài đặt'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>

        {/* Related Info */}
        <View style={styles.relatedInfo}>
          <Text style={styles.relatedTitle}>Thông tin liên quan</Text>
          <TouchableOpacity style={styles.relatedItem}>
            <Ionicons name="help-circle-outline" size={20} color="#666" />
            <Text style={styles.relatedText}>Trung tâm hỗ trợ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.relatedItem}>
            <Ionicons name="document-text-outline" size={20} color="#666" />
            <Text style={styles.relatedText}>Điều khoản sử dụng</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.relatedItem}>
            <Ionicons name="shield-outline" size={20} color="#666" />
            <Text style={styles.relatedText}>Chính sách bảo mật</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  header: {
    backgroundColor: '#FF6B35',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF'
  },
  content: {
    flex: 1
  },
  notificationHeader: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  typeInfo: {
    flex: 1
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  notificationDate: {
    fontSize: 12,
    color: '#999'
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionButton: {
    padding: 8,
    marginLeft: 8
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    padding: 16,
    backgroundColor: '#FFF',
    lineHeight: 32
  },
  notificationImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover'
  },
  message: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    padding: 16,
    backgroundColor: '#FFF',
    marginTop: 1
  },
  additionalContent: {
    padding: 16
  },
  promotionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B35',
    marginBottom: 12
  },
  promotionInfo: {
    marginLeft: 12,
    flex: 1
  },
  promotionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  promotionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2
  },
  promotionExpiry: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '500'
  },
  productCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
    marginBottom: 12
  },
  productInfo: {
    marginLeft: 12,
    flex: 1
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  productDescription: {
    fontSize: 14,
    color: '#666'
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2196F3',
    marginBottom: 12
  },
  orderInfo: {
    marginLeft: 12,
    flex: 1
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  orderDescription: {
    fontSize: 14,
    color: '#666'
  },
  actionButtonLarge: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginRight: 8
  },
  relatedInfo: {
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 12,
    padding: 16
  },
  relatedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  relatedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8
  },
  relatedText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12
  }
});
