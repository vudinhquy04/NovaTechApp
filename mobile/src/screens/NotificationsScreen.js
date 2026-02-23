import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await AsyncStorage.getItem('notifications');
      if (data) {
        const notifs = JSON.parse(data);
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.read).length);
      } else {
        // Tạo thông báo mẫu từ đơn hàng thực tế nếu có
        const ordersData = await AsyncStorage.getItem('orders');
        const sampleNotifications = [];
        
        if (ordersData) {
          const orders = JSON.parse(ordersData);
          // Tạo thông báo cho 3 đơn hàng gần nhất
          orders.slice(0, 3).forEach((order, index) => {
            // Tạo title và message dựa vào trạng thái đơn hàng
            let title = 'Đơn hàng đã được đặt thành công';
            let message = `Đơn hàng ${order.orderNumber} của bạn đã được tiếp nhận và đang chờ xác nhận.`;
            let icon = 'checkmark-circle';
            let iconColor = '#4CAF50';
            
            if (order.status === 'processing') {
              title = 'Đơn hàng đã được xác nhận';
              message = `Đơn hàng ${order.orderNumber} của bạn đã được xác nhận và đang được chuẩn bị.`;
            } else if (order.status === 'shipping') {
              title = 'Đơn hàng đang được giao';
              message = `Đơn hàng ${order.orderNumber} đang trên đường giao đến bạn.`;
              icon = 'car';
              iconColor = '#2196F3';
            } else if (order.status === 'delivered') {
              title = 'Đơn hàng đã giao thành công';
              message = `Đơn hàng ${order.orderNumber} đã được giao thành công. Cảm ơn bạn đã mua hàng!`;
              icon = 'checkmark-done-circle';
              iconColor = '#4CAF50';
            } else if (order.status === 'cancelled') {
              title = 'Đơn hàng đã bị hủy';
              message = `Đơn hàng ${order.orderNumber} đã bị hủy.`;
              icon = 'close-circle';
              iconColor = '#F44336';
            }
            
            sampleNotifications.push({
              id: `order-${order._id || order.orderId}`,
              type: 'order',
              title,
              message,
              time: order.createdAt,
              read: index === 0 ? false : true,
              icon,
              iconColor,
              orderId: order._id || order.orderId,
              orderNumber: order.orderNumber
            });
          });
        }
        
        // Thêm thông báo khuyến mãi và chào mừng
        sampleNotifications.push(
          {
            id: 'promo-1',
            type: 'promotion',
            title: 'Khuyến mãi đặc biệt',
            message: 'Giảm ngay 20% cho tất cả sản phẩm Laptop. Áp dụng đến hết ngày hôm nay!',
            time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            read: false,
            icon: 'gift',
            iconColor: '#FF6B35'
          },
          {
            id: 'system-1',
            type: 'system',
            title: 'Chào mừng đến NovaTech',
            message: 'Cảm ơn bạn đã sử dụng ứng dụng của chúng tôi. Chúc bạn có trải nghiệm mua sắm tuyệt vời!',
            time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            read: true,
            icon: 'heart',
            iconColor: '#E91E63'
          }
        );
        
        setNotifications(sampleNotifications);
        setUnreadCount(sampleNotifications.filter(n => !n.read).length);
        await AsyncStorage.setItem('notifications', JSON.stringify(sampleNotifications));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const markAsRead = async (id) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
    await AsyncStorage.setItem('notifications', JSON.stringify(updated));
  };

  const markAllAsRead = async () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    setUnreadCount(0);
    await AsyncStorage.setItem('notifications', JSON.stringify(updated));
  };

  const deleteNotification = async (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
    await AsyncStorage.setItem('notifications', JSON.stringify(updated));
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const time = new Date(dateString);
    const diff = Math.floor((now - time) / 1000); // seconds

    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return time.toLocaleDateString('vi-VN');
  };

  const handleNotificationPress = async (notification) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.type === 'order') {
      // Load order details and navigate
      try {
        const ordersData = await AsyncStorage.getItem('orders');
        if (ordersData) {
          const orders = JSON.parse(ordersData);
          const order = orders.find(o => 
            o._id === notification.orderId || 
            o.orderNumber === notification.orderNumber
          );
          
          if (order) {
            navigation.navigate('OrderDetail', { order });
          } else {
            Alert.alert('Thông báo', 'Không tìm thấy thông tin đơn hàng');
          }
        }
      } catch (error) {
        console.error('Error loading order:', error);
        Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
      }
    } else if (notification.type === 'promotion') {
      navigation.navigate('Categories');
    } else if (notification.type === 'system') {
      // System notifications don't navigate anywhere
    }
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadItem]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.iconColor + '20' }]}>
        <Ionicons name={item.icon} size={24} color={item.iconColor} />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          {!item.read && <View style={styles.unreadBadge} />}
        </View>
        
        <Text style={styles.message} numberOfLines={2}>
          {item.message}
        </Text>
        
        <Text style={styles.time}>{formatTimeAgo(item.time)}</Text>
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteNotification(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#999" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Thông báo</Text>
            {unreadCount > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={markAllAsRead}
            >
              <Ionicons name="checkmark-done" size={24} color="#FF6B35" />
            </TouchableOpacity>
          )}
        </View>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={80} color="#CCC" />
            <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
            <Text style={styles.emptySubText}>
              Các thông báo về đơn hàng và khuyến mãi sẽ hiển thị ở đây
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#FF6B35']}
              />
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="home-outline" size={26} color="#666" />
            <Text style={styles.navText}>Trang chủ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('Categories')}
          >
            <Ionicons name="grid-outline" size={26} color="#666" />
            <Text style={styles.navText}>Danh mục</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="notifications" size={26} color="#FF6B35" />
            <Text style={[styles.navText, styles.navTextActive]}>Thông báo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-outline" size={26} color="#666" />
            <Text style={styles.navText}>Tài khoản</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerBadge: {
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  headerBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  markAllButton: {
    padding: 4,
  },
  listContent: {
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  unreadItem: {
    backgroundColor: '#FFF8F5',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B35',
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#CCC',
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  navTextActive: {
    color: '#FF6B35',
    fontWeight: '600',
  },
});

export default NotificationsScreen;
