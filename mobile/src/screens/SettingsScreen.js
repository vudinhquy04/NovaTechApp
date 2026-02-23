import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen({ navigation }) {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoLogin, setAutoLogin] = useState(true);
  const [language, setLanguage] = useState('vi');
  const [theme, setTheme] = useState('light'); // 'light' or 'dark'

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('settings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setNotifications(parsedSettings.notifications ?? true);
        setDarkMode(parsedSettings.darkMode ?? false);
        setAutoLogin(parsedSettings.autoLogin ?? true);
        setLanguage(parsedSettings.language ?? 'vi');
        setTheme(parsedSettings.theme ?? 'light');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (key, value) => {
    try {
      const settings = await AsyncStorage.getItem('settings');
      const parsedSettings = settings ? JSON.parse(settings) : {};
      parsedSettings[key] = value;
      await AsyncStorage.setItem('settings', JSON.stringify(parsedSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleNotificationToggle = (value) => {
    setNotifications(value);
    saveSettings('notifications', value);
  };

  const handleDarkModeToggle = (value) => {
    setDarkMode(value);
    saveSettings('darkMode', value);
    Alert.alert('Chế độ tối', 'Tính năng đang phát triển');
  };

  const handleAutoLoginToggle = (value) => {
    setAutoLogin(value);
    saveSettings('autoLogin', value);
  };

  const handleLanguageChange = () => {
    Alert.alert(
      'Ngôn ngữ',
      'Chọn ngôn ngữ',
      [
        { text: 'Tiếng Việt', onPress: () => { setLanguage('vi'); saveSettings('language', 'vi'); } },
        { text: 'English', onPress: () => { setLanguage('en'); saveSettings('language', 'en'); } },
        { text: 'Hủy', style: 'cancel' }
      ]
    );
  };

  const handleThemeToggle = (value) => {
    setTheme(value);
    saveSettings('theme', value);
    Alert.alert('Giao diện', `Đã chuyển sang chế độ ${value === 'dark' ? 'tối' : 'sáng'}`);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Xóa cache',
      'Xóa tất cả dữ liệu cache?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('cache');
              Alert.alert('Thành công', 'Đã xóa cache');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa cache');
            }
          }
        }
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'Về NovaTech',
      'Phiên bản: 1.0.0\n\nNovaTech - Nền tảng mua sắm công nghệ hàng đầu Việt Nam',
      [{ text: 'OK' }]
    );
  };

  const handleContact = () => {
    Alert.alert(
      'Liên hệ',
      'Hotline: 1900 1234\nEmail: support@novatech.vn\nWebsite: www.novatech.vn',
      [
        { text: 'Gọi hotline', onPress: () => Linking.openURL('tel:19001234') },
        { text: 'Gửi email', onPress: () => Linking.openURL('mailto:support@novatech.vn') },
        { text: 'Hủy', style: 'cancel' }
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Chính sách bảo mật', 'Tính năng đang phát triển');
  };

  const handleTermsOfService = () => {
    Alert.alert('Điều khoản sử dụng', 'Tính năng đang phát triển');
  };

  const settingsSections = [
    {
      title: 'Cài đặt chung',
      items: [
        {
          icon: 'notifications-outline',
          title: 'Thông báo',
          subtitle: 'Nhận thông báo từ NovaTech',
          type: 'switch',
          value: notifications,
          onToggle: handleNotificationToggle,
        },
        {
          icon: 'sunny-outline',
          title: 'Chế độ sáng/tối',
          subtitle: theme === 'dark' ? 'Chế độ tối' : 'Chế độ sáng',
          type: 'action',
          onPress: () => handleThemeToggle(theme === 'dark' ? 'light' : 'dark'),
        },
        {
          icon: 'language-outline',
          title: 'Ngôn ngữ',
          subtitle: language === 'vi' ? 'Tiếng Việt' : 'English',
          type: 'action',
          onPress: handleLanguageChange,
        },
        {
          icon: 'log-in-outline',
          title: 'Đăng nhập tự động',
          subtitle: 'Tự động đăng nhập khi mở ứng dụng',
          type: 'switch',
          value: autoLogin,
          onToggle: handleAutoLoginToggle,
        },
      ],
    },
    {
      title: 'Dữ liệu và lưu trữ',
      items: [
        {
          icon: 'trash-outline',
          title: 'Xóa cache',
          subtitle: 'Giải phóng bộ nhớ ứng dụng',
          type: 'action',
          onPress: handleClearCache,
        },
      ],
    },
    {
      title: 'Hỗ trợ',
      items: [
        {
          icon: 'information-circle-outline',
          title: 'Về NovaTech',
          subtitle: 'Thông tin về ứng dụng',
          type: 'action',
          onPress: handleAbout,
        },
        {
          icon: 'call-outline',
          title: 'Liên hệ',
          subtitle: 'Liên hệ hỗ trợ khách hàng',
          type: 'action',
          onPress: handleContact,
        },
      ],
    },
    {
      title: 'Pháp lý',
      items: [
        {
          icon: 'shield-outline',
          title: 'Chính sách bảo mật',
          subtitle: 'Chính sách bảo mật dữ liệu',
          type: 'action',
          onPress: handlePrivacyPolicy,
        },
        {
          icon: 'document-text-outline',
          title: 'Điều khoản sử dụng',
          subtitle: 'Điều khoản và điều kiện',
          type: 'action',
          onPress: handleTermsOfService,
        },
      ],
    },
  ];

  const renderSettingItem = (item) => (
    <TouchableOpacity
      key={item.title}
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={item.type === 'switch'}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={item.icon} size={24} color="#FF6B35" />
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      {item.type === 'switch' ? (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: '#E0E0E0', true: '#FFB899' }}
          thumbColor={item.value ? '#FF6B35' : '#FFF'}
          ios_backgroundColor="#E0E0E0"
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#CCC" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cài đặt</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Settings List */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {settingsSections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionItems}>
                {section.items.map(renderSettingItem)}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionItems: {
    backgroundColor: '#FFF',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});
