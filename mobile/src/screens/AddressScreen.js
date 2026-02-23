import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddressScreen({ navigation, route }) {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    ward: '',
    district: '',
    city: '',
    isDefault: false
  });

  const { fromCheckout } = route.params || {};

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const data = await AsyncStorage.getItem('addresses');
      const addressData = data ? JSON.parse(data) : [];
      setAddresses(addressData);
      
      // Set selected address if coming from checkout
      if (fromCheckout) {
        const defaultAddr = addressData.find(addr => addr.isDefault) || addressData[0];
        if (defaultAddr) {
          setSelectedAddress(defaultAddr.id);
        }
      }
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
        // Update existing address
        const index = newAddresses.findIndex(addr => addr.id === editingAddress.id);
        newAddresses[index] = {
          ...formData,
          id: editingAddress.id,
          updatedAt: new Date().toISOString()
        };
      } else {
        // Add new address
        const newAddress = {
          ...formData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        
        // If this is the first address or marked as default, make it default
        if (newAddresses.length === 0 || formData.isDefault) {
          newAddresses = newAddresses.map(addr => ({ ...addr, isDefault: false }));
          newAddress.isDefault = true;
        }
        
        newAddresses.push(newAddress);
      }

      await AsyncStorage.setItem('addresses', JSON.stringify(newAddresses));
      setAddresses(newAddresses);
      resetForm();
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
    setShowForm(true);
  };

  const resetForm = () => {
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
    setShowForm(false);
  };

  const selectAddress = (address) => {
    if (fromCheckout) {
      setSelectedAddress(address.id);
      navigation.navigate('Checkout', { selectedAddress: address });
    }
  };

  const renderAddressItem = (address) => (
    <TouchableOpacity
      key={address.id}
      style={[
        styles.addressItem,
        selectedAddress === address.id && styles.selectedAddressItem
      ]}
      onPress={() => fromCheckout ? selectAddress(address) : null}
    >
      <View style={styles.addressContent}>
        <View style={styles.addressHeader}>
          <View style={styles.addressInfo}>
            <Text style={styles.addressName}>{address.name}</Text>
            <Text style={styles.addressPhone}>{address.phone}</Text>
          </View>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Mặc định</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.addressDetail}>
          {address.address}, {address.ward && `${address.ward}, `}{address.district}, {address.city}
        </Text>
        
        <View style={styles.addressActions}>
          {!fromCheckout && (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => editAddress(address)}
              >
                <Ionicons name="create-outline" size={18} color="#FF6B35" />
                <Text style={styles.actionText}>Sửa</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setDefaultAddress(address.id)}
              >
                <Ionicons name="star-outline" size={18} color="#FF6B35" />
                <Text style={styles.actionText}>Mặc định</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => deleteAddress(address.id)}
              >
                <Ionicons name="trash-outline" size={18} color="#FF4444" />
                <Text style={[styles.actionText, { color: '#FF4444' }]}>Xóa</Text>
              </TouchableOpacity>
            </>
          )}
          
          {fromCheckout && selectedAddress === address.id && (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {fromCheckout ? 'Chọn địa chỉ' : 'Địa chỉ giao hàng'}
          </Text>
          {!fromCheckout && (
            <TouchableOpacity onPress={() => setShowForm(true)}>
              <Ionicons name="add" size={24} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>

        {showForm ? (
          <ScrollView style={styles.formContainer}>
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
              <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.saveButton} onPress={saveAddress}>
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <ScrollView style={styles.listContainer}>
            {addresses.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="location-outline" size={64} color="#CCC" />
                <Text style={styles.emptyText}>Chưa có địa chỉ nào</Text>
                <Text style={styles.emptySubtext}>Thêm địa chỉ giao hàng của bạn</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowForm(true)}
                >
                  <Text style={styles.addButtonText}>Thêm địa chỉ mới</Text>
                </TouchableOpacity>
              </View>
            ) : (
              addresses.map(renderAddressItem)
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  formTitle: {
    fontSize: 20,
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
    marginBottom: 24,
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
  listContainer: {
    flex: 1,
    padding: 16,
  },
  addressItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedAddressItem: {
    borderColor: '#FF6B35',
    borderWidth: 2,
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
    lineHeight: 20,
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
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyContainer: {
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
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
