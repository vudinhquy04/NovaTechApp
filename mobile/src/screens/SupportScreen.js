import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function SupportScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('general');

  const supportCategories = [
    {
      id: 'general',
      title: 'Hỗ trợ chung',
      icon: 'help-circle-outline',
      color: '#FF6B35'
    },
    {
      id: 'account',
      title: 'Tài khoản',
      icon: 'person-outline',
      color: '#2196F3'
    },
    {
      id: 'payment',
      title: 'Thanh toán',
      icon: 'card-outline',
      color: '#4CAF50'
    },
    {
      id: 'shipping',
      title: 'Giao hàng',
      icon: 'location-outline',
      color: '#FF9800'
    },
    {
      id: 'product',
      title: 'Sản phẩm',
      icon: 'cube-outline',
      color: '#9C27B0'
    },
    {
      id: 'technical',
      title: 'Kỹ thuật',
      icon: 'settings-outline',
      color: '#795548'
    }
  ];

  const supportItems = {
    general: [
      {
        id: 'guide',
        title: 'Hướng dẫn sử dụng',
        description: 'Tìm hiểu cách sử dụng các tính năng của ứng dụng NovaTech',
        icon: 'book-outline',
        color: '#FF6B35',
        action: () => Alert.alert('Hướng dẫn sử dụng', 'Xem video hướng dẫn và tài liệu sử dụng sản phẩm NovaTech tại website của chúng tôi.')
      },
      {
        id: 'faq',
        title: 'Câu hỏi thường gặp',
        description: 'Tìm câu trả lời cho các câu hỏi phổ biến',
        icon: 'help-circle-outline',
        color: '#FF6B35',
        action: () => Alert.alert('FAQ', 'Q: Làm thế nào để đặt hàng?\n\nA: Bạn có thể đặt hàng trực tiếp qua ứng dụng hoặc website NovaTech.')
      },
      {
        id: 'contact',
        title: 'Liên hệ hỗ trợ',
        description: 'Hotline: 1900 1234\nEmail: support@novatech.vn',
        icon: 'call-outline',
        color: '#FF6B35',
        action: () => Alert.alert('Liên hệ', 'Hotline: 1900 1234\nEmail: support@novatech.vn\nGiờ làm việc: 8:00 - 22:00')
      },
      {
        id: 'privacy',
        title: 'Chính sách bảo mật',
        description: 'Tìm hiểu chính sách bảo mật của NovaTech',
        icon: 'shield-outline',
        color: '#FF6B35',
        action: () => Alert.alert('Bảo mật', 'NovaTech cam kết bảo mật thông tin cá nhân của khách hàng theo quy định pháp luật.')
      },
      {
        id: 'terms',
        title: 'Điều khoản sử dụng',
        description: 'Tìm hiểu điều khoản và quyền lợi người dùng',
        icon: 'document-text-outline',
        color: '#FF6B35',
        action: () => Alert.alert('Điều khoản', 'Vui lòng đọc kỹ điều khoản sử dụng trước khi mua hàng.')
      }
    ],
    account: [
      {
        id: 'profile',
        title: 'Thông tin tài khoản',
        description: 'Cập nhật thông tin cá nhân của bạn',
        icon: 'person-outline',
        color: '#2196F3',
        action: () => navigation.navigate('Profile')
      },
      {
        id: 'password',
        title: 'Đổi mật khẩu',
        description: 'Thay đổi mật khẩu đăng nhập',
        icon: 'lock-closed-outline',
        color: '#2196F3',
        action: () => navigation.navigate('ChangePassword')
      },
      {
        id: 'history',
        title: 'Lịch sử hoạt động',
        description: 'Xem lịch sử các hoạt động gần đây',
        icon: 'time-outline',
        color: '#2196F3',
        action: () => Alert.alert('Lịch sử', 'Bạn chưa có hoạt động nào gần đây.')
      },
      {
        id: 'delete',
        title: 'Xóa tài khoản',
        description: 'Hướng dẫn xóa tài khoản vĩnh viễn',
        icon: 'trash-outline',
        color: '#2196F3',
        action: () => Alert.alert('Xóa tài khoản', 'Để xóa tài khoản, vui lòng liên hệ hỗ trợ qua email support@novatech.vn')
      }
    ],
    payment: [
      {
        id: 'methods',
        title: 'Phương thức thanh toán',
        description: 'Các phương thức thanh toán được hỗ trợ',
        icon: 'card-outline',
        color: '#4CAF50',
        action: () => Alert.alert('Thanh toán', 'NovaTech hỗ trợ:\n• Tiền mặt khi nhận hàng\n• Thẻ tín dụng/ghi nợ\n• Ví điện tử (MoMo, ZaloPay)\n• Chuyển khoản ngân hàng')
      },
      {
        id: 'history',
        title: 'Lịch sử thanh toán',
        description: 'Xem lịch sử các giao dịch thanh toán',
        icon: 'receipt-outline',
        color: '#4CAF50',
        action: () => navigation.navigate('OrderHistory')
      },
      {
        id: 'refund',
        title: 'Chính sách hoàn tiền',
        description: 'Điều kiện và quy trình hoàn tiền',
        icon: 'refresh-outline',
        color: '#4CAF50',
        action: () => Alert.alert('Hoàn tiền', 'Hoàn tiền trong vòng 7 ngày nếu sản phẩm lỗi từ nhà sản xuất.')
      },
      {
        id: 'dispute',
        title: 'Khiếu nại giao dịch',
        description: 'Khiếu nại các vấn đề về thanh toán',
        icon: 'warning-outline',
        color: '#4CAF50',
        action: () => Alert.alert('Khiếu nại', 'Vui lòng liên hệ hỗ trợ qua hotline 1900 1234 để khiếu nại giao dịch.')
      }
    ],
    shipping: [
      {
        id: 'tracking',
        title: 'Theo dõi đơn hàng',
        description: 'Kiểm tra trạng thái đơn hàng của bạn',
        icon: 'locate-outline',
        color: '#9C27B0',
        action: () => navigation.navigate('OrderHistory')
      },
      {
        id: 'address',
        title: 'Quản lý địa chỉ',
        description: 'Thêm và quản lý địa chỉ giao hàng',
        icon: 'location-outline',
        color: '#9C27B0',
        action: () => navigation.navigate('Address')
      },
      {
        id: 'fees',
        title: 'Phí vận chuyển',
        description: 'Bảng giá và chính sách phí vận chuyển',
        icon: 'pricetag-outline',
        color: '#9C27B0',
        action: () => Alert.alert('Phí vận chuyển', 'Miễn phí vận chuyển cho đơn hàng từ 500.000đ\nPhí vận chuyển: 30.000đ cho đơn hàng dưới 500.000đ')
      },
      {
        id: 'time',
        title: 'Thời gian giao hàng',
        description: 'Thời gian dự kiến cho các khu vực',
        icon: 'time-outline',
        color: '#9C27B0',
        action: () => Alert.alert('Thời gian giao hàng', 'Hà Nội: 1-2 ngày\nCác tỉnh khác: 3-5 ngày\nĐảo và vùng xa: 5-7 ngày')
      },
      {
        id: 'return',
        title: 'Đổi trả hàng',
        description: 'Chính sách đổi trả và hoàn tiền',
        icon: 'refresh-outline',
        color: '#9C27B0',
        action: () => Alert.alert('Đổi trả', 'Đổi trả trong vòng 30 ngày nếu sản phẩm còn nguyên tem và hộp.')
      },
      {
        id: 'insurance',
        title: 'Bảo hiểm vận chuyển',
        description: 'Bảo hiểm cho các đơn hàng giá trị cao',
        icon: 'shield-checkmark-outline',
        color: '#9C27B0',
        action: () => Alert.alert('Bảo hiểm', 'Tất cả đơn hàng đều được bảo hiểm 100% giá trị sản phẩm.')
      }
    ],
    product: [
      {
        id: 'guide',
        title: 'Hướng dẫn mua hàng',
        description: 'Các bước mua sản phẩm trên NovaTech',
        icon: 'book-outline',
        color: '#FF9800',
        action: () => Alert.alert('Hướng dẫn mua hàng', '1. Chọn sản phẩm\n2. Thêm vào giỏ hàng\n3. Kiểm tra thông tin\n4. Chọn phương thức thanh toán\n5. Xác nhận đơn hàng')
      },
      {
        id: 'reviews',
        title: 'Đánh giá sản phẩm',
        description: 'Hướng dẫn viết và đọc đánh giá',
        icon: 'star-outline',
        color: '#FF9800',
        action: () => navigation.navigate('ProductReviews')
      },
      {
        id: 'warranty',
        title: 'Bảo hành sản phẩm',
        description: 'Chính sách bảo hành và bảo trì',
        icon: 'shield-outline',
        color: '#FF9800',
        action: () => Alert.alert('Bảo hành', 'Bảo hành 12 tháng tại nhà cho các sản phẩm điện tử.\nBảo hành 24 tháng cho các sản phẩm gia dụng.')
      },
      {
        id: 'compare',
        title: 'So sánh sản phẩm',
        description: 'Công cụ so sánh các sản phẩm',
        icon: 'git-compare-outline',
        color: '#FF9800',
        action: () => Alert.alert('So sánh', 'Tính năng so sánh sản phẩm sẽ sớm được cập nhật.')
      },
      {
        id: 'report',
        title: 'Báo cáo sản phẩm',
        description: 'Báo cáo vấn đề về sản phẩm',
        icon: 'flag-outline',
        color: '#FF9800',
        action: () => Alert.alert('Báo cáo', 'Nếu phát hiện sản phẩm giả hoặc lỗi, vui lòng báo cáo ngay cho chúng tôi.')
      }
    ],
    technical: [
      {
        id: 'feature',
        title: 'Yêu cầu tính năng',
        description: 'Gửi yêu cầu về tính năng mới',
        icon: 'bulb-outline',
        color: '#607D8B',
        action: () => Alert.alert('Yêu cầu tính năng', 'Gửi ý tưởng của bạn về email: ideas@novatech.vn\nChúng tôi luôn lắng nghe và cải thiện mỗi ngày!')
      },
      {
        id: 'bug',
        title: 'Báo cáo lỗi',
        description: 'Báo cáo lỗi kỹ thuật và giao diện',
        icon: 'bug-outline',
        color: '#607D8B',
        action: () => Alert.alert('Báo cáo lỗi', 'Nếu gặp lỗi, vui lòng chụp màn hình và gửi qua email: bug@novatech.vn')
      },
      {
        id: 'update',
        title: 'Cập nhật ứng dụng',
        description: 'Hướng dẫn cập nhật phiên bản mới',
        icon: 'download-outline',
        color: '#607D8B',
        action: () => Alert.alert('Cập nhật', 'Luôn cập nhật ứng dụng tại App Store hoặc Google Play để có trải nghiệm tốt nhất!')
      },
      {
        id: 'help',
        title: 'Trợ giúp kỹ thuật',
        description: 'Hướng dẫn và tài liệu cho nhà phát triển',
        icon: 'code-outline',
        color: '#607D8B',
        action: () => Alert.alert('Trợ giúp', 'Tài liệu API và hướng dẫn tích hợp tại: developer.novatech.vn')
      }
    ]
  };

  const renderSupportItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.supportItem}
      onPress={item.action}
    >
      <View style={styles.supportContent}>
        <View style={[styles.supportIcon, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={24} color="#FFF" />
        </View>
        <View style={styles.supportInfo}>
          <Text style={styles.supportTitle}>{item.title}</Text>
          <Text style={styles.supportDescription}>{item.description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = (category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryItem,
        activeCategory === category.id && styles.activeCategoryItem
      ]}
      onPress={() => setActiveCategory(category.id)}
    >
      <View style={styles.categoryContent}>
        <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
          <Ionicons name={category.icon} size={20} color="#FFF" />
        </View>
        <Text style={styles.categoryTitle}>{category.title}</Text>
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
          <Text style={styles.headerTitle}>Hỗ trợ</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesScroll}
        >
          {supportCategories.map(renderCategoryItem)}
        </ScrollView>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {supportItems[activeCategory].map(renderSupportItem)}
        </ScrollView>
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
  placeholder: {
    width: 24,
  },
  categoriesContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoriesScroll: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    minWidth: 70,
    borderRadius: 20,
  },
  activeCategoryItem: {
    backgroundColor: '#FF6B35',
  },
  categoryContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  content: {
    flex: 1,
    padding: 8,
  },
  supportItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 6,
  },
  supportContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  supportInfo: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 1,
  },
  supportDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 14,
  },
});
