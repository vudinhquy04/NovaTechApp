import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'address'
  
  // Form state for address
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    ward: '',
    district: '',
    city: '',
    isDefault: false
  });

  useEffect(() => {
    loadUserInfo();
    loadAddresses();
  }, []);

  const loadUserInfo = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const loadAddresses = async () => {
    try {
      const data = await AsyncStorage.getItem('addresses');
      const addressData = data ? JSON.parse(data) : [];
      setAddresses(addressData);
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const saveAddress = async () => {
    if (!formData.name || !formData.phone || !formData.address || !formData.city) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      let newAddresses = [...addresses];
      
      if (editingAddress) {
        const index = newAddresses.findIndex(addr => addr.id === editingAddress.id);
        newAddresses[index] = {
          ...formData,
          id: editingAddress.id,
          updatedAt: new Date().toISOString()
        };
      } else {
        const newAddress = {
          ...formData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        
        if (newAddresses.length === 0 || formData.isDefault) {
          newAddresses = newAddresses.map(addr => ({ ...addr, isDefault: false }));
          newAddress.isDefault = true;
        }
        
        newAddresses.push(newAddress);
      }

      await AsyncStorage.setItem('addresses', JSON.stringify(newAddresses));
      setAddresses(newAddresses);
      resetAddressForm();
      Alert.alert('Thành công', editingAddress ? 'Cập nhật địa chỉ thành công' : 'Thêm địa chỉ thành công');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu địa chỉ');
    }
  };

  const deleteAddress = (id) => {
    Alert.alert('Xác nhận', 'Bạn có muốn xóa địa chỉ này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            const newAddresses = addresses.filter(addr => addr.id !== id);
            await AsyncStorage.setItem('addresses', JSON.stringify(newAddresses));
            setAddresses(newAddresses);
            Alert.alert('Thành công', 'Xóa địa chỉ thành công');
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa địa chỉ');
          }
        }
      }
    ]);
  };

  const setDefaultAddress = async (id) => {
    try {
      const newAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === id
      }));
      await AsyncStorage.setItem('addresses', JSON.stringify(newAddresses));
      setAddresses(newAddresses);
      Alert.alert('Thành công', 'Đặt địa chỉ mặc định thành công');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật địa chỉ mặc định');
    }
  };

  const editAddress = (address) => {
    setEditingAddress(address);
    setFormData(address);
    setShowAddressForm(true);
  };

  const resetAddressForm = () => {
    setFormData({
      name: '',
      phone: '',
      address: '',
      ward: '',
      district: '',
      city: '',
      isDefault: false
    });
    setEditingAddress(null);
    setShowAddressForm(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  const menuItems = [
    { icon: 'receipt-outline', title: 'Đơn hàng của tôi', screen: 'OrderHistory' },
    { icon: 'heart-outline', title: 'Sản phẩm yêu thích', screen: 'Favorites' },
    { icon: 'help-circle-outline', title: 'Hỗ trợ', screen: 'Support' },
    { icon: 'lock-closed-outline', title: 'Đổi mật khẩu', screen: 'ChangePassword' },
    { icon: 'document-text-outline', title: 'Đánh giá sản phẩm', screen: 'ProductReviews' },
    { icon: 'settings-outline', title: 'Cài đặt', screen: 'Settings' }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tài khoản</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.activeTab]}
          onPress={() => setActiveTab('info')}
        >
          <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
            Thông tin cá nhân
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'address' && styles.activeTab]}
          onPress={() => setActiveTab('address')}
        >
          <Text style={[styles.tabText, activeTab === 'address' && styles.activeTabText]}>
            Địa chỉ giao hàng
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'info' ? (
          <>
            {/* User Info Card */}
            <View style={styles.userCard}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={48} color="#FF6B35" />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.fullName || 'Người dùng'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
              </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menuContainer}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => item.screen && navigation.navigate(item.screen)}
                  disabled={!item.screen}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIcon}>
                      <Ionicons name={item.icon} size={22} color="#FF6B35" />
                    </View>
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#CCC" />
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Address Management */}
            {!showAddressForm ? (
              <View style={styles.addressFormContainer}>
                <Text style={styles.formTitle}>
                  {editingAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
                </Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Họ và tên *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    placeholder="Nhập họ và tên"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Số điện thoại *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    placeholder="Nhập số điện thoại"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Địa chỉ cụ thể *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.address}
                    onChangeText={(text) => setFormData({ ...formData, address: text })}
                    placeholder="Số nhà, tên đường..."
                    multiline
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phường/Xã</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.ward}
                    onChangeText={(text) => setFormData({ ...formData, ward: text })}
                    placeholder="Nhập phường/xã"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Quận/Huyện</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.district}
                    onChangeText={(text) => setFormData({ ...formData, district: text })}
                    placeholder="Nhập quận/huyện"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Tỉnh/Thành phố *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.city}
                    onChangeText={(text) => setFormData({ ...formData, city: text })}
                    placeholder="Nhập tỉnh/thành phố"
                  />
                </View>

                <View style={styles.switchGroup}>
                  <Text style={styles.switchLabel}>Đặt làm địa chỉ mặc định</Text>
                  <Switch
                    value={formData.isDefault}
                    onValueChange={(value) => setFormData({ ...formData, isDefault: value })}
                    trackColor={{ false: '#767577', true: '#FF6B35' }}
                    thumbColor={formData.isDefault ? '#FFF' : '#F4F3F4'}
                  />
                </View>

                <View style={styles.formActions}>
                  <TouchableOpacity style={styles.cancelButton} onPress={resetAddressForm}>
                    <Text style={styles.cancelButtonText}>Hủy</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.saveButton} onPress={saveAddress}>
                    <Text style={styles.saveButtonText}>Lưu</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.addressListContainer}>
                <TouchableOpacity
                  style={styles.addAddressButton}
                  onPress={() => setShowAddressForm(true)}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#FF6B35" />
                  <Text style={styles.addAddressText}>Thêm địa chỉ mới</Text>
                </TouchableOpacity>
                
                {addresses.length === 0 ? (
                  <View style={styles.emptyAddressContainer}>
                    <Ionicons name="location-outline" size={64} color="#CCC" />
                    <Text style={styles.emptyText}>Chưa có địa chỉ nào</Text>
                    <Text style={styles.emptySubtext}>Thêm địa chỉ giao hàng của bạn</Text>
                  </View>
                ) : (
                  addresses.map(renderAddressItem)
                )}
              </View>
            )}
          </>
        )}

        {/* Logout Button */}
        {activeTab === 'info' && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#FF6B35" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

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
          <Ionicons name="notifications-outline" size={26} color="#666" />
          <Text style={styles.navText}>Thông báo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={26} color="#FF6B35" />
          <Text style={[styles.navText, styles.navTextActive]}>Tài khoản</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF'
  },
  placeholder: {
    width: 40
  },
  content: {
    flex: 1
  },
  userCard: {
    backgroundColor: '#FFF',
    margin: 16,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE8E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  userEmail: {
    fontSize: 14,
    color: '#666'
  },
  menuContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5'
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE8E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  menuItemText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500'
  },
  logoutButton: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  logoutText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: 'bold',
    marginLeft: 8
  },
  bottomSpace: {
    height: 100
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6
  },
  navText: {
    fontSize: 11,
    color: '#666',
    marginTop: 4
  },
  navTextActive: {
    color: '#FF6B35',
    fontWeight: 'bold'
  },
  /* Tab Navigation */
  tabContainer: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FF6B35',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  /* Address Management */
  addressFormContainer: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  addressListContainer: {
    margin: 16,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderStyle: 'dashed',
    borderRadius: 8,
    marginBottom: 16,
  },
  addAddressText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyAddressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  addressItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addressContent: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  defaultBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  addressDetail: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#FF6B35',
    marginLeft: 4,
  },
});
