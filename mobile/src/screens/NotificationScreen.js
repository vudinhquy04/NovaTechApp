import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import notificationService from '../services/notificationService';

const { width } = Dimensions.get('window');

export default function NotificationScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filterOptions = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Khuyến mãi', value: 'khuyenmai' },
    { label: 'Sản phẩm', value: 'sanpham' },
    { label: 'Đơn hàng', value: 'donhang' },
    { label: 'Hệ thống', value: 'heThong' }
  ];

  useEffect(() => {
    loadNotifications();
  }, [selectedFilter, searchText]);

  useFocusEffect(
    React.useCallback(() => {
      // Mark notifications as read when screen is focused
      markAsRead();
    }, [])
  );

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      const params = {};
      
      if (selectedFilter !== 'all') {
        params.category = selectedFilter;
      }
      
      if (searchText.trim()) {
        params.search = searchText.trim();
      }

      const response = await notificationService.getNotifications(params);
      
      if (response.success) {
        setNotifications(response.data);
      } else {
        // Fallback to empty array if API fails
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(item => ({ ...item, read: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const markAsUnread = async (id) => {
    try {
      await notificationService.markAsUnread(id);
      setNotifications(prev =>
        prev.map(item => 
          (item._id === id || item.id === id) ? { ...item, read: false } : item
        )
      );
    } catch (error) {
      console.error('Error marking as unread:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(item => (item._id !== id && item.id !== id)));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
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

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadItem]}
      onPress={() => navigation.navigate('NotificationDetail', { notification: item })}
      onLongPress={() => markAsUnread(item._id || item.id)}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.notificationLeft}>
          <View style={[styles.typeIcon, { backgroundColor: getTypeColor(item.type) }]}>
            <Ionicons name={getTypeIcon(item.type)} size={20} color="#FFF" />
          </View>
          <View style={styles.notificationContent}>
            <Text style={[styles.notificationTitle, !item.read && styles.unreadTitle]}>
              {item.title}
            </Text>
            <Text style={styles.notificationDate}>{formatDate(item.createdAt || item.date)}</Text>
          </View>
        </View>
        <View style={styles.notificationRight}>
          {!item.read && <View style={styles.unreadDot} />}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteNotification(item._id || item.id)}
          >
            <Ionicons name="close" size={16} color="#999" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.notificationMessage} numberOfLines={2}>
        {item.message}
      </Text>
      
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.notificationImage} />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Đang tải thông báo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm thông báo..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Filter */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterChip,
                selectedFilter === option.value && styles.filterChipActive
              ]}
              onPress={() => setSelectedFilter(option.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === option.value && styles.filterChipTextActive
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item._id?.toString() || item.id?.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>Không có thông báo nào</Text>
            <Text style={styles.emptySubtext}>Bạn sẽ nhận được thông báo khi có cập nhật</Text>
          </View>
        )}
      />
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
  searchContainer: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  searchIcon: {
    marginRight: 12
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333'
  },
  filterContainer: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 8
  },
  filterScroll: {
    paddingHorizontal: 16
  },
  filterChip: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8
  },
  filterChipActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35'
  },
  filterChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500'
  },
  filterChipTextActive: {
    color: '#FFF',
    fontWeight: 'bold'
  },
  listContainer: {
    padding: 16
  },
  notificationItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  unreadItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35'
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  notificationContent: {
    flex: 1
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  unreadTitle: {
    fontWeight: 'bold'
  },
  notificationDate: {
    fontSize: 12,
    color: '#999'
  },
  notificationRight: {
    alignItems: 'center',
    marginLeft: 8
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B35',
    marginBottom: 8
  },
  deleteButton: {
    padding: 4
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8
  },
  notificationImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#666'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500'
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999'
  }
});
