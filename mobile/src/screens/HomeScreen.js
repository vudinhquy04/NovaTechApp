import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const featuredProducts = [
  {
    id: '1',
    name: 'Laptop ASUS Vivobook 16 i5',
    price: '15.000.000',
    oldPrice: '20.000.000',
    rating: '5/5',
    sold: 'Đã bán 1k+',
    image:
      'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: '2',
    name: 'Laptop Dell Inspiron 15 Business Edition',
    price: '15.000.000',
    oldPrice: '20.000.000',
    rating: '5/5',
    sold: 'Đã bán 1k+',
    image:
      'https://images.pexels.com/photos/196659/pexels-photo-196659.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: '3',
    name: 'Apple MacBook Air M2 13-inch Midnight',
    price: '15.000.000',
    oldPrice: '20.000.000',
    rating: '5/5',
    sold: 'Đã bán 1k+',
    image:
      'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: '4',
    name: 'Laptop Lenovo Yoga Slim 7i Pro',
    price: '15.000.000',
    oldPrice: '20.000.000',
    rating: '5/5',
    sold: 'Đã bán 1k+',
    image:
      'https://images.pexels.com/photos/18104/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600',
  },
];

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={20}
              color="#999"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Nhập từ khoá tìm kiếm"
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="menu" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>MUA CÁ LỚN</Text>
            <Text style={styles.bannerSubtitle}>
              Bằng cá bé - Siêu tiết kiệm!
            </Text>
            <TouchableOpacity style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>XEM NGAY</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured products title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SẢN PHẨM NỔI BẬT</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>Tất cả</Text>
          </TouchableOpacity>
        </View>

        {/* Products grid */}
        <View style={styles.productsGrid}>
          {featuredProducts.map(product => (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => navigation.navigate('OrderDetail')}
              activeOpacity={0.8}
            >
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-25%</Text>
              </View>
              <Image source={{ uri: product.image }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.productPrice}>{product.price} vnd</Text>
                <Text style={styles.productOldPrice}>{product.oldPrice} vnd</Text>
                <View style={styles.productMeta}>
                  <View style={styles.metaLeft}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.metaText}>{product.rating}</Text>
                  </View>
                  <Text style={styles.metaText}>{product.sold}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom navigation bar (static visual) */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomItemActive}>
          <Ionicons name="home" size={22} color="#FF6B35" />
          <Text style={styles.bottomItemActiveText}>Trang chủ</Text>
        </View>
        <View style={styles.bottomItem}>
          <Ionicons name="grid-outline" size={22} color="#999" />
          <Text style={styles.bottomItemText}>Danh mục</Text>
        </View>
        <View style={styles.bottomItem}>
          <Ionicons name="cart-outline" size={22} color="#999" />
          <Text style={styles.bottomItemText}>Giỏ hàng</Text>
        </View>
        <TouchableOpacity
          style={styles.bottomItem}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Ionicons name="person-outline" size={22} color="#999" />
          <Text style={styles.bottomItemText}>Tài khoản</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  scrollContent: {
    paddingBottom: 90,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 12,
    backgroundColor: '#FF7A00',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 50,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  menuButton: {
    marginLeft: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0F9EBE',
    height: 150,
    justifyContent: 'center',
  },
  bannerTextContainer: {
    paddingHorizontal: 20,
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 16,
  },
  bannerButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bannerButtonText: {
    color: '#FF7A00',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionHeader: {
    marginTop: 24,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  sectionLink: {
    fontSize: 14,
    color: '#FF7A00',
    fontWeight: '600',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 10,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF4D4F',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  discountText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
  },
  productInfo: {
    marginTop: 4,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF4D4F',
  },
  productOldPrice: {
    fontSize: 11,
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  bottomItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomItemText: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  bottomItemActive: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomItemActiveText: {
    fontSize: 11,
    color: '#FF6B35',
    marginTop: 2,
    fontWeight: '600',
  },
});

export default HomeScreen;

