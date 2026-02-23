import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import productService from '../services/productService';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

export default function CategoriesScreen({ navigation, route }) {
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || 'all');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('-createdAt');
  const [searchText, setSearchText] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const scrollViewRef = useRef(null);

  const sortOptions = [
    { label: 'Mới nhất', value: '-createdAt' },
    { label: 'Bán chạy', value: '-sold' },
    { label: 'Giá tăng dần', value: 'price' },
    { label: 'Giá giảm dần', value: '-price' }
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, sortBy]);

  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, animated: false });
      }
    }, [])
  );

  const loadCategories = async () => {
    try {
      const response = await productService.getCategories();
      
      // API cũ trả về data trực tiếp, không có wrapper success
      const categoriesData = response.data || response;
      
      if (categoriesData && Array.isArray(categoriesData)) {
        const allCategory = { name: 'Tất cả', slug: 'all', icon: 'apps-outline' };
        setCategories([allCategory, ...categoriesData]);
      } else {
        console.error('Categories error: Invalid data format');
        // Use fallback categories
        const fallbackCategories = [
          { name: 'Laptop', slug: 'laptop', icon: 'laptop-outline' },
          { name: 'Điện thoại', slug: 'phone', icon: 'phone-portrait-outline' },
          { name: 'Tablet', slug: 'tablet', icon: 'tablet-portrait-outline' },
          { name: 'Phụ kiện', slug: 'accessory', icon: 'headset-outline' },
          { name: 'Đồng hồ', slug: 'watch', icon: 'watch-outline' },
          { name: 'Âm thanh', slug: 'audio', icon: 'musical-notes-outline' },
          { name: 'Smart Home', slug: 'smart-home', icon: 'home-outline' },
          { name: 'Gaming', slug: 'gaming', icon: 'game-controller-outline' }
        ];
        const allCategory = { name: 'Tất cả', slug: 'all', icon: 'apps-outline' };
        setCategories([allCategory, ...fallbackCategories]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

const loadProducts = async () => {
    try {
      setLoading(true);

      const params = {
        sort: sortBy,
        limit: 50
      };

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (searchText.trim()) {
        params.search = searchText.trim();
      }

      const response = await productService.getProducts(params);

      // API cũ trả về data trực tiếp, không có wrapper success
      const productsData = response.data || response;
      
      if (productsData && Array.isArray(productsData)) {
        setProducts(productsData);
      } else {
        console.error('Products error: Invalid data format');
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      activeOpacity={0.7}
      onPress={() =>
        navigation.navigate("ProductDetail", {
          productId: item._id,
        })
      }
    >
      {item.discount > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{item.discount}%</Text>
        </View>
      )}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.productImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          {item.originalPrice > 0 && item.originalPrice !== item.price && (
            <Text style={styles.originalPrice}>{formatPrice(item.originalPrice)}</Text>
          )}
        </View>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#FFB800" />
          <Text style={styles.ratingText}>{item.rating?.toFixed(1) || '0.0'}</Text>
          <Text style={styles.soldText}>Đã bán {item.sold || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={loadProducts}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Sort Options - Filter chips */}
      <View style={styles.filterChipsContainer}>
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterChip,
              sortBy === option.value && styles.filterChipActive
            ]}
            onPress={() => setSortBy(option.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                sortBy === option.value && styles.filterChipTextActive
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category Dropdown - Bottom row, aligned to right */}
      <View style={styles.categoriesFilterContainer}>
        <TouchableOpacity 
          style={styles.categoryDropdown}
          onPress={() => setShowCategories(!showCategories)}
        >
          <View style={styles.categoryDropdownContent}>
            <Ionicons 
              name={categories.find(cat => cat.slug === selectedCategory)?.icon || 'cube-outline'} 
              size={18} 
              color="#FF6B35" 
            />
            <Text style={styles.categoryDropdownText}>
              {categories.find(cat => cat.slug === selectedCategory)?.name || 'Tất cả'}
            </Text>
            <Ionicons 
              name={showCategories ? "chevron-up" : "chevron-down"} 
              size={18} 
              color="#666" 
            />
          </View>
        </TouchableOpacity>
        
        {showCategories && (
          <View style={styles.categoryDropdownList}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.slug}
                style={[
                  styles.categoryDropdownItem,
                  selectedCategory === cat.slug && styles.categoryDropdownItemActive
                ]}
                onPress={() => {
                  setSelectedCategory(cat.slug);
                  setShowCategories(false);
                }}
              >
                <Ionicons
                  name={cat.icon || 'cube-outline'}
                  size={18}
                  color={selectedCategory === cat.slug ? '#FF6B35' : '#666'}
                />
                <Text
                  style={[
                    styles.categoryDropdownItemText,
                    selectedCategory === cat.slug && styles.categoryDropdownItemTextActive
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Products */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      ) : (
        <View style={styles.productsContainer}>
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item._id}
            numColumns={2}
            contentContainerStyle={styles.productsList}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Ionicons name="cube-outline" size={64} color="#CCC" />
                <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>
                <Text style={styles.emptySubtext}>Thử tìm kiếm với từ khóa khác</Text>
              </View>
            )}
          />
        </View>
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
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="grid" size={26} color="#FF6B35" />
          <Text style={[styles.navText, styles.navTextActive]}>Danh mục</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={26} color="#666" />
          <Text style={styles.navText}>Thông báo</Text>
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
    alignItems: 'center',
    marginRight: 8
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333'
  },
  categoriesScroll: {
    backgroundColor: '#FFF',
    marginBottom: 0
  },
  categoriesContainer: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    paddingBottom: 12
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    minWidth: 85,
    height: 38
  },
  categoryTabActive: {
    backgroundColor: '#FFE8E0'
  },
  categoryTabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500'
  },
  categoryTabTextActive: {
    color: '#FF6B35',
    fontWeight: 'bold'
  },
  filterChipsContainer: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexWrap: 'wrap'
  },
  filterChip: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 4
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
  categoryDropdown: {
    backgroundColor: '#FFF'
  },
  categoriesFilterContainer: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'flex-end',
    position: 'relative'
  },
  categoryDropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'space-between',
    minWidth: 140
  },
  categoryDropdownText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginLeft: 8
  },
  categoryDropdownList: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    maxHeight: 300,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000
  },
  categoryDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFF'
  },
  categoryDropdownItemActive: {
    backgroundColor: '#FFF5F2'
  },
  categoryDropdownItemText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8
  },
  categoryDropdownItemTextActive: {
    color: '#FF6B35',
    fontWeight: 'bold'
  },
  productsContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#666'
  },
  productsList: {
    padding: 12,
    paddingBottom: 100
  },
  row: {
    justifyContent: 'space-between'
  },
  productCard: {
    width: ITEM_WIDTH,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden'
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 0,
    backgroundColor: '#FF0000',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    zIndex: 2,
    elevation: 5
  },
  discountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold'
  },
  imageContainer: {
    width: '100%',
    height: ITEM_WIDTH,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center'
  },
  productImage: {
    width: '100%',
    height: '100%'
  },
  productInfo: {
    padding: 12
  },
  productName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    height: 40,
    lineHeight: 20
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  productPrice: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginRight: 8
  },
  originalPrice: {
    fontSize: 13,
    color: '#999',
    textDecorationLine: 'line-through'
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ratingText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
    marginRight: 8,
    fontWeight: '500'
  },
  soldText: {
    fontSize: 12,
    color: '#999'
  },
  emptyContainer: {
    alignItems: 'center',
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
  }
});
