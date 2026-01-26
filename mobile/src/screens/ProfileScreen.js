import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { authService } from '../services/authService';

const ProfileScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    avatar: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await authService.getCurrentUser();
      if (!user) {
        navigation.replace('Login');
      } else {
        setFormData({
          fullName: user.fullName,
          phone: user.phone,
          address: user.address,
          avatar: user.avatar
        });
      }
    };
    fetchUser();
  }, [navigation]);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const result = await authService.updateProfile(formData);

    if (result.success) {
      Alert.alert('Thành công', 'Cập nhật thông tin thành công');
      navigation.replace('Dashboard');
    } else {
      Alert.alert('Lỗi', result.message || 'Cập nhật thất bại');
    }

    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Chỉnh Sửa Hồ Sơ</Text>

        <TextInput
          style={styles.input}
          placeholder="Họ và Tên"
          value={formData.fullName}
          onChangeText={(value) => handleChange('fullName', value)}
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          placeholder="Số Điện Thoại"
          value={formData.phone}
          onChangeText={(value) => handleChange('phone', value)}
          keyboardType="phone-pad"
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          placeholder="Địa Chỉ"
          value={formData.address}
          onChangeText={(value) => handleChange('address', value)}
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          placeholder="Avatar URL"
          value={formData.avatar}
          onChangeText={(value) => handleChange('avatar', value)}
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Đang xử lý...' : 'Cập Nhật'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.backButtonText}>Quay Lại</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  formContainer: {
    padding: 20,
    marginTop: 50,
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
