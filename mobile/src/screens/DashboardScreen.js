import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DashboardScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    orders: 0,
    favorites: 0,
    vouchers: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        navigation.replace('Login');
      } else {
        setUser(currentUser);
        await loadStats();
      }
      setLoading(false);
    };
    fetchData();
  }, [navigation]);

  // Refresh stats when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadStats();
      }
    }, [user])
  );

  const loadStats = async () => {
    try {
      console.log('=== DASHBOARD STATS DEBUG ===');
      
      // Get orders count
      const orders = await orderService.getOrders();
      const ordersCount = orders.length;
      console.log('Orders count:', ordersCount);
      console.log('Orders data:', orders);

      // Get favorites count
      const favoritesData = await AsyncStorage.getItem('favorites');
      const favorites = favoritesData ? JSON.parse(favoritesData) : [];
      const favoritesCount = favorites.length;
      console.log('Favorites count:', favoritesCount);
      console.log('Favorites data:', favorites);

      // Get vouchers count (mock for now)
      const vouchersCount = 3; // Mock data
      console.log('Vouchers count:', vouchersCount);

      setStats({
        orders: ordersCount,
        favorites: favoritesCount,
        vouchers: vouchersCount
      });
      
      console.log('Final stats:', { orders: ordersCount, favorites: favoritesCount, vouchers: vouchersCount });
      console.log('==========================');
    } catch (error) {
      console.log('Error loading stats:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Đăng Xuất', 'Bạn chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', onPress: () => {} },
      {
        text: 'Đăng Xuất',
        onPress: async () => {
          await authService.logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>NovaTech</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Đăng Xuất</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsHeader}>
        <Text style={styles.statsTitle}>Thống kê của bạn</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadStats}
        >
          <Text style={styles.refreshButtonText}>↻</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('OrderHistory')}
        >
          <Text style={styles.statNumber}>{stats.orders}</Text>
          <Text style={styles.statLabel}>Đơn hàng</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Favorites')}
        >
          <Text style={styles.statNumber}>{stats.favorites}</Text>
          <Text style={styles.statLabel}>Yêu thích</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => Alert.alert('Voucher', 'Tính năng đang phát triển')}
        >
          <Text style={styles.statNumber}>{stats.vouchers}</Text>
          <Text style={styles.statLabel}>Voucher</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.userCard}>
        <Image
          source={{ uri: user?.avatar }}
          style={styles.avatar}
        />
        <Text style={styles.userName}>{user?.fullName}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>

        <View style={styles.userInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số Điện Thoại:</Text>
            <Text style={styles.infoValue}>{user?.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Địa Chỉ:</Text>
            <Text style={styles.infoValue}>{user?.address || 'Chưa cập nhật'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vai Trò:</Text>
            <Text style={styles.infoValue}>
              {user?.role === 'admin' ? 'Quản Trị' : 'Người Dùng'}
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.actionButtonText}>Chỉnh Sửa Hồ Sơ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Text style={styles.actionButtonText}>Đổi Mật Khẩu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#667eea',
  },
  logoutButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  userCard: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#667eea',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  userInfo: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  infoValue: {
    color: '#666',
  },
  actionButtons: {
    width: '100%',
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DashboardScreen;
