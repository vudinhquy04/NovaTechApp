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
  TextInput,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import productService from '../services/productService';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

export default function CategoriesScreen({ navigation, route }) {
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || 'all');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('-createdAt');
  const [searchText, setSearchText] = useState(route.params?.search || '');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [priceRange, setPriceRange] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const scrollViewRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const sortOptions = [
    { label: 'Mới nhất', value: '-createdAt' },
    { label: 'Bán chạy', value: '-sold' },
    { label: 'Giá tăng dần', value: 'price' },
    { label: 'Giá giảm dần', value: '-price' }
  ];

  const priceRanges = [
    { label: 'Tất cả', value: 'all', min: 0, max: Infinity },
    { label: 'Dưới 5 triệu', value: 'under5', min: 0, max: 5000000 },
    { label: '5 - 10 triệu', value: '5to10', min: 5000000, max: 10000000 },
    { label: '10 - 20 triệu', value: '10to20', min: 10000000, max: 20000000 },
    { label: '20 - 30 triệu', value: '20to30', min: 20000000, max: 30000000 },
    { label: 'Trên 30 triệu', value: 'over30', min: 30000000, max: Infinity }
  ];

  const ratingOptions = [
    { label: 'Tất cả', value: 0 },
    { label: '5 sao', value: 5 },
    { label: '4 sao trở lên', value: 4 },
    { label: '3 sao trở lên', value: 3 }
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  // Update search from route params
  useEffect(() => {
    if (route.params?.search) {
      setSearchText(route.params.search);
    }
    if (route.params?.category) {
      setSelectedCategory(route.params.category);
    }
  }, [route.params]);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, sortBy, priceRange, minRating]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUnreadCount();
    });
    return unsubscribe;
  }, [navigation]);

  const loadUnreadCount = async () => {
    try {
      const data = await AsyncStorage.getItem('notifications');
      if (data) {
        const notifications = JSON.parse(data);
        const unread = notifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  // Auto search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      loadProducts();
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchText]);

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
      if (response.success) {
        const allCategory = { name: 'Tất cả', slug: 'all', icon: 'apps-outline' };
        setCategories([allCategory, ...response.data]);
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

      if (response.success) {
        let filteredProducts = response.data;

        // Filter by price range
        if (priceRange !== 'all') {
          const range = priceRanges.find(r => r.value === priceRange);
          if (range) {
            filteredProducts = filteredProducts.filter(p => 
              p.price >= range.min && p.price < range.max
            );
          }
        }

        // Filter by rating
        if (minRating > 0) {
          filteredProducts = filteredProducts.filter(p => 
            (p.rating || 0) >= minRating
          );
        }

        setProducts(filteredProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setFilterModalVisible(false);
    loadProducts();
  };

  const resetFilters = () => {
    setSortBy('-createdAt');
    setPriceRange('all');
    setMinRating(0);
    setSelectedCategory('all');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (sortBy !== '-createdAt') count++;
    if (priceRange !== 'all') count++;
    if (minRating > 0) count++;
    if (selectedCategory !== 'all') count++;
    return count;
  };

  const clearSearch = () => {
    setSearchText('');
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
      onPress={() => {
        navigation.navigate('ProductDetail', { productId: item._id });
      }}
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
          {searchText.length > 0 && (
            <TouchableOpacity 
              onPress={clearSearch}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.slug}
            style={[
              styles.categoryTab,
              selectedCategory === cat.slug && styles.categoryTabActive
            ]}
            onPress={() => setSelectedCategory(cat.slug)}
          >
            <Ionicons
              name={cat.icon || 'cube-outline'}
              size={20}
              color={selectedCategory === cat.slug ? '#FF6B35' : '#666'}
            />
            <Text
              style={[
                styles.categoryTabText,
                selectedCategory === cat.slug && styles.categoryTabTextActive
              ]}
              numberOfLines={1}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filter Button */}
      <View style={styles.filterButtonContainer}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="options-outline" size={20} color="#FF6B35" />
          <Text style={styles.filterButtonText}>Bộ lọc</Text>
          {getActiveFilterCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bộ lọc sản phẩm</Text>
              <TouchableOpacity 
                onPress={() => setFilterModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Sort Options */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Sắp xếp theo</Text>
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterOption,
                      sortBy === option.value && styles.filterOptionActive
                    ]}
                    onPress={() => setSortBy(option.value)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        sortBy === option.value && styles.filterOptionTextActive
                      ]}
                    >
                      {option.label}
                    </Text>
                    {sortBy === option.value && (
                      <Ionicons name="checkmark-circle" size={20} color="#FF6B35" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Price Range */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Khoảng giá</Text>
                {priceRanges.map((range) => (
                  <TouchableOpacity
                    key={range.value}
                    style={[
                      styles.filterOption,
                      priceRange === range.value && styles.filterOptionActive
                    ]}
                    onPress={() => setPriceRange(range.value)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        priceRange === range.value && styles.filterOptionTextActive
                      ]}
                    >
                      {range.label}
                    </Text>
                    {priceRange === range.value && (
                      <Ionicons name="checkmark-circle" size={20} color="#FF6B35" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Rating Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Đánh giá</Text>
                {ratingOptions.map((rating) => (
                  <TouchableOpacity
                    key={rating.value}
                    style={[
                      styles.filterOption,
                      minRating === rating.value && styles.filterOptionActive
                    ]}
                    onPress={() => setMinRating(rating.value)}
                  >
                    <View style={styles.ratingOptionContent}>
                      <Text
                        style={[
                          styles.filterOptionText,
                          minRating === rating.value && styles.filterOptionTextActive
                        ]}
                      >
                        {rating.label}
                      </Text>
                      {rating.value > 0 && (
                        <View style={styles.starsContainer}>
                          {[...Array(5)].map((_, i) => (
                            <Ionicons
                              key={i}
                              name="star"
                              size={14}
                              color={i < rating.value ? '#FFB800' : '#E0E0E0'}
                            />
                          ))}
                        </View>
                      )}
                    </View>
                    {minRating === rating.value && (
                      <Ionicons name="checkmark-circle" size={20} color="#FF6B35" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Đặt lại</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Products */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      ) : (
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
          <View>
            <Ionicons name="notifications-outline" size={26} color="#666" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
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
  clearButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  categoriesScroll: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
  filterButtonContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE8E0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B35'
  },
  filterButtonText: {
    fontSize: 15,
    color: '#FF6B35',
    fontWeight: '600',
    marginLeft: 6
  },
  filterBadge: {
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6
  },
  filterBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  closeButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalScroll: {
    maxHeight: '70%'
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#F8F8F8'
  },
  filterOptionActive: {
    backgroundColor: '#FFE8E0',
    borderWidth: 1,
    borderColor: '#FF6B35'
  },
  filterOptionText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500'
  },
  filterOptionTextActive: {
    color: '#FF6B35',
    fontWeight: '600'
  },
  ratingOptionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 12
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
    alignItems: 'center'
  },
  resetButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600'
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    alignItems: 'center'
  },
  applyButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold'
  },
  sortScroll: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  sortContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 10
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0
  },
  sortButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35'
  },
  sortButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center'
  },
  sortButtonTextActive: {
    color: '#FFF',
    fontWeight: 'bold'
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
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  notificationBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
